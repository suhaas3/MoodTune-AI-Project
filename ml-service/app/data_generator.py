import math
from pathlib import Path
import json
import numpy as np
import soundfile as sf

from app.config import (
    DATA_DIR,
    SAMPLE_RATE,
    ANALYSIS_DURATION,
    EMOTION_LABELS,
    EMOTION_VA_CENTROIDS
)

def generate_synthetic_audio_dataset(num_samples_per_class: int = 16) -> Path:
  """
  Synthesizes acoustic audio waveforms for each emotion quadrant
  using distinct musical scales, tempos, and harmonic spectra.
  Saves real WAV files to disk for empirical model training and evaluation.
  """
  dataset_dir = DATA_DIR / "dataset"
  dataset_dir.mkdir(parents=True, exist_ok=True)

  manifest = []
  sr = SAMPLE_RATE
  duration = ANALYSIS_DURATION
  num_points = int(sr * duration)
  t = np.linspace(0, duration, num_points, endpoint=False)

  # Note frequencies in Hz (A4 = 440)
  C4, D4, E4, F4, G4, A4, B4 = 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88
  C5, E5, G5, Eb4, Ab4, Bb4 = 523.25, 659.25, 783.99, 311.13, 415.30, 466.16

  for mood in EMOTION_LABELS:
    mood_dir = dataset_dir / mood.lower()
    mood_dir.mkdir(parents=True, exist_ok=True)

    for i in range(num_samples_per_class):
      seed = (hash(mood) + i * 17) % 10000
      rng = np.random.default_rng(seed)

      # 1. Harmonic synthesis per mood
      if mood == "Happy":
        # Major triads, bright overtone balance, 118-128 BPM pulse
        tempo = float(rng.uniform(116, 126))
        chord = [C4, E4, G4, C5]
        signal = np.zeros(num_points)
        for freq in chord:
          detune = rng.uniform(-1.5, 1.5)
          signal += np.sin(2 * np.pi * (freq + detune) * t) * 0.25
          # 2nd harmonic
          signal += np.sin(2 * np.pi * ((freq + detune) * 2) * t) * 0.10

        # Rhythmic cheerful envelope
        beat_freq = tempo / 60.0
        env = 0.6 + 0.4 * np.abs(np.sin(np.pi * beat_freq * t))
        signal *= env

      elif mood == "Sad":
        # Minor chords (C minor, D minor), slow 62-72 BPM, subdued harmonics
        tempo = float(rng.uniform(62, 70))
        chord = [C4, Eb4, G4]
        signal = np.zeros(num_points)
        for freq in chord:
          signal += np.sin(2 * np.pi * freq * t) * 0.35
        # Soft low-pass feel: attenuate higher frequencies
        noise = rng.normal(0, 0.02, num_points)
        signal += noise
        beat_freq = tempo / 60.0
        env = 0.5 + 0.25 * np.sin(np.pi * beat_freq * t)
        signal *= env

      elif mood == "Relaxed":
        # Pentatonic calm pads, gentle resonance, 72-82 BPM
        tempo = float(rng.uniform(72, 80))
        chord = [C4, D4, G4, A4]
        signal = np.zeros(num_points)
        for freq in chord:
          # Slow chorus LFO
          lfo = 0.05 * np.sin(2 * np.pi * 0.2 * t)
          signal += np.sin(2 * np.pi * (freq + lfo) * t) * 0.25
        beat_freq = tempo / 60.0
        env = 0.7 + 0.2 * np.sin(np.pi * (beat_freq / 2) * t)
        signal *= env

      elif mood == "Energetic":
        # High tempo (140-165 BPM), sawtooth/pulse waveforms, sharp percussive envelope
        tempo = float(rng.uniform(140, 160))
        freq = float(rng.choice([A4, D4, E4, 110.0]))
        # Sawtooth synthesis approximation
        signal = np.zeros(num_points)
        for h in range(1, 8):
          signal += (1.0 / h) * np.sin(2 * np.pi * freq * h * t) * 0.2
        # Fast rhythmic attack
        beat_freq = tempo / 60.0
        beat_phase = (t * beat_freq) % 1.0
        drum_env = np.exp(-beat_phase * 6.0)
        signal = signal * 0.5 + drum_env * 0.5

      # Normalize amplitude
      max_val = np.max(np.abs(signal))
      if max_val > 0:
        signal = signal / max_val * 0.95

      file_path = mood_dir / f"{mood.lower()}_{i+1:03d}.wav"
      sf.write(str(file_path), signal.astype(np.float32), sr)

      # Record in manifest
      va = EMOTION_VA_CENTROIDS[mood]
      manifest.append({
          "file_path": str(file_path.relative_to(BASE_DIR)),
          "label": mood,
          "valence": va["valence"],
          "arousal": va["arousal"],
          "tempo": round(tempo, 1)
      })

  # Save manifest JSON
  manifest_path = dataset_dir / "manifest.json"
  with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)

  print(f"[Data Generator] Created {len(manifest)} real audio files in {dataset_dir}")
  return dataset_dir
