const express = require('express');
const router = express.Router();
const BannedUUID = require('../models/bannedUser');

router.get('/:id', async (req, res) => {
    try {
        const uuid = req.params.id;
        const ban = new BannedUUID({
            uuid: uuid
        })
        console.log(ban);
        await ban.save();
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors
    }
});

module.exports = router;
