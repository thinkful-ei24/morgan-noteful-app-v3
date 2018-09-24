const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.set('timestamps', true);

userSchema.set('toObject', {
  getters: true,
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
    delete ret.password;
  }
});

module.exports = mongoose.model('User', userSchema);