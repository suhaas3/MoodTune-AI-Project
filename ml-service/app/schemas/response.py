from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class ValenceArousalEstimate(BaseModel):
  valence: float = Field(..., description="Estimated pleasantness on [0, 1]")
  arousal: float = Field(..., description="Estimated energy/intensity on [0, 1]")

class AudioFeatureSummary(BaseModel):
  tempo: float = Field(..., description="Estimated beats per minute (BPM)")
  spectral_centroid: float = Field(..., description="Spectral brightness in Hz")
  zero_crossing_rate: float = Field(..., description="Noisiness / percussiveness")
  rms_energy: float = Field(..., description="Root-mean-square audio energy")

class EmotionPredictionResponse(BaseModel):
  status: str = "success"
  predicted_emotion: str = Field(..., description="Primary classified emotion (Happy, Sad, Relaxed, Energetic)")
  confidence: float = Field(..., description="Confidence score of top class [0, 1]")
  probabilities: Dict[str, float] = Field(..., description="Probability distribution across all 4 emotions")
  valence_arousal: ValenceArousalEstimate
  audio_features: AudioFeatureSummary

class ModelInfoResponse(BaseModel):
  model_architecture: str
  num_classes: int
  classes: list
  dataset_split: Dict[str, int]
  evaluation_metrics: Dict[str, Any]
  training_parameters: Dict[str, Any]

class ErrorResponse(BaseModel):
  status: str = "error"
  detail: str
