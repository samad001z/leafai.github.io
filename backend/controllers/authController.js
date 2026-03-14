// In-memory OTP storage for demo mode
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// In-memory user storage for demo mode
const userStore = new Map();

// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiry (5 minutes)
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // In production, send OTP via SMS service
    // For demo, log it to console
    console.log(`[DEMO] OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully. In demo mode, use 123456.',
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Sign Up
exports.signup = async (req, res) => {
  try {
    const { name, phone, otp } = req.body;

    if (!name || !phone || !otp) {
      return res.status(400).json({ error: 'Name, phone, and OTP are required' });
    }

    // Verify OTP
    const storedData = otpStore.get(phone);
    
    if (!storedData) {
      return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Clear OTP after successful verification
    otpStore.delete(phone);

    // Create user (in demo mode, store in memory)
    const user = {
      id: Date.now().toString(),
      name,
      phone,
      createdAt: new Date().toISOString(),
    };
    userStore.set(phone, user);

    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Sign In
exports.signin = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    // Verify OTP
    const storedData = otpStore.get(phone);
    
    if (!storedData) {
      return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Clear OTP after successful verification
    otpStore.delete(phone);

    // Get or create user (in demo mode)
    let user = userStore.get(phone);
    if (!user) {
      user = {
        id: Date.now().toString(),
        name: 'Farmer',
        phone,
        createdAt: new Date().toISOString(),
      };
      userStore.set(phone, user);
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
