import torch
import torch.nn as nn
import torch.nn.functional as F

class MusicEmotionCNN(nn.Module):
  """
  Convolutional Neural Network for Music Emotion Recognition
  Operates on 2D Log-Mel Spectrogram representations (1 x 128 x 128)
  Outputs 4 discrete emotion logits and continuous Valence/Arousal estimates
  """

  def __init__(self, num_classes: int = 4, in_channels: int = 1):
    super(MusicEmotionCNN, self).__init__()

    # Conv Block 1: 1 -> 32 channels, 128x128 -> 64x64
    self.conv1 = nn.Sequential(
        nn.Conv2d(in_channels, 32, kernel_size=3, padding=1, bias=False),
        nn.BatchNorm2d(32),
        nn.ReLU(),
        nn.MaxPool2d(kernel_size=2, stride=2),
        nn.Dropout2d(0.10)
    )

    # Conv Block 2: 32 -> 64 channels, 64x64 -> 32x32
    self.conv2 = nn.Sequential(
        nn.Conv2d(32, 64, kernel_size=3, padding=1, bias=False),
        nn.BatchNorm2d(64),
        nn.ReLU(),
        nn.MaxPool2d(kernel_size=2, stride=2),
        nn.Dropout2d(0.15)
    )

    # Conv Block 3: 64 -> 128 channels, 32x32 -> 16x16
    self.conv3 = nn.Sequential(
        nn.Conv2d(64, 128, kernel_size=3, padding=1, bias=False),
        nn.BatchNorm2d(128),
        nn.ReLU(),
        nn.MaxPool2d(kernel_size=2, stride=2),
        nn.Dropout2d(0.20)
    )

    # Conv Block 4: 128 -> 256 channels, adaptive pooling to 4x4
    self.conv4 = nn.Sequential(
        nn.Conv2d(128, 256, kernel_size=3, padding=1, bias=False),
        nn.BatchNorm2d(256),
        nn.ReLU(),
        nn.AdaptiveAvgPool2d((4, 4))
    )

    # Fully Connected Feature Embedding
    self.fc_shared = nn.Sequential(
        nn.Linear(256 * 4 * 4, 128),
        nn.BatchNorm1d(128),
        nn.ReLU(),
        nn.Dropout(0.30)
    )

    # Head 1: 4-class discrete emotion classification
    self.classifier = nn.Linear(128, num_classes)

    # Head 2: Continuous Valence and Arousal regression in [0, 1]
    self.va_head = nn.Sequential(
        nn.Linear(128, 2),
        nn.Sigmoid()
    )

  def forward(self, x: torch.Tensor):
    """
    Args:
      x: Tensor of shape (batch_size, 1, n_mels, time_frames)
    Returns:
      Tuple of (logits, valence_arousal)
    """
    # Convolutional feature extraction
    out = self.conv1(x)
    out = self.conv2(out)
    out = self.conv3(out)
    out = self.conv4(out)

    # Flatten and dense projection
    flat = out.view(out.size(0), -1)
    shared_features = self.fc_shared(flat)

    # Multi-task predictions
    logits = self.classifier(shared_features)
    valence_arousal = self.va_head(shared_features)

    return logits, valence_arousal
