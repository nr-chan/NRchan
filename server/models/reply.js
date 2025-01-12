const mongoose = require("mongoose")

// MongoDB Schemas
const ReplySchema = new mongoose.Schema({
  username: String,
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
  parentReply: { type: mongoose.Schema.Types.ObjectId, ref: 'Reply', default: null },
  threadID: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
  isOP: { type: Boolean, default: false },
  upvotes: {
    count: {type: Number, default: 0},
    ids: [{type: String}]
  },
  downvotes: {
    count: {type: Number, default: 0},
    ids: [{type: String}]
  },
  posterID: String
});

const Reply = mongoose.model('Reply', ReplySchema);

module.exports = Reply;
