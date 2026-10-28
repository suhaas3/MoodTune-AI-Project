import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { register, login, logout, getMe } from '../controllers/authController.js';
import { getSongs, getSongsByMood } from '../controllers/songController.js';
import { addFavourite, removeFavourite } from '../controllers/favouriteController.js';
import { recordListeningHistory, getListeningHistory } from '../controllers/historyController.js';
import { recordFeedback } from '../controllers/feedbackController.js';
import { getPersonalizedRecommendations } from '../controllers/recommendationController.js';
import { User, Song, Favourite, ListeningHistory, UserFeedback } from '../models/index.js';

process.env.JWT_SECRET = 'test_secret_for_controller_tests_32_chars_long';
process.env.JWT_EXPIRES_IN = '7d';

const mockUserId = '64b0f9f3c1a2b3c4d5e6f7a1';
const mockSongId = '64b0f9f3c1a2b3c4d5e6f7b2';

const mockUser = {
  _id: mockUserId,
  name: 'Test Student',
  email: 'test@moodtune.ai',
  preferredMood: 'Energetic',
  preferredGenres: ['Synthwave'],
  matchPassword: async (pwd) => pwd === 'password123',
  toJSON: () => ({ _id: mockUserId, name: 'Test Student', email: 'test@moodtune.ai' })
};

const mockSong = {
  _id: mockSongId,
  title: 'Neon Groove',
  artist: 'Synth Master',
  genre: 'Synthwave',
  mood: 'Energetic',
  duration: 180,
  audioFeatures: { tempo: 130, valence: 0.8, arousal: 0.9 },
  playCount: 10,
  likeCount: 5,
  toObject: () => ({
    _id: mockSongId,
    title: 'Neon Groove',
    artist: 'Synth Master',
    genre: 'Synthwave',
    mood: 'Energetic'
  }),
  save: async () => true
};

const createMockRes = () => {
  const res = {
    statusCode: 200,
    cookieName: null,
    cookieVal: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    cookie(name, val, options) {
      this.cookieName = name;
      this.cookieVal = val;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
};

describe('MoodTune AI - Controller & Business Logic Tests (In-Process)', () => {

  // 1. Auth Registration
  it('register should create user and set auth cookie', async () => {
    User.findOne = async () => null;
    User.create = async () => mockUser;

    const req = {
      body: {
        name: 'Test Student',
        email: 'test@moodtune.ai',
        password: 'password123'
      }
    };
    const res = createMockRes();

    await register(req, res, () => {});
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'test@moodtune.ai');
    assert.equal(res.cookieName, 'token');
    assert.ok(res.cookieVal);
  });

  // 2. Auth Login
  it('login should verify credentials and set auth cookie', async () => {
    User.findOne = () => ({
      select: async () => mockUser
    });

    const req = {
      body: {
        email: 'test@moodtune.ai',
        password: 'password123'
      }
    };
    const res = createMockRes();

    await login(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.cookieName, 'token');
  });

  // 3. Auth Logout
  it('logout should clear auth cookie', async () => {
    const req = {};
    const res = createMockRes();

    await logout(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.cookieName, 'token');
    assert.equal(res.cookieVal, 'none');
  });

  // 4. Current User Profile
  it('getMe should return current user profile', async () => {
    User.findById = async () => mockUser;
    const req = { user: { id: mockUserId } };
    const res = createMockRes();

    await getMe(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.user.email, 'test@moodtune.ai');
  });

  // 5. Browse Songs
  it('getSongs should query and return songs catalog', async () => {
    Song.find = () => ({
      sort: () => ({
        skip: () => ({
          limit: async () => [mockSong]
        })
      })
    });
    Song.countDocuments = async () => 1;

    const req = { query: {} };
    const res = createMockRes();

    await getSongs(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.count, 1);
  });

  // 6. Songs by Mood
  it('getSongsByMood should return songs filtered by mood', async () => {
    Song.find = () => ({
      sort: () => ({
        limit: async () => [mockSong]
      })
    });

    const req = { params: { mood: 'Energetic' }, query: {} };
    const res = createMockRes();

    await getSongsByMood(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.mood, 'Energetic');
    assert.equal(res.body.count, 1);
  });

  // 7. Add Favourite
  it('addFavourite should add song and increment likeCount', async () => {
    Song.findById = async () => mockSong;
    Favourite.findOne = async () => null;
    Favourite.create = async () => ({ user: mockUserId, song: mockSongId });
    Song.findByIdAndUpdate = async () => true;

    const req = { user: { id: mockUserId }, params: { songId: mockSongId } };
    const res = createMockRes();

    await addFavourite(req, res, () => {});
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
  });

  // 8. Remove Favourite
  it('removeFavourite should remove song from favourites', async () => {
    Favourite.findOneAndDelete = async () => ({ _id: 'fav123' });
    Song.findByIdAndUpdate = async () => true;

    const req = { user: { id: mockUserId }, params: { songId: mockSongId } };
    const res = createMockRes();

    await removeFavourite(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
  });

  // 9. Record Listening History
  it('recordListeningHistory should store session with completion rate', async () => {
    Song.findById = async () => mockSong;
    Song.findByIdAndUpdate = async () => true;
    ListeningHistory.create = async (doc) => ({ _id: 'hist123', ...doc });

    const req = {
      user: { id: mockUserId },
      body: {
        songId: mockSongId,
        contextMood: 'Energetic',
        listenDuration: 180,
        completionRate: 1.0
      }
    };
    const res = createMockRes();

    await recordListeningHistory(req, res, () => {});
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.data.record.completed, true);
  });

  // 10. Record User Feedback (likes & skips)
  it('recordFeedback should record skip action', async () => {
    Song.findById = async () => mockSong;
    UserFeedback.create = async (doc) => ({ _id: 'fb123', ...doc });

    const req = {
      user: { id: mockUserId },
      body: {
        songId: mockSongId,
        action: 'skip',
        skipDuration: 12
      }
    };
    const res = createMockRes();

    await recordFeedback(req, res, () => {});
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.data.feedback.action, 'skip');
  });

  it('recordFeedback should record like action and reinforce mood affinity', async () => {
    Song.findById = async () => mockSong;
    Song.findByIdAndUpdate = async () => true;
    User.findByIdAndUpdate = async () => true;
    UserFeedback.create = async (doc) => ({ _id: 'fb124', ...doc });

    const req = {
      user: { id: mockUserId },
      body: {
        songId: mockSongId,
        action: 'like'
      }
    };
    const res = createMockRes();

    await recordFeedback(req, res, () => {});
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.data.feedback.action, 'like');
  });

  // 11. Personalized Recommendations
  it('getPersonalizedRecommendations should calculate hybrid scores for candidates', async () => {
    Favourite.find = () => ({ select: async () => [] });
    ListeningHistory.find = () => ({
      sort: () => ({
        limit: async () => []
      })
    });
    UserFeedback.find = () => {
      const query = Promise.resolve([]);
      query.sort = () => ({ limit: async () => [] });
      query.select = async () => [];
      return query;
    };
    Song.find = async () => [mockSong];

    const req = {
      user: mockUser,
      query: { mood: 'Energetic', limit: 5 }
    };
    const res = createMockRes();

    await getPersonalizedRecommendations(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
    assert.ok(res.body.data.recommendations[0].recommendationScore > 0);
  });
});
