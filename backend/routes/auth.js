const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Send OTP
router.post('/send-otp', authController.sendOtp);

// Verify OTP and Sign Up
router.post('/signup', authController.signup);

// Verify OTP and Sign In
router.post('/signin', authController.signin);

module.exports = router;
