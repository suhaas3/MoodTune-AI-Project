import { User } from '../models/index.js';
import { sendTokenResponse, clearTokenCookie } from '../utils/token.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, bio, preferredMood, preferredGenres } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      bio,
      preferredMood: preferredMood || 'Energetic',
      preferredGenres: preferredGenres || ['Synthwave', 'Indie Pop']
    });

    sendTokenResponse(user, 201, res, 'Registration successful. Welcome to MoodTune AI!');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user with email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly include password because select: false in schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful. Welcome back!');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user and clear authentication cookie
 * @route   POST /api/auth/logout
 * @access  Private / Public
 */
export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, preferredMood, preferredGenres, avatar } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (preferredMood) fieldsToUpdate.preferredMood = preferredMood;
    if (preferredGenres) fieldsToUpdate.preferredGenres = preferredGenres;
    if (avatar) fieldsToUpdate.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};
