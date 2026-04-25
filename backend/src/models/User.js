const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    picture: { type: String },
    monthlyLimit: { type: Number, default: 0 },
    categories: {
      type: [String],
      default: ['Food', 'Clothes', 'Grocery', 'Protein', 'Other'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
