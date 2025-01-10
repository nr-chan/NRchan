const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const Thread = require('../models/thread');
const Reply = require('../models/reply');
const BannedUUID = require('../models/bannedUser');
const rateLimiter = require('../utils/rateLimit');
const uuidToPosterId = require('../utils/uuidToPosterId');
const {uploadToR2} = require('../utils/uploadService');
const {deleteImage} = require('../utils/uploadService');
const validateCaptcha = require('../utils/validateCaptcha');

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

router.post('/', rateLimiter, upload.single('image'), async (req, res) => {
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
    const result = await BannedUUID.findOne({ uuid: posterID });
    if (result) {
      return res.status(403).json({ error: 'You have banned cause of your actions' });
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

// Get specific thread with replies
router.get('/:id', async (req, res) => {
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
router.post('/:id/reply', rateLimiter, upload.single('image'), async (req, res) => {
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
    const result = await BannedUUID.findOne({ uuid: posterID });
    if (result) {
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

//Delete thread
router.delete('/:id', async (req, res) => {
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

    if (thread.image){
        await deleteImage(thread.image.url);
    }

    await thread.deleteOne();

    res.json({ message: 'Thread and associated replies deleted successfully' });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
