const express = require('express');
const router = express.Router();
const boards_data = require('../models/board_data');

router.get('/boards_data', async (req, res) => {
    try {
        const boards = await boards_data
            .find()
        console.log(boards);
        res.json(boards[0]); // Send the fetched data as JSON
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors
    }
});

module.exports = router;
