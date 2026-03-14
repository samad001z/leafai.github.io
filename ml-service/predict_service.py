import json
import os
from typing import Any, Dict, Optional

import numpy as np
from flask import Flask, jsonify, request
from PIL import Image
import tensorflow as tf


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "plant_disease_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "labels.json")
IMAGE_SIZE = (224, 224)


app = Flask(__name__)
model: Optional[tf.keras.Model] = None
labels: Dict[str, Any] = {}


def load_labels(path: str) -> Dict[str, Any]:
    if not os.path.exists(path):
        print(f"[WARN] labels.json not found at {path}. Falling back to class indices.")
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return {}
            return json.loads(content)
    except Exception as exc:
        print(f"[WARN] Failed to parse labels.json: {exc}")
        return {}


def load_model(path: str) -> Optional[tf.keras.Model]:
    if not os.path.exists(path):
        print(f"[WARN] Model not found at {path}. /predict will return 503 until model is added.")
        return None

    try:
        loaded = tf.keras.models.load_model(path)
        print(f"[INFO] Loaded model from {path}")
        return loaded
    except Exception as exc:
        print(f"[WARN] Failed to load model: {exc}")
        return None


def preprocess_image(file_storage) -> np.ndarray:
    image = Image.open(file_storage.stream).convert("RGB")
    image = image.resize(IMAGE_SIZE)
    image_array = np.array(image, dtype=np.float32) / 255.0
    image_batch = np.expand_dims(image_array, axis=0)
    return image_batch


def get_disease_name(class_idx: int) -> str:
    name = labels.get(str(class_idx), f"Class {class_idx}")
    if isinstance(name, dict):
        return str(name.get("name", f"Class {class_idx}"))
    return str(name)


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": 'Missing file field "image"'}), 400

    if model is None:
        return jsonify({"error": "Model is not loaded. Place plant_disease_model.h5 in ml-service."}), 503

    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"error": "No image selected"}), 400

    try:
        image_batch = preprocess_image(image_file)
        probs = model.predict(image_batch, verbose=0)[0]

        class_idx = int(np.argmax(probs))
        confidence = float(np.max(probs))
        disease_name = get_disease_name(class_idx)

        response = {
            "disease": {
                "name": disease_name,
                "confidence": round(confidence, 2),
            },
            "severity": "medium",
            "isHealthy": "healthy" in disease_name.lower(),
        }
        return jsonify(response), 200
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {exc}"}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "modelLoaded": model is not None,
            "modelPath": MODEL_PATH,
            "labelsPath": LABELS_PATH,
        }
    )


if __name__ == "__main__":
    labels = load_labels(LABELS_PATH)
    model = load_model(MODEL_PATH)
    app.run(host="0.0.0.0", port=5001, debug=False)
