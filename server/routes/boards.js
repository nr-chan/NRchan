const express = require('express');
const router = express.Router();

router.get('/', (_, res) => {
  res.json(['p', 'cp', 'n', 's', 'v', 'k', 'a', 'c', 'T', 'Sp', 'Ph', 'm', 'G', 'r', 'd', 'Con', 'GIF', 'Rnt']); // Example boards
});

module.exports = router;
