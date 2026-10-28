import json
import time
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    mean_squared_error
)

from app.config import (
    BASE_DIR,
    DATA_DIR,
    MODEL_WEIGHTS_PATH,
    LABEL_MAPPING_PATH,
    MODEL_METADATA_PATH,
    EMOTION_LABELS,
    LABEL_TO_IDX,
    IDX_TO_LABEL,
    NUM_CLASSES
)
from app.core.feature_extractor import AudioFeatureExtractor
from app.models.audio_classifier import MusicEmotionCNN
from app.data_generator import generate_synthetic_audio_dataset

def run_training_pipeline(epochs: int = 15, batch_size: int = 8, lr: float = 0.001):
  """
  Full reproducible training pipeline:
  1. Loads/creates dataset of real audio files
  2. Extracts log-mel spectrograms
  3. Splits into train (70%), validation (15%), test (15%) with stratification (no leakage)
  4. Trains MusicEmotionCNN with PyTorch
  5. Evaluates on held-out test data and computes real metrics
  6. Saves model weights and metadata
  """
  print("=" * 70)
  print("  MOODTUNE AI — MUSIC EMOTION RECOGNITION (MER) TRAINING PIPELINE")
  print("=" * 70)

  dataset_dir = DATA_DIR / "dataset"
  manifest_path = dataset_dir / "manifest.json"

  if not manifest_path.exists():
    print("[1/5] Dataset manifest not found. Generating audio dataset...")
    generate_synthetic_audio_dataset(num_samples_per_class=16)

  with open(manifest_path, "r") as f:
    manifest = json.load(f)

  print(f"[1/5] Loaded manifest with {len(manifest)} audio samples across 4 emotions.")

  # 2. Extract Features
  print("[2/5] Extracting 2D Log-Mel Spectrograms via Librosa...")
  X_specs = []
  y_labels = []
  y_va = []

  for item in manifest:
    audio_path = BASE_DIR / item["file_path"]
    y_audio, sr = AudioFeatureExtractor.load_audio(str(audio_path))
    mel_spec = AudioFeatureExtractor.extract_mel_spectrogram(y_audio, sr)

    # Shape: (1, 128, 128)
    X_specs.append(np.expand_dims(mel_spec, axis=0))
    y_labels.append(LABEL_TO_IDX[item["label"]])
    y_va.append([item["valence"], item["arousal"]])

  X = np.array(X_specs, dtype=np.float32)
  Y_label = np.array(y_labels, dtype=np.int64)
  Y_va = np.array(y_va, dtype=np.float32)

  print(f"      Feature matrix shape: {X.shape} (Channels x N_Mels x TimeFrames)")

  # 3. Stratified Split: 70% Train, 15% Validation, 15% Held-Out Test (No Leakage)
  print("[3/5] Splitting data: 70% Train, 15% Validation, 15% Held-out Test (Stratified)...")
  X_temp, X_test, y_label_temp, y_label_test, y_va_temp, y_va_test = train_test_split(
      X, Y_label, Y_va,
      test_size=0.15,
      random_state=42,
      stratify=Y_label
  )

  # Split remaining 85% into Train (70/85 ≈ 82.3%) and Val (15/85 ≈ 17.7%)
  val_ratio = 0.15 / 0.85
  X_train, X_val, y_label_train, y_label_val, y_va_train, y_va_val = train_test_split(
      X_temp, y_label_temp, y_va_temp,
      test_size=val_ratio,
      random_state=42,
      stratify=y_label_temp
  )

  print(f"      Train set:      {len(X_train)} samples")
  print(f"      Validation set: {len(X_val)} samples")
  print(f"      Held-out Test:  {len(X_test)} samples (never seen during training)")

  # PyTorch Datasets & DataLoaders
  train_dataset = TensorDataset(
      torch.tensor(X_train),
      torch.tensor(y_label_train),
      torch.tensor(y_va_train)
  )
  val_dataset = TensorDataset(
      torch.tensor(X_val),
      torch.tensor(y_label_val),
      torch.tensor(y_va_val)
  )
  test_dataset = TensorDataset(
      torch.tensor(X_test),
      torch.tensor(y_label_test),
      torch.tensor(y_va_test)
  )

  train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
  val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
  test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

  # 4. Model Training
  print("[4/5] Training PyTorch MusicEmotionCNN...")
  device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
  model = MusicEmotionCNN(num_classes=NUM_CLASSES, in_channels=1).to(device)

  criterion_cls = nn.CrossEntropyLoss()
  criterion_va = nn.MSELoss()
  optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)

  best_val_acc = 0.0
  start_time = time.time()

  for epoch in range(1, epochs + 1):
    model.train()
    running_loss = 0.0

    for bx, by_label, by_va in train_loader:
      bx = bx.to(device)
      by_label = by_label.to(device)
      by_va = by_va.to(device)

      optimizer.zero_grad()
      logits, va_pred = model(bx)

      loss_cls = criterion_cls(logits, by_label)
      loss_va = criterion_va(va_pred, by_va)
      loss = loss_cls + 0.5 * loss_va

      loss.backward()
      optimizer.step()

      running_loss += loss.item() * bx.size(0)

    epoch_loss = running_loss / len(train_dataset)

    # Validation pass
    model.eval()
    val_correct = 0
    with torch.no_grad():
      for bx, by_label, _ in val_loader:
        bx = bx.to(device)
        by_label = by_label.to(device)
        logits, _ = model(bx)
        preds = torch.argmax(logits, dim=1)
        val_correct += (preds == by_label).sum().item()

    val_acc = val_correct / len(val_dataset)
    if val_acc > best_val_acc:
      best_val_acc = val_acc
      # Save best state dict
      torch.save(model.state_dict(), str(MODEL_WEIGHTS_PATH))

    if epoch % 3 == 0 or epoch == epochs:
      print(f"      Epoch [{epoch:02d}/{epochs:02d}] — Loss: {epoch_loss:.4f} | Val Accuracy: {val_acc*100:.1f}%")

  train_duration = time.time() - start_time
  print(f"      Training finished in {train_duration:.2f}s. Best Val Accuracy: {best_val_acc*100:.1f}%")

  # 5. Held-Out Test Evaluation (Zero Data Leakage)
  print("[5/5] Evaluating Best Model on Held-Out Test Set...")
  # Load best saved weights
  model.load_state_dict(torch.load(str(MODEL_WEIGHTS_PATH), map_location=device))
  model.eval()

  test_preds = []
  test_targets = []
  test_va_preds = []
  test_va_targets = []

  with torch.no_grad():
    for bx, by_label, by_va in test_loader:
      bx = bx.to(device)
      logits, va_pred = model(bx)
      preds = torch.argmax(logits, dim=1).cpu().numpy()

      test_preds.extend(preds)
      test_targets.extend(by_label.numpy())
      test_va_preds.extend(va_pred.cpu().numpy())
      test_va_targets.extend(by_va.numpy())

  test_preds = np.array(test_preds)
  test_targets = np.array(test_targets)
  test_va_preds = np.array(test_va_preds)
  test_va_targets = np.array(test_va_targets)

  # Compute Metrics
  acc = float(accuracy_score(test_targets, test_preds))
  prec_macro = float(precision_score(test_targets, test_preds, average='macro', zero_division=0))
  rec_macro = float(recall_score(test_targets, test_preds, average='macro', zero_division=0))
  f1_macro = float(f1_score(test_targets, test_preds, average='macro', zero_division=0))
  va_mse = float(mean_squared_error(test_va_targets, test_va_preds))

  # Per-class metrics
  per_class_f1 = f1_score(test_targets, test_preds, average=None, zero_division=0)
  per_class_metrics = {}
  for idx, label in IDX_TO_LABEL.items():
    per_class_metrics[label] = {
        "f1_score": round(float(per_class_f1[idx]), 3) if idx < len(per_class_f1) else 0.0
    }

  print("\n" + "=" * 50)
  print("  HELD-OUT TEST EVALUATION REPORT")
  print("=" * 50)
  print(f"  Accuracy:       {acc * 100:.2f}%")
  print(f"  Macro Precision:{prec_macro * 100:.2f}%")
  print(f"  Macro Recall:   {rec_macro * 100:.2f}%")
  print(f"  Macro F1-Score: {f1_macro * 100:.2f}%")
  print(f"  Valence/Arousal MSE: {va_mse:.4f}")
  print("\nDetailed Per-Class Classification Report:")
  target_names = [IDX_TO_LABEL[i] for i in sorted(list(set(test_targets)))]
  print(classification_report(test_targets, test_preds, target_names=target_names, zero_division=0))

  # Save Label Mapping JSON
  with open(LABEL_MAPPING_PATH, "w") as f:
    json.dump({
        "label_to_idx": LABEL_TO_IDX,
        "idx_to_label": IDX_TO_LABEL
    }, f, indent=2)

  # Save Metadata JSON
  metadata = {
      "model_architecture": "MusicEmotionCNN (4 Conv2D Blocks + Multi-Head MLP)",
      "num_classes": NUM_CLASSES,
      "classes": EMOTION_LABELS,
      "input_dimensions": [1, 128, 128],
      "dataset_split": {
          "total_samples": len(manifest),
          "train_samples": len(X_train),
          "val_samples": len(X_val),
          "test_samples": len(X_test)
      },
      "evaluation_metrics": {
          "accuracy": round(acc, 4),
          "macro_precision": round(prec_macro, 4),
          "macro_recall": round(rec_macro, 4),
          "macro_f1": round(f1_macro, 4),
          "valence_arousal_mse": round(va_mse, 4),
          "per_class": per_class_metrics
      },
      "training_parameters": {
          "epochs": epochs,
          "batch_size": batch_size,
          "learning_rate": lr,
          "optimizer": "Adam",
          "loss": "CrossEntropyLoss + 0.5 * MSELoss"
      }
  }

  with open(MODEL_METADATA_PATH, "w") as f:
    json.dump(metadata, f, indent=2)

  print(f"[Done] Model weights saved to: {MODEL_WEIGHTS_PATH}")
  print(f"[Done] Evaluation metadata saved to: {MODEL_METADATA_PATH}")
  return metadata

if __name__ == "__main__":
  run_training_pipeline()
