import json
import logging
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import (
    MODEL_WEIGHTS_PATH,
    MODEL_METADATA_PATH,
    SUPPORTED_AUDIO_EXTENSIONS,
    EMOTION_LABELS
)
from app.pipelines.inference import EmotionInferenceEngine
from app.schemas.response import (
    EmotionPredictionResponse,
    ModelInfoResponse,
    ErrorResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MoodTune-ML-API")

# Initialize FastAPI application
app = FastAPI(
    title="MoodTune AI — Music Emotion Recognition (MER) Service",
    description="Deep Learning API for classifying musical audio into emotion categories (Happy, Sad, Relaxed, Energetic)",
    version="1.0.0"
)

# Enable CORS for frontend and Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
  """Preload and warm up the PyTorch model on startup"""
  logger.info("[Startup] Loading PyTorch MusicEmotionCNN model...")
  try:
    EmotionInferenceEngine.get_model()
    logger.info("[Startup] Model loaded successfully.")
  except Exception as e:
    logger.warning(f"[Startup] Model weights not loaded yet: {e}")

@app.get("/", tags=["Info"])
async def root():
  return {
      "service": "MoodTune AI Music Emotion Recognition Service",
      "status": "online",
      "emotions": EMOTION_LABELS,
      "docs_url": "/docs"
  }

@app.get("/health", tags=["Health"])
async def health_check():
  is_model_ready = MODEL_WEIGHTS_PATH.exists()
  return {
      "status": "healthy" if is_model_ready else "degraded",
      "model_loaded": is_model_ready,
      "device": "cuda" if EmotionInferenceEngine._device == "cuda" else "cpu"
  }

@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
async def get_model_info():
  """
  Returns model architecture, parameters, training dataset split,
  and held-out test evaluation metrics
  """
  if not MODEL_METADATA_PATH.exists():
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Model metadata not found. Training pipeline has not been executed yet."
    )

  try:
    with open(MODEL_METADATA_PATH, "r") as f:
      metadata = json.load(f)
    return metadata
  except Exception as e:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to read model metadata: {str(e)}"
    )

@app.post(
    "/predict-emotion",
    response_model=EmotionPredictionResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file format or corrupted audio"},
        500: {"model": ErrorResponse, "description": "Inference computation failure"}
    },
    tags=["Emotion Prediction"]
)
async def predict_emotion(file: UploadFile = File(...)):
  """
  Analyzes audio file, extracts Log-Mel Spectrogram and acoustic features,
  and predicts emotion (Happy, Sad, Relaxed, Energetic) with class probabilities
  """
  filename = file.filename or "unknown.wav"
  ext = Path(filename).suffix.lower()

  # 1. Format Validation
  if ext not in SUPPORTED_AUDIO_EXTENSIONS:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Unsupported file format '{ext}'. Supported formats: {', '.join(sorted(SUPPORTED_AUDIO_EXTENSIONS))}"
    )

  # 2. Read File Content
  try:
    contents = await file.read()
    if not contents or len(contents) == 0:
      raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Uploaded audio file is empty."
      )
  except HTTPException:
    raise
  except Exception as e:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Failed to read uploaded file: {str(e)}"
    )

  # 3. Model Inference & Feature Extraction
  try:
    prediction_result = EmotionInferenceEngine.predict_from_audio(
        file_source=contents,
        filename=filename
    )

    logger.info(
        f"[Inference Success] File: {filename} -> Predicted: {prediction_result['predicted_emotion']} "
        f"(Confidence: {prediction_result['confidence']:.2%})"
    )

    return {
        "status": "success",
        **prediction_result
    }

  except ValueError as val_err:
    logger.warning(f"[Validation Error] {filename}: {val_err}")
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(val_err)
    )
  except Exception as e:
    logger.error(f"[Inference Error] Unexpected error processing {filename}: {e}", exc_info=True)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Emotion prediction failure: {str(e)}"
    )
