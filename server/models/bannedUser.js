const mongoose = require('mongoose');

const BannedUUIDSchema = new mongoose.Schema({
    uuid: {
        type: String,
        unique: true
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const BannedUUID = mongoose.model('banneduser', BannedUUIDSchema);

module.exports = BannedUUID;
