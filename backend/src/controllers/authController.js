const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register user & send OTP
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    const userCount = await User.countDocuments();

    if (userExists) {
      if (userExists.isEmailVerified) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // If not verified, update OTP and resend
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      userExists.otp = newOtp;
      userExists.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      if (userCount === 1) {
        userExists.role = 'Admin';
        userExists.status = 'Active';
      }
      await userExists.save();

      const message = `Your new confirmation OTP is ${newOtp}. It is valid for 10 minutes.`;
      
      try {
        await sendEmail({
          email: userExists.email,
          subject: 'New Confirmation OTP - AI Smart Inventory',
          message,
        });
      } catch (err) {
        console.error('Email failed to send', err);
        return res.status(500).json({ message: err.message || 'Email could not be sent' });
      }

      return res.status(201).json({ 
        message: 'New OTP sent to your email.', 
        email: userExists.email 
      });
    }

    // Generate random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpiresAt,
      role: userCount === 0 ? 'Admin' : 'Staff',
      status: userCount === 0 ? 'Active' : 'Pending',
    });

    if (user) {
      // Send OTP via Email
      const message = `Your confirmation OTP is ${otp}. It is valid for 10 minutes.`;
      
      try {
        await sendEmail({
          email: user.email,
          subject: 'Confirm your AI Smart Inventory Account',
          message,
        });
      } catch (err) {
        console.error('Email failed to send, ensure valid credentials', err);
        return res.status(500).json({ message: err.message || 'Email could not be sent' });
      }

      res.status(201).json({
        message: userCount === 0
          ? 'Admin account registered. Please check email for OTP.'
          : 'User registered. Please check email for OTP.',
        email: user.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    const adminExists = await User.exists({ role: 'Admin' });
    if (!adminExists) {
      user.role = 'Admin';
      user.status = 'Active';
    }
    await user.save();

    // If account is not explicitly 'Active' and not an admin, verify email but do not log in yet.
    if (user.status !== 'Active' && user.role !== 'Admin') {
      return res.json({
        message: 'Email verified! Please wait for Admin approval before logging in.',
        email: user.email,
        pendingApproval: true,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isEmailVerified) {
        return res.status(401).json({ message: 'Please verify your email via OTP first.' });
      }

      const adminExists = await User.exists({ role: 'Admin' });
      if (!adminExists) {
        user.role = 'Admin';
        user.status = 'Active';
        await user.save();
      }

      // Prevent lock-out: Admins are always allowed to log in. 
      // Staff must be explicitly 'Active' to enter.
      if (user.status !== 'Active' && user.role !== 'Admin') {
        return res.status(403).json({ message: 'Your account is pending Admin approval.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'Active', // Include status in response, default for old accounts
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    const message = `Your password reset OTP is ${otp}. It expires in 10 minutes.`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP - AI Smart Inventory',
        message,
      });
      res.json({ message: 'OTP sent to email' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change Password (Logged in)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged-in user (session validation)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    status: req.user.status || 'Active',
  });
};
