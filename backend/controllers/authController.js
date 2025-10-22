const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Hardcoded sample police credentials (for testing only)
const SAMPLE_USERS = [
  {
    username: 'police1',
    password: 'password123',
    name: 'Officer Ramesh Kumar',
    email: 'ramesh.kumar@police.gov.in',
    phone: '9876543210',
    role: 'police'
  },
  {
    username: 'police2',
    password: 'password123',
    name: 'Officer Sita Sharma',
    email: 'sita.sharma@police.gov.in',
    phone: '9876543211',
    role: 'police'
  },
  {
    username: 'admin',
    password: 'admin123',
    name: 'Traffic Commissioner',
    email: 'commissioner@police.gov.in',
    phone: '9876543212',
    role: 'admin'
  }
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, password, name, email, phone, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      password,
      name,
      email,
      phone,
      role: role || 'police'
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate user input
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    // First check if it's a sample user
    const sampleUser = SAMPLE_USERS.find(user => user.username === username && user.password === password);
    
    if (sampleUser) {
      // Create token for sample user
      const token = jwt.sign(
        { 
          id: 'sample_' + sampleUser.username,
          name: sampleUser.name,
          role: sampleUser.role 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE }
      );

      return res.status(200).json({
        success: true,
        token,
        data: {
          id: 'sample_' + sampleUser.username,
          name: sampleUser.name,
          email: sampleUser.email,
          role: sampleUser.role
        }
      });
    }

    // If not a sample user, check database
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Check if it's a sample user
    if (req.user.id && req.user.id.startsWith('sample_')) {
      const username = req.user.id.replace('sample_', '');
      const sampleUser = SAMPLE_USERS.find(user => user.username === username);
      
      if (sampleUser) {
        return res.status(200).json({
          success: true,
          data: {
            id: req.user.id,
            name: sampleUser.name,
            email: sampleUser.email,
            role: sampleUser.role
          }
        });
      }
    }

    // If not a sample user, get from database
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Export all functions
module.exports = {
  register,
  login,
  getMe
};