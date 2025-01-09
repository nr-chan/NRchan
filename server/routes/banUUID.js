const express = require('express');
const router = express.Router();
const BannedUUdi = require('../models/bannedUser');

router.get('/banUUID:id', async (req, res) => {
    try {
        const uuid= req.params.id;
        const ban = new BannedUUdi({
            uuid: uuid
        })
        console.log(ban);
        await ban.save(); 
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors
    }
});

module.exports = router;
