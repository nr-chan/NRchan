const express = require('express');
const router = express.Router();
const Reply = require('../models/reply');
const BannedUUdi = require('../models/bannedUser');
const uuidToPosterId = require('../utils/uuidToPosterId');

//delete reply
router.delete('/:id', async (req, res) => {
  try {
    const uuid = req.headers['uuid'];
    //console.log('Received UUID: ', uuid);
    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }
    const posterID = await uuidToPosterId(req);
    const result = await BannedUUdi.findOne(posterID);
    console.log("result", result);
    if(result){
      console.log("result", result);
      return res.status(404).json({ error: 'You have banned cause of your actions' });
    }
    const reply = await Reply.findById(req.params.id);
    // console.log('Reply details:', reply);
    // console.log('PosterID from UUID:', posterID); // Debugging log
    // console.log('Reply posterID:', reply ? reply.posterID : 'Reply not found'); // Debugging log
    // console.log("pid1:", reply.posterID);
    // console.log("pid2:", posterID);
    // console.log("pid3: ", uuidToPosterId("7afa20e8-335d-4f86-b40e-fe66889125e8"));
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
