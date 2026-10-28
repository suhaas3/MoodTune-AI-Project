import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { generateToken } from '../utils/token.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  validateRegister, 
  validateLogin, 
  validateFeedback, 
  validateHistory,
  validateObjectId 
} from '../middleware/validatorMiddleware.js';
import { errorHandler, notFound } from '../middleware/errorMiddleware.js';
import User from '../models/User.js';
import Song from '../models/Song.js';

process.env.JWT_SECRET = 'test_secret_for_unit_tests_32_characters_minimum';
process.env.JWT_EXPIRES_IN = '7d';

describe('MoodTune AI - Backend Unit & Security Tests', () => {

  // 1. Password Hashing (bcrypt)
  describe('Password Security (bcrypt)', () => {
    it('should hash passwords securely and verify match correctly', async () => {
      const password = 'mySecretPassword123';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      assert.notEqual(password, hash);
      assert.ok(hash.startsWith('$2'));

      const isMatch = await bcrypt.compare(password, hash);
      assert.equal(isMatch, true);

      const isWrongMatch = await bcrypt.compare('wrongPassword', hash);
      assert.equal(isWrongMatch, false);
    });

    it('User model toJSON should strip password and __v', () => {
      const user = new User({
        name: 'Alex Data',
        email: 'alex@example.com',
        password: 'superSecretHashedPassword123'
      });

      const json = user.toJSON();
      assert.equal(json.password, undefined);
      assert.equal(json.__v, undefined);
      assert.equal(json.email, 'alex@example.com');
    });
  });

  // 2. JWT Generation & Verification
  describe('JWT Token & Cookie Authentication', () => {
    it('should sign and verify valid JWT tokens', () => {
      const userId = '64b0f9f3c1a2b3c4d5e6f7a8';
      const token = generateToken(userId);

      assert.ok(token);
      assert.equal(typeof token, 'string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      assert.equal(decoded.id, userId);
    });

    it('authMiddleware should reject request when token is missing', async () => {
      const req = { cookies: {}, headers: {} };
      let statusCode = 200;
      let responseBody = {};

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => { responseBody = data; }
          };
        }
      };

      await protect(req, res, () => {});
      assert.equal(statusCode, 401);
      assert.equal(responseBody.success, false);
    });
  });

  // 3. Validation Middleware
  describe('Request Validation Middleware', () => {
    it('validateRegister should fail if email is invalid', () => {
      const req = {
        body: { name: 'Test User', email: 'not-an-email', password: '123' }
      };
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (data) => { responseBody = data; } };
        }
      };

      validateRegister(req, res, () => {});
      assert.equal(statusCode, 400);
      assert.equal(responseBody.success, false);
      assert.ok(responseBody.errors.length >= 2); // invalid email and password too short
    });

    it('validateRegister should pass if fields are valid', () => {
      const req = {
        body: { name: 'Valid User', email: 'valid@university.edu', password: 'password123' }
      };
      let nextCalled = false;
      const res = {};

      validateRegister(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, true);
    });

    it('validateLogin should fail if fields are missing', () => {
      const req = { body: {} };
      let statusCode = 200;
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        }
      };

      validateLogin(req, res, () => {});
      assert.equal(statusCode, 400);
    });

    it('validateObjectId should reject invalid hex string', () => {
      const req = { params: { id: 'invalid-id-xyz' } };
      let statusCode = 200;
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        }
      };

      validateObjectId('id')(req, res, () => {});
      assert.equal(statusCode, 400);
    });

    it('validateFeedback should accept allowed actions (like, skip)', () => {
      const req = {
        body: {
          songId: '64b0f9f3c1a2b3c4d5e6f7a8',
          action: 'skip'
        }
      };
      let nextCalled = false;
      validateFeedback(req, {}, () => { nextCalled = true; });
      assert.equal(nextCalled, true);
    });

    it('validateFeedback should reject disallowed actions', () => {
      const req = {
        body: {
          songId: '64b0f9f3c1a2b3c4d5e6f7a8',
          action: 'invalid_action'
        }
      };
      let statusCode = 200;
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        }
      };
      validateFeedback(req, res, () => {});
      assert.equal(statusCode, 400);
    });
  });

  // 4. Centralized Error Handler
  describe('Error Handling Middleware', () => {
    it('errorHandler should handle Mongoose CastError as 404', () => {
      const err = { name: 'CastError', value: '123badId' };
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (data) => { responseBody = data; } };
        }
      };

      errorHandler(err, {}, res, () => {});
      assert.equal(statusCode, 404);
      assert.equal(responseBody.success, false);
    });

    it('errorHandler should handle duplicate key (code 11000) as 409', () => {
      const err = { code: 11000, keyValue: { email: 'test@test.com' } };
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (data) => { responseBody = data; } };
        }
      };

      errorHandler(err, {}, res, () => {});
      assert.equal(statusCode, 409);
      assert.equal(responseBody.success, false);
    });

    it('notFound should return 404 with helpful message', () => {
      const req = { method: 'GET', originalUrl: '/api/non-existent-endpoint' };
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (data) => { responseBody = data; } };
        }
      };

      notFound(req, res, () => {});
      assert.equal(statusCode, 404);
      assert.ok(responseBody.message.includes('/api/non-existent-endpoint'));
    });
  });

  // 5. Schema Structure & Validation
  describe('Mongoose Schemas Validation', () => {
    it('Song schema requires title, artist, genre, mood, duration, coverUrl, audioUrl', () => {
      const emptySong = new Song({});
      const err = emptySong.validateSync();
      assert.ok(err.errors.title);
      assert.ok(err.errors.artist);
      assert.ok(err.errors.genre);
      assert.ok(err.errors.mood);
      assert.ok(err.errors.duration);
      assert.ok(err.errors.coverUrl);
      assert.ok(err.errors.audioUrl);
    });

    it('Song schema accepts valid 4 moods', () => {
      ['Happy', 'Energetic', 'Relaxed', 'Sad'].forEach(mood => {
        const song = new Song({
          title: 'Test Song',
          artist: 'Test Artist',
          genre: 'Pop',
          mood,
          duration: 180,
          coverUrl: 'http://example.com/c.jpg',
          audioUrl: 'http://example.com/a.mp3'
        });
        const err = song.validateSync();
        assert.equal(err, undefined);
      });
    });

    it('Song schema rejects invalid mood', () => {
      const song = new Song({
        title: 'Test Song',
        artist: 'Test Artist',
        genre: 'Pop',
        mood: 'Angry', // not one of the 4 supported moods
        duration: 180,
        coverUrl: 'http://example.com/c.jpg',
        audioUrl: 'http://example.com/a.mp3'
      });
      const err = song.validateSync();
      assert.ok(err.errors.mood);
    });
  });
});
