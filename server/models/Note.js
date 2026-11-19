const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Required index for listing and reading user notes
noteSchema.index({ userId: 1 });

module.exports = mongoose.model('Note', noteSchema);
