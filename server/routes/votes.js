const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');

router.post('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const { uuid, up } = req.body;

    // Determine if the user has upvoted or downvoted before
    const upVoted = thread.upvotes.ids.includes(uuid);
    const downVoted = thread.downvotes.ids.includes(uuid);

    if (!upVoted && !downVoted) {
      // Add a new vote
      const updateField = up ? 'upvotes' : 'downvotes';
      await Thread.findByIdAndUpdate(req.params.id, {
        $push: { [`${updateField}.ids`]: uuid },
        $set: { [`${updateField}.count`]: thread[updateField].count + 1 }
      });
    } else if (upVoted && !downVoted && !up) {
      // Switch from upvote to downvote
      await Thread.findByIdAndUpdate(req.params.id, {
        $pull: { 'upvotes.ids': uuid },
        $set: { 'upvotes.count': thread.upvotes.count - 1 },
        $push: { 'downvotes.ids': uuid },
        $setOnInsert: { 'downvotes.count': thread.downvotes.count + 1 }
      });
    } else if (downVoted && !upVoted && up) {
      // Switch from downvote to upvote
      await Thread.findByIdAndUpdate(req.params.id, {
        $pull: { 'downvotes.ids': uuid },
        $set: { 'downvotes.count': thread.downvotes.count - 1 },
        $push: { 'upvotes.ids': uuid },
        $setOnInsert: { 'upvotes.count': thread.upvotes.count + 1 }
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    res.status(200).json(
      {
        count: thread.upvotes.count - thread.downvotes.count
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

module.exports = router;
