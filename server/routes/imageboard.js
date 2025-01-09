const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Reply = require('../models/reply');
const Thread = require('../models/thread');
const uploadToR2 = require('../utils/uploadService');
// const deleteImage = require('../utils/uploadService');
const rateLimiter = require('../utils/rateLimit');
const uuidToPosterId = require('../utils/uuidToPosterId');
const validateCaptcha = require('../utils/validateCaptcha');
const BannedUUdi = require('../models/bannedUser');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|heic|mp4|mov|avi|mkv|webm/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Only images and videos are allowed.'));
    }
  },
});

// Get all boards
router.get('/boards', (_, res) => {
  res.json(['p', 'cp', 'n', 's', 'v', 'k', 'a', 'c', 'T', 'Sp', 'Ph', 'm', 'G', 'r', 'd', 'Con', 'GIF', 'Rnt']); // Example boards
});

// Get threads from a board
router.get('/board/:board', async (req, res) => {
  try {
    const threads = await Thread.find({ board: req.params.board })
      .sort({ sticky: -1, lastBump: -1 })
      .limit(15)
      .populate('replies');
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/thread', rateLimiter, upload.single('image'), async (req, res) => {
  try {
    const isValid = await validateCaptcha(req.body.captchaToken)

    if (!isValid) {
      return res.status(400).send({ error: 'Invalid CAPTCHA' })
    }

    if (!req.body.content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!req.body.board) {
      return res.status(400).json({ error: 'Board is required' });
    }

    let imageUrl = null;
    if (req.file) {
      const fileName = Date.now() + path.extname(req.file.originalname);
      const key = `uploads/${fileName}`;
      imageUrl = await uploadToR2(req.file, key);
    }

    const posterID = await uuidToPosterId(req);
    const result = await BannedUUdi.findOne(posterID);
    if(result){
      return res.status(404).json({ error: 'You have banned cause of your actions' });
    }
    const thread = new Thread({
      username: req.body.username,
      board: req.body.board,
      subject: req.body.subject,
      content: req.body.content,
      posterID: posterID,
      image: imageUrl,
    });

    await thread.save();
    res.json(thread);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent/', async (_, res) => {
  try {
    const pipeline = [
      {
        $facet: {
          'threads': [
            {
              $project: {
                _id: 1,
                type: { $literal: 'thread' },
                board: 1,
                subject: 1,
                content: 1,
                image: 1,
                created: 1,
                lastBump: 1,
                posterID: 1
              }
            },
            {
              $sort: { lastBump: -1 }
            },
            {
              $limit: 10
            }
          ],
          'replies': [
            {
              $lookup: {
                from: 'threads',
                localField: 'threadID',
                foreignField: '_id',
                as: 'thread'
              }
            },
            {
              $unwind: '$thread'
            },
            {
              $project: {
                _id: 1,
                type: { $literal: 'reply' },
                board: '$thread.board',
                content: 1,
                image: 1,
                created: 1,
                threadID: 1,
                posterID: 1
              }
            },
            {
              $sort: { created: -1 }
            },
            {
              $limit: 10
            }
          ]
        }
      },
      {
        $project: {
          combined: {
            $concatArrays: ['$threads', '$replies']
          }
        }
      },
      {
        $unwind: '$combined'
      },
      {
        $sort: {
          'combined.lastBump': -1,
          'combined.created': -1
        }
      },
      {
        $limit: 10
      }
    ];

    const results = await Thread.aggregate(pipeline);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No recent posts found'
      });
    }

    const formattedResults = results.map(item => item.combined);

    return res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific thread with replies
router.get('/thread/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Fetch all replies for this thread
    const replies = await Reply.find({ threadID: thread._id })
      .populate('parentReply')
      .sort({ created: 1 });

    const threadData = thread.toObject();
    threadData.replies = replies;

    res.json(threadData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to thread
router.post('/thread/:id/reply', rateLimiter, upload.single('image'), async (req, res) => {
  try {
    const isValid = await validateCaptcha(req.body.captchaToken)

    if (!isValid) {
      return res.status(400).send({ error: 'Invalid CAPTCHA' })
    }

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (thread.locked) {
      return res.status(403).json({ error: 'Thread is locked' });
    }

    let imageUrl = null;
    if (req.file) {
      const fileName = Date.now() + path.extname(req.file.originalname);
      const key = `uploads/${fileName}`;
      imageUrl = await uploadToR2(req.file, key);
    }

    const posterID = await uuidToPosterId(req);
    const result = await BannedUUdi.findOne(posterID);
    if(result){
      return res.status(404).json({ error: 'You have banned cause of your actions' });
    }
    
    const reply = new Reply({
      username: req.body.username,
      content: req.body.content,
      image: imageUrl,
      posterID: posterID,
      threadID: thread._id,
    });
    if (req.body.replyto != 'null') {
      reply.parentReply = req.body.replyto;
    }
    await reply.save();
    thread.replies.push(reply._id);
    thread.lastBump = Date.now();
    await thread.save();

    res.json(reply);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Reply to reply
router.post('/reply/:id/reply', upload.single('image'), async (req, res) => {
  try {
    const parentReply = await Reply.findById(req.params.id);
    if (!parentReply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const posterID = await uuidToPosterId(req);
    const reply = new Reply({
      content: req.body.content,
      image: req.file ? req.file.filename : null,
      posterID: posterID
    });

    await reply.save();
    parentReply.replies.push(reply._id);
    await parentReply.save();

    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Delete thread
router.delete('/thread/:id', async (req, res) => {
  try {
    const uuid = req.headers['uuid'];
    // console.log('Received UUID: ', uuid);
    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }
    const posterID = await uuidToPosterId(req);
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' })
    }

    if (thread.posterID !== posterID) {
      return res.status(403).json({ error: 'You are not authorized to delete this thread' });
    }
    await Reply.deleteMany({ threadID: thread._id });
    await thread.deleteOne();
    //r2 cleanup    
    // await deleteImage(thread.image.url);



    res.json({ message: 'Thread and associated replies deleted successfully' });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//delete reply
router.delete('/reply/:id', async (req, res) => {
  try {
    const uuid = req.headers['uuid'];
    console.log('Received UUID: ', uuid);
    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }
    const posterID = await uuidToPosterId(req);
    const reply = await Reply.findById(req.params.id);
    // console.log('Reply details:', reply);
    // console.log('PosterID from UUID:', posterID); // Debugging log
    // console.log('Reply posterID:', reply ? reply.posterID : 'Reply not found'); // Debugging log
    // console.log("pid1:", reply.posterID);
    // console.log("pid2:", posterID); console.log("pid3: ", uuidToPosterId("7afa20e8-335d-4f86-b40e-fe66889125e8"));
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    if (reply.posterID !== posterID) {
      return res.status(403).json({ error: 'You are not authorized to delete this reply' });
    }
    // await deleteImage(reply.image.url);
    await reply.deleteOne();
    res.json({ message: 'Reply deleted successfully' });
  } catch (err) {
    console.error('Server Error:', err.message); // Debugging log
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
