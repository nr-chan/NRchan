const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
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
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
  isOP: { type: Boolean, default: false },
  posterID: String // Anonymous ID for the poster
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
  sticky: { type: Boolean, default: false },
  locked: { type: Boolean, default: false }
});

const Thread = mongoose.model('Thread', ThreadSchema);
const Reply = mongoose.model('Reply', ReplySchema);

// Helper function to generate anonymous poster ID
const generatePosterID = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Routes

// Get all boards
router.get('/boards', (req, res) => {
  res.json(['a', 'b', 'g', 'v', 'p']); // Example boards
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

// Create new thread
router.post('/thread', upload.single('image'), async (req, res) => {
  try {
    console.log('Received request:', req.body); // Debug log
    console.log('File:', req.file); // Debug log

    if (!req.body.content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!req.body.board) {
      return res.status(400).json({ error: 'Board is required' });
    }

    const thread = new Thread({
      board: req.body.board,
      subject: req.body.subject,
      content: req.body.content,
      image: req.file ? req.file.filename : null
    });

    await thread.save();
    res.json(thread);
  } catch (err) {
    console.error('Error:', err); // Debug log
    res.status(500).json({ error: err.message });
  }
});


// Get specific thread with replies
router.get('/thread/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate({
        path: 'replies',
        populate: {
          path: 'replies'
        }
      });
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
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

    const reply = new Reply({
      content: req.body.content,
      image: req.file ? req.file.filename : null,
      posterID: generatePosterID()
    });

    await reply.save();
    parentReply.replies.push(reply._id);
    await parentReply.save();

    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin routes (would need proper authentication in production)

// Delete thread
router.delete('/thread/:id', async (req, res) => {
  try {
    await Thread.findByIdAndDelete(req.params.id);
    res.json({ message: 'Thread deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle thread sticky
router.patch('/thread/:id/sticky', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
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
    thread.locked = !thread.locked;
    await thread.save();
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
