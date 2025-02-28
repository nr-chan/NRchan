const mongoose = require("mongoose")

const ThreadSchema = new mongoose.Schema({
  username: String,
  board: { type: String, required: true },
  subject: String,
  content: { type: String, required: true },
  image: {
    url: String,
    size: Number,
    width: Number,
    height: Number,
    thumbnailWidth: Number,
    thumbnailHeight: Number
  },
  created: { type: Date, default: Date.now },
  lastBump: { type: Date, default: Date.now },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
  posterID: String,
  locked: { type: Boolean, default: false },
  sticky: { type: Boolean, default: false },
  upvotes: {
    count: {type: Number, default: 0},
    ids: [{type: String}]
  },
  downvotes: {
    count: {type: Number, default: 0},
    ids: [{type: String}]
  },
});

const Thread = mongoose.model('Thread', ThreadSchema);


module.exports = Thread
