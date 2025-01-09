const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const uuid = uuidv4();
    res.status(200).json({uuid: uuid});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
