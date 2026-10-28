import io
from pathlib import Path
from typing import Tuple, Dict, Any, Union
import numpy as np
import soundfile as sf
import librosa

from app.config import (
    SAMPLE_RATE,
    ANALYSIS_DURATION,
    N_MELS,
    N_FFT,
    HOP_LENGTH,
    TARGET_TIME_FRAMES,
    SUPPORTED_AUDIO_EXTENSIONS
)

class AudioFeatureExtractor:
  """
  Extracts Mel-Spectrogram tensors and acoustic audio descriptors
  using Librosa and SoundFile for Emotion Recognition
  """

  @staticmethod
  def validate_audio_file(filename: str) -> None:
    """Validate that the file has a supported audio extension"""
    ext = Path(filename).suffix.lower()
    if ext not in SUPPORTED_AUDIO_EXTENSIONS:
      raise ValueError(
          f"Unsupported audio format '{ext}'. "
          f"Supported formats: {', '.join(sorted(SUPPORTED_AUDIO_EXTENSIONS))}"
      )

  @classmethod
  def load_audio(
      cls,
      file_source: Union[str, Path, bytes, io.BytesIO],
      sr: int = SAMPLE_RATE,
      target_duration: float = ANALYSIS_DURATION
  ) -> Tuple[np.ndarray, int]:
    """
    Loads, resamples to mono, and standardizes duration of an audio source
    """
    try:
      if isinstance(file_source, (bytes, bytearray)):
        file_source = io.BytesIO(file_source)

      # Load audio using soundfile or librosa
      y, original_sr = librosa.load(file_source, sr=sr, mono=True)
      if y is None or len(y) == 0:
        raise ValueError("Audio file contains no playable samples or is corrupted.")

      # Standardize length to target_duration
      target_samples = int(sr * target_duration)
      current_samples = len(y)

      if current_samples < target_samples:
        # Pad with symmetric reflection or zeros if too short
        pad_width = target_samples - current_samples
        y = np.pad(y, (0, pad_width), mode='constant')
      elif current_samples > target_samples:
        # Extract middle slice where emotion and energy are most stable
        start = (current_samples - target_samples) // 2
        y = y[start : start + target_samples]

      # Normalize amplitude
      max_amp = np.max(np.abs(y))
      if max_amp > 0:
        y = y / max_amp

      return y.astype(np.float32), sr

    except Exception as e:
      raise ValueError(f"Failed to process audio stream: {str(e)}")

  @classmethod
  def extract_mel_spectrogram(
      cls,
      y: np.ndarray,
      sr: int = SAMPLE_RATE,
      n_mels: int = N_MELS,
      hop_length: int = HOP_LENGTH,
      target_frames: int = TARGET_TIME_FRAMES
  ) -> np.ndarray:
    """
    Computes Log-Mel Spectrogram (dB scale) formatted as (n_mels, target_frames)
    Input representation for PyTorch CNN
    """
    # 1. Compute Mel Spectrogram
    mel_spec = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_fft=N_FFT,
        hop_length=hop_length,
        n_mels=n_mels,
        power=2.0
    )

    # 2. Convert to log scale decibels (dB)
    mel_db = librosa.power_to_db(mel_spec, ref=np.max)

    # 3. Normalize to [0, 1] range for neural net stability
    min_db = -80.0
    mel_norm = np.clip((mel_db - min_db) / (-min_db), 0.0, 1.0)

    # 4. Standardize width to target_frames (128)
    if mel_norm.shape[1] < target_frames:
      pad_w = target_frames - mel_norm.shape[1]
      mel_norm = np.pad(mel_norm, ((0, 0), (0, pad_w)), mode='constant')
    elif mel_norm.shape[1] > target_frames:
      mel_norm = mel_norm[:, :target_frames]

    return mel_norm.astype(np.float32)

  @classmethod
  def extract_acoustic_features(cls, y: np.ndarray, sr: int = SAMPLE_RATE) -> Dict[str, Any]:
    """
    Extracts scalar acoustic descriptors: tempo, spectral centroid,
    contrast, zero crossing rate, energy, MFCCs, and chroma
    """
    # 1. Tempo & Beat Tracking
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    # Ensure tempo is scalar float
    if isinstance(tempo, np.ndarray):
      tempo = float(tempo[0]) if len(tempo) > 0 else 120.0
    else:
      tempo = float(tempo)

    # 2. Spectral Features
    centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
    rolloff = float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr)))
    contrast = float(np.mean(librosa.feature.spectral_contrast(y=y, sr=sr)))
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y=y)))
    rms = float(np.mean(librosa.feature.rms(y=y)))

    # 3. MFCC (13 coefficients)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = [float(x) for x in np.mean(mfcc, axis=1)]

    # 4. Chroma STFT (12 Pitch classes)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    chroma_mean = [float(x) for x in np.mean(chroma, axis=1)]

    return {
        "tempo": round(tempo, 1),
        "spectral_centroid": round(centroid, 2),
        "spectral_rolloff": round(rolloff, 2),
        "spectral_contrast": round(contrast, 2),
        "zero_crossing_rate": round(zcr, 4),
        "rms_energy": round(rms, 4),
        "mfcc_mean": mfcc_mean,
        "chroma_mean": chroma_mean
    }
