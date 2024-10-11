const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Reply = require('../models/reply');
const Thread = require('../models/thread');

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


// Helper function to generate anonymous poster ID
const generatePosterID = () => {
  return Math.random().toString(36).substring(2, 8);
};


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
      posterID: generatePosterID(),
      image: req.file ? req.file.filename : null
    });

    await thread.save();
    res.json(thread);
  } catch (err) {
    console.error('Error:', err); // Debug log
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent/', async(_, res) => {
    try {
        const pipeline = [
            {
                $facet: {
                    // Get recent threads
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
                    // Get recent replies
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
            // Combine threads and replies
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
            // Sort all results by lastBump/created
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

        // Execute the aggregation pipeline on the threads collection
        const results = await Thread.aggregate(pipeline);

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No recent posts found'
            });
        }

        // Format the final response
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
router.post('/thread/:id/reply', upload.single('image'), async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    console.log(thread);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (thread.locked) {
      return res.status(403).json({ error: 'Thread is locked' });
    }

    const reply = new Reply({
      content: req.body.content,
      image: req.file ? req.file.filename : null,
      posterID: generatePosterID(),
      threadID:thread._id,
    });
    if(req.body.replyto !='null'){
      reply.parentReply = req.body.replyto;
    }
    await reply.save();
    thread.replies.push(reply._id);
    thread.lastBump = Date.now();
    console.log(reply);
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
