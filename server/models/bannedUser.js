const mongoose = require('mongoose');

// Define the schema
const BannedUUdiSchema = new mongoose.Schema({
    uuid: String
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create and export the model
const BannedUUdi = mongoose.model('bannedUUID', BannedUUdiSchema);

module.exports = BannedUUdi;
