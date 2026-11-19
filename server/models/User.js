const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  interests: [{ type: String }]
}, { timestamps: true });

// Required indexes per prompt instructions
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ interests: 1 });

module.exports = mongoose.model('User', userSchema);
