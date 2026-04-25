const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/expenses?month=2024-01
// Returns all expenses for given month (defaults to current month)
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;

    let startDate, endDate;

    if (month) {
      // Expects format: YYYY-MM
      const [year, mon] = month.split('-').map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 1);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// GET /api/expenses/all — all expenses (for export)
router.get('/all', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses — create new expense
// Accepts any fields due to strict:false on the model
router.post('/', async (req, res) => {
  try {
    const { amount, category, note, date, ...extraFields } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ message: 'Amount and category are required' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      amount: parseFloat(amount),
      category,
      note: note || '',
      date: date ? new Date(date) : new Date(),
      ...extraFields, // any future fields will be stored as-is
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id, // ensures users can only delete their own
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

// GET /api/expenses/summary?month=2024-01
// Returns total + breakdown by category
router.get('/summary', async (req, res) => {
  try {
    const { month } = req.query;

    let startDate, endDate;

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 1);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const summary = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalSpent = summary.reduce((sum, item) => sum + item.total, 0);

    res.json({
      totalSpent,
      byCategory: summary.map((s) => ({
        category: s._id,
        total: s.total,
        count: s.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

module.exports = router;
