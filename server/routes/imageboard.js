const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (_, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// MongoDB Schemas
const ReplySchema = new mongoose.Schema({
  content: { type: String, required: true },
  image: String,
  created: { type: Date, default: Date.now },
  parentReply: { type: mongoose.Schema.Types.ObjectId, ref: 'Reply', default: null },
  threadID: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
  isOP: { type: Boolean, default: false },
  posterID: String
});

const ThreadSchema = new mongoose.Schema({
  board: { type: String, required: true },
  subject: String,
  content: { type: String, required: true },
  image: String,
  created: { type: Date, default: Date.now },
  lastBump: { type: Date, default: Date.now },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
  posterID: String,
  locked: { type: Boolean, default: false },
  sticky: { type: Boolean, default: false }
});

const Thread = mongoose.model('Thread', ThreadSchema);
const Reply = mongoose.model('Reply', ReplySchema);

// Helper function to generate anonymous poster ID
const generatePosterID = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Get all boards
router.get('/boards', (_, res) => {
  res.json(['p', 'cp', 'n', 's', 'v', 'k', 'a', 'c', 'T', 'Sp', 'Ph', 'm', 'G', 'r', 'd', 'Con', 'GIF', 'Rnt']);
});

// Get threads from a board
router.get('/board/:board', async (req, res) => {
  try {
    const threads = await Thread.find({ board: req.params.board })
      .sort({ sticky: -1, lastBump: -1 })
      .limit(15)
      .populate({
        path: 'replies',
        options: { sort: { created: 1 } }
      });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific thread with all replies
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

// Create new thread
router.post('/thread', upload.single('image'), async (req, res) => {
  try {
    if (!req.body.content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!req.body.board) {
      return res.status(400).json({ error: 'Board is required' });
    }

    const posterID = generatePosterID();

    const thread = new Thread({
      board: req.body.board,
      subject: req.body.subject,
      content: req.body.content,
      image: req.file ? req.file.filename : null,
      posterID: posterID
    });

    await thread.save();
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to thread
router.post('/thread/:id/reply', upload.single('image'), async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (thread.locked) {
      return res.status(403).json({ error: 'Thread is locked' });
    }

    const reply = new Reply({
      content: req.body.content,
      image: req.file ? req.file.filename : null,
      threadID: thread._id,
      parentReply: null,
      posterID: generatePosterID()
    });

    await reply.save();
    thread.replies.push(reply._id);
    thread.lastBump = Date.now();
    await thread.save();

    res.json(reply);
  } catch (err) {
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

    const thread = await Thread.findById(parentReply.threadID);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (thread.locked) {
      return res.status(403).json({ error: 'Thread is locked' });
    }

    const reply = new Reply({
      content: req.body.content,
      image: req.file ? req.file.filename : null,
      threadID: parentReply.threadID,
      parentReply: parentReply._id,
      posterID: generatePosterID()
    });

    await reply.save();
    thread.replies.push(reply._id);
    thread.lastBump = Date.now();
    await thread.save();

    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reply
router.delete('/reply/:id', async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Remove reply from thread's replies array
    await Thread.findByIdAndUpdate(reply.threadID, {
      $pull: { replies: reply._id }
    });

    await Reply.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reply deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin routes
// Delete thread
router.delete('/thread/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Delete all replies associated with the thread
    await Reply.deleteMany({ threadID: thread._id });
    
    // Delete the thread
    await Thread.findByIdAndDelete(req.params.id);
    res.json({ message: 'Thread and all replies deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle thread sticky
router.patch('/thread/:id/sticky', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    thread.sticky = !thread.sticky;
    await thread.save();
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle thread lock
router.patch('/thread/:id/lock', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    thread.locked = !thread.locked;
    await thread.save();
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
