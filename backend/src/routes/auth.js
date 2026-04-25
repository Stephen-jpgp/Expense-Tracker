const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/google
// Verifies Google ID token, creates or finds user, returns JWT
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential required' });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({ googleId, email, name, picture });
    } else {
      // Update profile picture in case it changed
      user.picture = picture;
      user.name = name;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        monthlyLimit: user.monthlyLimit,
        categories: user.categories,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// GET /api/auth/me — returns current user from JWT
router.get('/me', protect, (req, res) => {
  const user = req.user;
  res.json({
    id: user._id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    monthlyLimit: user.monthlyLimit,
    categories: user.categories,
  });
});

// PATCH /api/auth/settings — update monthly limit and categories
router.patch('/settings', protect, async (req, res) => {
  try {
    const { monthlyLimit, categories } = req.body;
    const user = req.user;

    if (monthlyLimit !== undefined) user.monthlyLimit = monthlyLimit;
    if (categories !== undefined) user.categories = categories;

    await user.save();

    res.json({
      monthlyLimit: user.monthlyLimit,
      categories: user.categories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
