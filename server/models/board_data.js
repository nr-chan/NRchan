const mongoose = require('mongoose');

// Define the schema
const boardSchema = new mongoose.Schema({
    boards: [
        {
            title: { type: String, required: true }, // Title of the category
            boards: { type: [String], required: true } // Array of board names under the category
        }
    ],
    links: { type: [String], required: true }, // Array of links
    board_list: { type: [String], required: true }, // Array of board short codes
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create and export the model
const boards_data = mongoose.model('boards', boardSchema);

module.exports = boards_data;
