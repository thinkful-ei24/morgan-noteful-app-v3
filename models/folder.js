const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  name: { type: String, required: true }
});

folderSchema.set('timestamps', true);

folderSchema.set('toObject', {
  getters: true,
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
});

folderSchema.index({ name: 1, userId: 1}, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);