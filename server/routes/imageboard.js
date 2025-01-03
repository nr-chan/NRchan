const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Reply = require('../models/reply');
const Thread = require('../models/thread');
const uploadToR2  = require('../utils/uploadService');
const rateLimiter = require('../utils/rateLimit');
const ipToID = require('../utils/ipToId');

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
  res.json(['p','cp', 'n', 's','v', 'k', 'a','c', 'T', 'Sp', 'Ph', 'm', 'G','r', 'd', 'Con', 'GIF', 'Rnt']); // Example boards
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
    
    const posterID = await ipToID(req); 

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

router.get('/recent/', async(_, res) => {
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

    const posterID = await ipToID(req); 
    const reply = new Reply({
      username: req.body.username,
      content: req.body.content,
      image: imageUrl,
      posterID: posterID,
      threadID:thread._id,
    });
    if(req.body.replyto !='null'){
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

    const posterID = await ipToID(req); 
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

module.exports = router;
