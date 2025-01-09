const express = require('express');
const multer = require('multer');
const router = express.Router();
const Reply = require('../models/reply');
const uuidToPosterId = require('../utils/uuidToPosterId');

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

// Reply to reply
router.post('/:id/reply', upload.single('image'), async (req, res) => {
  try {
    const parentReply = await Reply.findById(req.params.id);
    if (!parentReply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const posterID = await uuidToPosterId(req);
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

//delete reply
router.delete('/:id', async (req, res) => {
  try {
    const uuid = req.headers['uuid'];
    //console.log('Received UUID: ', uuid);
    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }
    const posterID = await uuidToPosterId(req);
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
