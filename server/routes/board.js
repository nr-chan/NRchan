const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');
const { redisCacheMiddleware } = require('../utils/redis');

router.get('/:board',redisCacheMiddleware(), async (req, res) => {
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

module.exports = router;
