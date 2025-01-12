const express = require('express');
const router = express.Router();
const Reply = require('../models/reply');
const BannedUUID = require('../models/bannedUser');
const uuidToPosterId = require('../utils/uuidToPosterId');
const {deleteImage} = require('../utils/uploadService');
const { invalidateCache } = require('../utils/redis');
const Thread = require('../models/thread');

router.delete('/:id', async (req, res) => {
  try {
    const uuid = req.headers['uuid'];

    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }
    const posterID = await uuidToPosterId(req);

    const result = await BannedUUID.findOne({ uuid: posterID });
    if (result) {
      return res.status(403).json({ error: 'You have banned cause of your actions' });
    }

    const reply = await Reply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    if (reply.posterID !== posterID) {
      return res.status(403).json({ error: 'You are not authorized to delete this reply' });
    }

    const threadID = reply.threadID;
    const thread = await Thread.findById(threadID);
    
    //Invalidate Thread and Board cache
    await invalidateCache(`/thread/${threadID}`);
    await invalidateCache(`/board/${thread.board}`);

    //Invalidate Board Stats and Data
    await invalidateCache(`/boards/stats`);
    await invalidateCache(`/boards/data`);

    //Invalidate Recent Posts
    await invalidateCache(`/recent/`);

    if (reply.image){
        await deleteImage(reply.image.url);
    }

    await reply.deleteOne();

    res.json({ message: 'Reply deleted successfully' });
  } catch (err) {
    console.error('Server Error:', err.message); // Debugging log
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
