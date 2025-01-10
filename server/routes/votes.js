const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');

router.post('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const upVoted = thread.upvotes.ids.includes(req.body.uuid);
    const downVoted = thread.downvotes.ids.includes(req.body.uuid);

    if (!upVoted && !downVoted) {
        if (req.body.up) {
          await Thread.findByIdAndUpdate(req.params.id, {
              $push : {'upvotes.ids': req.body.uuid},
              $inc : {'upvotes.count': 1}
          })
        } else {
          await Thread.findByIdAndUpdate(req.params.id, {
              $push : {'downvotes.ids': req.body.uuid},
              $inc : {'downvotes.count': 1}
          })
        }
    } else if (upVoted && !downVoted && !req.body.up) {
        await Thread.findByIdAndUpdate(req.params.id, {
            $pull: {"upvotes.ids": req.body.uuid },
            $inc: {"upvotes.count": -1}
          })
        await Thread.findByIdAndUpdate(req.params.id, {
            $push : {'downvotes.ids': req.body.uuid},
            $inc : {'downvotes.count': 1}
        })
    } else if (downVoted && !upVoted && req.body.up) {
        await Thread.findByIdAndUpdate(req.params.id, {
            $pull: {"downvotes.ids": req.body.uuid },
            $inc: {"downvotes.count": -1}
          })
        await Thread.findByIdAndUpdate(req.params.id, {
            $push : {'upvotes.ids': req.body.uuid},
            $inc : {'upvotes.count': 1}
        })
    }
    res.status(200).json({success: true});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

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
