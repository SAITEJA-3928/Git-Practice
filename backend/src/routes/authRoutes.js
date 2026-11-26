const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, getJwtSecret } = require('../middleware/auth');

const router = express.Router();

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    addresses: user.addresses || []
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Name, valid email, and password (min 6 chars) are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });

    res.status(201).json({
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

router.post('/addresses', protect, async (req, res, next) => {
  try {
    const { fullName, phone, pincode, street, city, state, label } = req.body;
    if (!fullName || !phone || !pincode || !street || !city || !state) {
      return res.status(400).json({ message: 'All address fields are required' });
    }
    req.user.addresses.push({ fullName, phone, pincode, street, city, state, label });
    await req.user.save();
    res.status(201).json({ addresses: req.user.addresses });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
