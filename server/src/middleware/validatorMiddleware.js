import mongoose from 'mongoose';

/**
 * Validate registration payload
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validate login payload
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validate Mongo ObjectId param (e.g. :songId)
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName] || req.body[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID parameter: ${id}`
      });
    }
    next();
  };
};

/**
 * Validate user feedback payload
 */
export const validateFeedback = (req, res, next) => {
  const { songId, action } = req.body;
  const errors = [];

  if (!songId || !mongoose.Types.ObjectId.isValid(songId)) {
    errors.push('Valid songId is required');
  }

  const allowedActions = ['like', 'skip', 'complete', 'dislike'];
  if (!action || !allowedActions.includes(action)) {
    errors.push(`Action must be one of: ${allowedActions.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validate listening history payload
 */
export const validateHistory = (req, res, next) => {
  const { songId } = req.body;

  if (!songId || !mongoose.Types.ObjectId.isValid(songId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid songId is required'
    });
  }

  next();
};
