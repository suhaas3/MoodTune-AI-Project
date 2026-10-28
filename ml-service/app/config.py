from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
APP_DIR = BASE_DIR / "app"
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = APP_DIR / "models" / "saved_models"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Audio Feature Extraction Hyperparameters
SAMPLE_RATE = 22050          # Standard sampling rate for music analysis
ANALYSIS_DURATION = 10.0     # Target audio analysis window in seconds
N_MELS = 128                 # Number of Mel frequency bands
N_FFT = 2048                 # FFT window size
HOP_LENGTH = 512             # Hop length between STFT frames
TARGET_TIME_FRAMES = 128     # Fixed width dimension for 2D-CNN input (128x128 spectrogram)

# Supported audio extensions
SUPPORTED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".flac", ".m4a"}

# Emotion Labels (Russell's Circumplex Affect Model)
EMOTION_LABELS = ["Happy", "Sad", "Relaxed", "Energetic"]
NUM_CLASSES = len(EMOTION_LABELS)

# Label Mapping
LABEL_TO_IDX = {label: idx for idx, label in enumerate(EMOTION_LABELS)}
IDX_TO_LABEL = {idx: label for idx, label in enumerate(EMOTION_LABELS)}

# Emotion Quadrant Reference Centroids on Valence-Arousal plane
EMOTION_VA_CENTROIDS = {
    "Happy": {"valence": 0.85, "arousal": 0.70},
    "Sad": {"valence": 0.18, "arousal": 0.22},
    "Relaxed": {"valence": 0.72, "arousal": 0.28},
    "Energetic": {"valence": 0.65, "arousal": 0.94}
}

# Model file paths
MODEL_WEIGHTS_PATH = MODELS_DIR / "emotion_cnn.pt"
LABEL_MAPPING_PATH = MODELS_DIR / "label_mapping.json"
MODEL_METADATA_PATH = MODELS_DIR / "model_meta.json"
