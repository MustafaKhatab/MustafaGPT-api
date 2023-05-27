const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    messages: [
      {
        _id: false,
        role: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
  });

module.exports = mongoose.model('Chat', chatSchema)