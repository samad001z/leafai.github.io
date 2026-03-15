const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// Send OTP
router.post('/send-otp', authController.sendOtp);

// Verify OTP and Sign Up
router.post('/signup', authController.signup);

// Verify OTP and Sign In
router.post('/signin', authController.signin);

// Unified verify OTP endpoint
router.post('/verify-otp', authController.verifyOtp);

// Current authenticated user
router.get('/me', requireAuth, authController.me);

module.exports = router;
