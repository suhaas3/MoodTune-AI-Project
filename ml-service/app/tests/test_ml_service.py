import io
import pytest
import numpy as np
import soundfile as sf
import torch
from fastapi.testclient import TestClient

from app.config import (
    SAMPLE_RATE,
    ANALYSIS_DURATION,
    N_MELS,
    TARGET_TIME_FRAMES,
    NUM_CLASSES,
    EMOTION_LABELS
)
from app.core.feature_extractor import AudioFeatureExtractor
from app.models.audio_classifier import MusicEmotionCNN
from app.pipelines.inference import EmotionInferenceEngine
from app.main import app

@pytest.fixture
def sample_wav_bytes():
  """Generates a brief 2-second in-memory sine wave audio clip"""
  sr = SAMPLE_RATE
  duration = 2.0
  t = np.linspace(0, duration, int(sr * duration), endpoint=False)
  signal = 0.5 * np.sin(2 * np.pi * 440.0 * t).astype(np.float32)

  buffer = io.BytesIO()
  sf.write(buffer, signal, sr, format='WAV')
  buffer.seek(0)
  return buffer.read()

# 1. Feature Extraction Unit Tests
def test_audio_format_validation():
  # Valid extensions
  for ext in [".mp3", ".wav", ".ogg", ".flac", ".m4a"]:
    AudioFeatureExtractor.validate_audio_file(f"track{ext}")

  # Invalid extensions
  for ext in [".txt", ".pdf", ".exe", ".zip", ".jpg"]:
    with pytest.raises(ValueError) as exc:
      AudioFeatureExtractor.validate_audio_file(f"test{ext}")
    assert "Unsupported audio format" in str(exc.value)

def test_audio_loading_and_padding(sample_wav_bytes):
  y, sr = AudioFeatureExtractor.load_audio(sample_wav_bytes, target_duration=5.0)
  assert sr == SAMPLE_RATE
  assert len(y) == int(SAMPLE_RATE * 5.0)
  assert np.max(np.abs(y)) <= 1.0

def test_mel_spectrogram_dimensions(sample_wav_bytes):
  y, sr = AudioFeatureExtractor.load_audio(sample_wav_bytes)
  mel = AudioFeatureExtractor.extract_mel_spectrogram(y, sr)
  assert mel.shape == (N_MELS, TARGET_TIME_FRAMES)
  assert np.min(mel) >= 0.0
  assert np.max(mel) <= 1.0

def test_acoustic_descriptors(sample_wav_bytes):
  y, sr = AudioFeatureExtractor.load_audio(sample_wav_bytes)
  features = AudioFeatureExtractor.extract_acoustic_features(y, sr)

  assert "tempo" in features
  assert "spectral_centroid" in features
  assert "zero_crossing_rate" in features
  assert "rms_energy" in features
  assert len(features["mfcc_mean"]) == 13
  assert len(features["chroma_mean"]) == 12

# 2. PyTorch Model Unit Tests
def test_model_forward_pass_dimensions():
  model = MusicEmotionCNN(num_classes=NUM_CLASSES)
  model.eval()

  # Batch of 2 spectrograms: (2, 1, 128, 128)
  dummy_input = torch.randn(2, 1, 128, 128)
  logits, va_pred = model(dummy_input)

  assert logits.shape == (2, NUM_CLASSES)
  assert va_pred.shape == (2, 2)
  # Valence and arousal should be bounded in [0, 1] by sigmoid
  assert torch.all(va_pred >= 0.0)
  assert torch.all(va_pred <= 1.0)

# 3. Inference Engine Unit Tests
def test_inference_pipeline_output_structure(sample_wav_bytes):
  result = EmotionInferenceEngine.predict_from_audio(sample_wav_bytes, filename="tune.wav")

  assert "predicted_emotion" in result
  assert result["predicted_emotion"] in EMOTION_LABELS
  assert "confidence" in result
  assert "probabilities" in result
  assert len(result["probabilities"]) == 4

  # Probabilities should sum to approximately 1.0
  prob_sum = sum(result["probabilities"].values())
  assert pytest.approx(prob_sum, 0.01) == 1.0

  # Valence & Arousal structure
  va = result["valence_arousal"]
  assert 0.0 <= va["valence"] <= 1.0
  assert 0.0 <= va["arousal"] <= 1.0

# 4. FastAPI Endpoint Tests
client = TestClient(app)

def test_api_root():
  response = client.get("/")
  assert response.status_code == 200
  data = response.json()
  assert data["status"] == "online"
  assert len(data["emotions"]) == 4

def test_api_health():
  response = client.get("/health")
  assert response.status_code == 200
  data = response.json()
  assert "status" in data

def test_api_predict_emotion_valid(sample_wav_bytes):
  response = client.post(
      "/predict-emotion",
      files={"file": ("test_track.wav", sample_wav_bytes, "audio/wav")}
  )
  assert response.status_code == 200
  data = response.json()
  assert data["status"] == "success"
  assert data["predicted_emotion"] in EMOTION_LABELS
  assert data["confidence"] > 0

def test_api_predict_emotion_unsupported_format():
  # Try uploading a .pdf or .txt file
  response = client.post(
      "/predict-emotion",
      files={"file": ("notes.txt", b"Hello this is not audio", "text/plain")}
  )
  assert response.status_code == 400
  data = response.json()
  assert "Unsupported file format" in data["detail"]

def test_api_predict_emotion_corrupted_file():
  # Audio extension but corrupted bytes
  response = client.post(
      "/predict-emotion",
      files={"file": ("corrupt.mp3", b"GARBAGE_NON_AUDIO_BYTES_12345", "audio/mpeg")}
  )
  assert response.status_code == 400
