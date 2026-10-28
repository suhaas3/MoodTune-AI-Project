import json
from pathlib import Path
from typing import Dict, Any, Union
import numpy as np
import torch
import torch.nn.functional as F

from app.config import (
    MODEL_WEIGHTS_PATH,
    LABEL_MAPPING_PATH,
    MODEL_METADATA_PATH,
    IDX_TO_LABEL,
    NUM_CLASSES,
    EMOTION_LABELS
)
from app.core.feature_extractor import AudioFeatureExtractor
from app.models.audio_classifier import MusicEmotionCNN

class EmotionInferenceEngine:
  """
  Inference Engine for Music Emotion Recognition
  Loads trained PyTorch weights and performs end-to-end emotion prediction from audio files
  """

  _model = None
  _device = None
  _label_mapping = None

  @classmethod
  def get_model(cls) -> MusicEmotionCNN:
    """Lazy-loads and caches the PyTorch model instance"""
    if cls._model is None:
      cls._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
      model = MusicEmotionCNN(num_classes=NUM_CLASSES, in_channels=1)

      if MODEL_WEIGHTS_PATH.exists():
        state_dict = torch.load(str(MODEL_WEIGHTS_PATH), map_location=cls._device)
        model.load_state_dict(state_dict)
      else:
        print("[InferenceEngine] Warning: Model weights not found. Using initialized network.")

      model.to(cls._device)
      model.eval()
      cls._model = model

    return cls._model

  @classmethod
  def predict_from_audio(
      cls,
      file_source: Union[str, Path, bytes],
      filename: str = "audio.wav"
  ) -> Dict[str, Any]:
    """
    End-to-end prediction from audio file or raw bytes
    Returns predicted emotion, class probabilities, (V, A) coordinates, and acoustic descriptors
    """
    # 1. Format validation
    AudioFeatureExtractor.validate_audio_file(filename)

    # 2. Audio loading & Standardization
    y_audio, sr = AudioFeatureExtractor.load_audio(file_source)

    # 3. Feature Extraction
    mel_spec = AudioFeatureExtractor.extract_mel_spectrogram(y_audio, sr)
    acoustic_features = AudioFeatureExtractor.extract_acoustic_features(y_audio, sr)

    # 4. PyTorch Tensor Preparation (Batch x Channels x Height x Width)
    spec_tensor = torch.tensor(mel_spec, dtype=torch.float32).unsqueeze(0).unsqueeze(0)

    model = cls.get_model()
    device = cls._device or torch.device("cpu")
    spec_tensor = spec_tensor.to(device)

    # 5. Forward Inference
    with torch.no_grad():
      logits, va_pred = model(spec_tensor)
      probs = F.softmax(logits, dim=1).squeeze(0).cpu().numpy()
      va_coords = va_pred.squeeze(0).cpu().numpy()

    # 6. Format Class Probabilities
    probabilities = {}
    for idx, prob in enumerate(probs):
      label = IDX_TO_LABEL.get(idx, EMOTION_LABELS[idx])
      probabilities[label] = round(float(prob), 4)

    best_idx = int(np.argmax(probs))
    predicted_emotion = IDX_TO_LABEL.get(best_idx, EMOTION_LABELS[best_idx])
    confidence = float(probs[best_idx])

    return {
        "predicted_emotion": predicted_emotion,
        "confidence": round(confidence, 4),
        "probabilities": probabilities,
        "valence_arousal": {
            "valence": round(float(va_coords[0]), 4),
            "arousal": round(float(va_coords[1]), 4)
        },
        "audio_features": {
            "tempo": acoustic_features["tempo"],
            "spectral_centroid": acoustic_features["spectral_centroid"],
            "zero_crossing_rate": acoustic_features["zero_crossing_rate"],
            "rms_energy": acoustic_features["rms_energy"]
        }
    }
