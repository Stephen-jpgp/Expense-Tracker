const mongoose = require('mongoose');

// strict: false allows extra fields to be stored freely
// This means you can add new input fields anytime without losing old data
const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    // Any additional fields you add in future will be stored here automatically
  },
  {
    strict: false,   // allows dynamic fields without schema changes
    timestamps: true // createdAt + updatedAt auto-managed
  }
);

// Index for fast monthly queries per user
expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
