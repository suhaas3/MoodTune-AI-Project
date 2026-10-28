# MoodTune AI

**Project Title:** MoodTune AI: An Adaptive, Emotion-Aware Music Recommendation System Using Deep Learning and Hybrid Filtering  
**Domain:** Final-Year B.Tech CSE (Data Science) Capstone Project  
**Tech Stack:** React (Vite + Tailwind CSS) | Node.js + Express.js | MongoDB + Mongoose | Python + PyTorch + Librosa | FastAPI

---

## 🏗️ Project Architecture

```
MoodTune-AI/
├── client/                     # Phase 1: React.js + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Sidebar, Navbar, BottomPlayer, Cards
│   │   ├── context/            # AuthContext, MoodContext, PlayerContext
│   │   └── pages/              # Home, Explore, Moods, Favorites, History, Profile, Auth
│   └── package.json
│
├── server/                     # Phase 2 & 3: Express Backend + Recommendation Engine
│   ├── src/
│   │   ├── recommendation/     # Phase 3 Recommendation Engine Modules
│   │   │   ├── config.js               # Configurable weights & mood profiles
│   │   │   ├── normalizer.js           # Min-Max & score normalization
│   │   │   ├── moodMatcher.js          # Affective Russell Circumplex (V, A) matcher
│   │   │   ├── attributeMatcher.js     # Genre Jaccard & Gaussian tempo alignment
│   │   │   ├── collaborativeFilter.js  # User-User Cosine Similarity CF
│   │   │   ├── userFeedbackScorer.js   # Likes, skips, hard dislike filter & fatigue decay
│   │   │   ├── diversityFilter.js      # MMR artist capping & Intra-List Diversity
│   │   │   ├── explainability.js       # Natural language rationale & percentage breakdown
│   │   │   ├── baselineRecommender.js  # Naive Popularity-Mood Filter baseline
│   │   │   ├── hybridRecommender.js    # Adaptive Multi-Factor Hybrid Engine
│   │   │   ├── syntheticData.js        # Synthetic multi-user benchmark dataset
│   │   │   ├── benchmarkEvaluator.js   # Baseline vs. Hybrid comparative evaluation
│   │   │   └── index.js
│   │   ├── config/                     # MongoDB connection with in-memory dev fallback
│   │   ├── controllers/                # Auth, Song, Favourite, History, Feedback, Recommendation
│   │   ├── middleware/                 # JWT Cookie Auth, Validator, Error Handler
│   │   ├── models/                     # User, Song, ListeningHistory, Favourite, UserFeedback
│   │   ├── routes/                     # RESTful API routing
│   │   ├── scripts/
│   │   │   ├── seed.js                 # Catalog & user seeder
│   │   │   └── benchmarkRecommendations.js # CLI comparison benchmark runner
│   │   ├── tests/
│   │   │   ├── unit_and_api.test.js    # Security & Mongoose schema tests
│   │   │   ├── routes.test.js          # Controller & API integration tests
│   │   │   └── recommendation.test.js  # Recommendation algorithmic & unit tests
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
└── ml-service/                 # Phase 4: Python FastAPI + PyTorch + Librosa
```

---

## 🧠 Recommendation Engine Formulation (Phase 3)

The **MoodTune AI Hybrid Recommender** linear combination:

$$S_{\text{hybrid}}(u, i, M) = w_m \cdot S_{\text{mood}}'(i, M) + w_a \cdot S_{\text{attr}}'(u, i) + w_{cf} \cdot S_{\text{cf}}'(u, i) + w_u \cdot S_{\text{user}}'(u, i)$$

### 1. Affective Mood Matcher ($S_{\text{mood}}' \in [0, 1]$)
- Compares song's predicted mood with user target emotion $M \in \{\text{Happy}, \text{Energetic}, \text{Relaxed}, \text{Sad}\}$.
- Calculates continuous Euclidean proximity on Russell's Circumplex $(V, A)$ coordinate plane:
  $$\text{dist}_{VA}(i, M) = \sqrt{(V_i - V_M)^2 + (A_i - A_M)^2}$$
  $$S_{VA}(i, M) = 1 - \frac{\text{dist}_{VA}(i, M)}{\sqrt{2}}$$

### 2. Music Attribute Matching ($S_{\text{attr}}' \in [0, 1]$)
- **Genre Affinity:** Matches song genre with user preferences.
- **Tempo Alignment:** Gaussian bell curve centered around target mood BPM:
  $$S_{\text{tempo}}(i) = \exp\left(-\frac{(tempo_i - tempo_M)^2}{2 \cdot \sigma^2}\right)$$
- **Acoustic Energy & Danceability:** Calibrated to target mood profile.

### 3. Collaborative Filtering ($S_{\text{cf}}' \in [0, 1]$)
- Constructs interaction matrix from explicit and implicit feedback.
- Computes User-User Cosine Similarity across shared preferences:
  $$\text{sim}(u, v) = \frac{\sum_i r_{u,i} r_{v,i}}{\sqrt{\sum_i r_{u,i}^2} \sqrt{\sum_i r_{v,i}^2}}$$
- Predicts affinity based on positive correlations with similar listeners.

### 4. User Feedback & Anti-Fatigue ($S_{\text{user}}' \in [0, 1]$)
- **Hard Dislike Filter:** Immediately purges any song marked as 'dislike'.
- **Positive Boosts:** Favourites ($+30\%$), Likes ($+20\%$), Completed listens ($+15\%$).
- **Skip Penalty:** Reduces score by $25\%$ for skipped tracks.
- **Repetition Fatigue Decay:** Exponential time decay penalizes tracks played within the last 24 hours:
  $$P_{\text{fatigue}}(i) = \exp\left(-\frac{\Delta t_{\text{hours}}}{24}\right) \times 0.35$$

### 5. Configurable Weights & Cold-Start Adaptation
- Default active weights: $\{w_m: 0.35, w_a: 0.25, w_{cf}: 0.20, w_u: 0.20\}$.
- **Cold-Start Users ($0$ interactions):** Automatically shifts to $\{w_m: 0.55, w_a: 0.35, w_{cf}: 0.05, w_u: 0.05\}$.

### 6. Diversity & Explainability
- **Diversity Reranker:** Enforces artist capping (maximum 2 songs per artist in top 10) and ensures cross-genre variety.
- **Explainability:** Returns normalized percentage breakdown and natural language justification for every recommended track.

---

## 📊 Running the Tests & Benchmark

### Run Complete Test Suite (47 tests across 16 suites)
```bash
cd server
npm test
```

### Run Recommendation Engine Benchmark Comparison
```bash
npm run benchmark
```
Compares the Baseline (Popularity-Mood Filter) vs. the Adaptive Hybrid Recommender on the synthetic benchmark dataset.

---

## 📡 Recommendation Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/recommendations/personalized` | Top 10 hybrid recommendations with scores & breakdown | **Yes** |
| `GET` | `/api/recommendations/baseline` | Control baseline (Popularity-Mood Filter) for comparison | No |
| `GET` | `/api/recommendations/compare` | Comparative evaluation benchmark report with ILD metrics | No |
| `PUT` | `/api/recommendations/weights` | Dynamically update engine weights at runtime | **Yes** |
