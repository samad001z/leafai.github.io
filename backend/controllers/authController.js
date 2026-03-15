const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { getSupabaseAuthClient, isSupabaseAuthConfigured } = require('../lib/supabaseClient');
const OTP = require('../models/OTP');

const PHONE_E164_REGEX = /^\+[1-9]\d{7,14}$/;

const normalizePhone = (phone) => {
  const cleaned = String(phone || '').trim().replace(/[\s\-()]/g, '');
  if (!cleaned) return '';

  // If user enters 10-digit Indian number, auto-prefix +91.
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // Common local formats that miss the leading + sign.
  if (/^91\d{10}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  if (/^0\d{10}$/.test(cleaned)) {
    return `+91${cleaned.slice(1)}`;
  }

  return cleaned;
};

const mapOtpError = (message = '') => {
  const text = String(message || '').toLowerCase();

  if (text.includes('phone provider') || text.includes('twilio') || text.includes('messagebird') || text.includes('sms')) {
    return 'Supabase phone OTP provider is not configured. Enable Phone auth and SMS provider in Supabase Auth settings.';
  }

  if (text.includes('invalid phone') || text.includes('e.164')) {
    return 'Invalid phone number format. Use +91XXXXXXXXXX or a valid E.164 number.';
  }

  if (text.includes('rate limit') || text.includes('too many requests')) {
    return 'Too many OTP attempts. Please wait a minute and retry.';
  }

  return message || 'Failed to send OTP';
};

const hasDirectTwilioConfig = () => {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_MESSAGING_SERVICE_SID
  );
};

const shouldPreferDirectTwilio = () => {
  return String(process.env.OTP_DIRECT_TWILIO || '').toLowerCase() === 'true';
};

const otpMemoryStore = new Map();
const getOtpTtlMs = () => {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES || 5);
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 * 1000 : 5 * 60 * 1000;
};

const setMemoryOtp = ({ phone, otp }) => {
  otpMemoryStore.set(phone, {
    otp: String(otp),
    expiresAt: Date.now() + getOtpTtlMs(),
  });
};

const getMemoryOtp = (phone) => {
  const entry = otpMemoryStore.get(phone);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    otpMemoryStore.delete(phone);
    return null;
  }

  return String(entry.otp);
};

const clearMemoryOtp = (phone) => {
  otpMemoryStore.delete(phone);
};

const isMongoReady = () => mongoose.connection?.readyState === 1;

const canFallbackToTwilio = (message = '') => {
  const text = String(message || '').toLowerCase();
  return (
    text.includes('phone provider') ||
    text.includes('twilio') ||
    text.includes('messagebird') ||
    text.includes('sms') ||
    text.includes('authentication error')
  );
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendDirectTwilioOtp = async ({ phone, otp }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error('Twilio direct credentials are not configured on backend');
  }

  const body = new URLSearchParams({
    To: phone,
    MessagingServiceSid: messagingServiceSid,
    Body: `Your LeafAI OTP is ${otp}. It expires in 5 minutes.`,
  });

  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.message || `Twilio SMS failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
};

const persistOtp = async ({ phone, otp }) => {
  if (!isMongoReady()) {
    setMemoryOtp({ phone, otp });
    return 'memory';
  }

  try {
    await OTP.deleteMany({ phone });
    await OTP.create({ phone, otp });
    return 'mongo';
  } catch (error) {
    console.warn('Persist OTP fallback to memory:', error.message);
    setMemoryOtp({ phone, otp });
    return 'memory';
  }
};

const readOtp = async (phone) => {
  if (isMongoReady()) {
    try {
      const otpRecord = await OTP.findOne({ phone }).sort({ createdAt: -1 });
      if (otpRecord?.otp) {
        return String(otpRecord.otp);
      }
    } catch (error) {
      console.warn('Read OTP fallback to memory:', error.message);
    }
  }

  return getMemoryOtp(phone);
};

const clearOtp = async (phone) => {
  if (isMongoReady()) {
    try {
      await OTP.deleteMany({ phone });
    } catch (error) {
      console.warn('Clear OTP fallback to memory:', error.message);
    }
  }

  clearMemoryOtp(phone);
};

const issueLocalPhoneSessionToken = ({ phone, name }) => {
  return issueSessionToken({
    id: `phone:${phone}`,
    phone,
    name: name || 'Farmer',
  });
};

const sendUsingDirectTwilio = async ({ phone, res }) => {
  const otp = generateOtp();
  await sendDirectTwilioOtp({ phone, otp });
  const storage = await persistOtp({ phone, otp });

  res.json({
    success: true,
    message: 'OTP sent successfully',
    phone,
    provider: 'twilio-direct',
    storage,
  });
};

const issueSessionToken = ({ id, phone, name }) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET missing on backend');
  }

  return jwt.sign(
    {
      sub: id,
      phone,
      name: name || 'Farmer',
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

const ensureSupabaseAuth = (res) => {
  if (!isSupabaseAuthConfigured) {
    res.status(500).json({ error: 'Supabase auth is not configured on backend' });
    return null;
  }

  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    res.status(500).json({ error: 'Supabase auth client initialization failed' });
    return null;
  }

  return supabase;
};

// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!PHONE_E164_REGEX.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number. Use E.164 format like +91XXXXXXXXXX' });
    }

    if (shouldPreferDirectTwilio()) {
      if (!hasDirectTwilioConfig()) {
        return res.status(500).json({ error: 'OTP_DIRECT_TWILIO is enabled but Twilio credentials are missing' });
      }

      await sendUsingDirectTwilio({ phone, res });
      return;
    }

    const supabase = ensureSupabaseAuth(res);
    if (!supabase) return;

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('Supabase send OTP error:', error.message);

      if (hasDirectTwilioConfig() && canFallbackToTwilio(error.message)) {
        try {
          await sendUsingDirectTwilio({ phone, res });
          return;
        } catch (twilioError) {
          console.error('Direct Twilio fallback send OTP error:', twilioError.message);
          return res.status(400).json({ error: mapOtpError(twilioError.message) });
        }
      }

      return res.status(400).json({ error: mapOtpError(error.message) });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      phone,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify OTP (used for both signup/signin)
exports.verifyOtp = async (req, res) => {
  try {
    const { otp, name } = req.body || {};
    const phone = normalizePhone(req.body?.phone);

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    if (shouldPreferDirectTwilio()) {
      const storedOtp = await readOtp(phone);
      if (!storedOtp || storedOtp.trim() !== String(otp).trim()) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      await clearOtp(phone);

      const sessionToken = issueLocalPhoneSessionToken({ phone, name });
      return res.json({
        success: true,
        message: 'OTP verified successfully',
        token: sessionToken,
        user: {
          id: `phone:${phone}`,
          name: name || 'Farmer',
          phone,
        },
      });
    }

    const supabase = ensureSupabaseAuth(res);
    if (!supabase) return;

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: String(otp).trim(),
      type: 'sms',
    });

    if (error) {
      console.error('Supabase verify OTP error:', error.message);

      if (hasDirectTwilioConfig() && canFallbackToTwilio(error.message)) {
        const storedOtp = await readOtp(phone);
        if (!storedOtp || storedOtp.trim() !== String(otp).trim()) {
          return res.status(400).json({ error: 'Invalid OTP' });
        }

        await clearOtp(phone);

        const sessionToken = issueLocalPhoneSessionToken({ phone, name });
        return res.json({
          success: true,
          message: 'OTP verified successfully',
          token: sessionToken,
          user: {
            id: `phone:${phone}`,
            name: name || 'Farmer',
            phone,
          },
        });
      }

      return res.status(400).json({ error: mapOtpError(error.message) || 'Invalid OTP' });
    }

    const authUser = data?.user;
    if (!authUser?.id) {
      return res.status(500).json({ error: 'Failed to verify OTP user session' });
    }

    const sessionToken = issueSessionToken({
      id: authUser.id,
      phone: authUser.phone || phone,
      name: name || authUser.user_metadata?.name || 'Farmer',
    });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token: sessionToken,
      user: {
        id: authUser.id,
        name: name || authUser.user_metadata?.name || 'Farmer',
        phone: authUser.phone || phone,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

// Backward-compatible wrappers
exports.signup = exports.verifyOtp;
exports.signin = exports.verifyOtp;

exports.me = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user?.id,
        name: req.user?.name || 'Farmer',
        phone: req.user?.phone,
      },
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
