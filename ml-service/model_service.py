import json
import os
from typing import Any, Dict, List, Optional

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
labels: Any = {}


def load_labels(path: str) -> Any:
    if not os.path.exists(path):
        print(f"[WARN] labels file not found at {path}. Using fallback labels.")
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return {}
            return json.loads(content)
    except Exception as exc:
        print(f"[WARN] Failed to load labels from {path}: {exc}")
        return {}


def load_model(path: str) -> Optional[tf.keras.Model]:
    if not os.path.exists(path):
        print(f"[WARN] Model file not found at {path}. Service will run without inference.")
        return None

    try:
        loaded_model = tf.keras.models.load_model(path)
        print(f"[INFO] Model loaded from {path}")
        return loaded_model
    except Exception as exc:
        print(f"[WARN] Failed to load model from {path}: {exc}")
        return None


def preprocess_image(file_storage) -> np.ndarray:
    image = Image.open(file_storage.stream).convert("RGB")
    image = image.resize(IMAGE_SIZE)
    image_array = np.array(image, dtype=np.float32)
    image_array = image_array / 255.0
    image_batch = np.expand_dims(image_array, axis=0)
    return image_batch


def resolve_label(predicted_index: int) -> Dict[str, str]:
    default_name = f"Class {predicted_index}"

    if isinstance(labels, list):
        if 0 <= predicted_index < len(labels):
            raw_item = labels[predicted_index]
            if isinstance(raw_item, str):
                return {
                    "name": raw_item,
                    "scientificName": "",
                    "description": "",
                }
            if isinstance(raw_item, dict):
                return {
                    "name": raw_item.get("name", default_name),
                    "scientificName": raw_item.get("scientificName", ""),
                    "description": raw_item.get("description", ""),
                }

    if isinstance(labels, dict):
        key = str(predicted_index)
        raw_item = labels.get(key)
        if isinstance(raw_item, str):
            return {
                "name": raw_item,
                "scientificName": "",
                "description": "",
            }
        if isinstance(raw_item, dict):
            return {
                "name": raw_item.get("name", default_name),
                "scientificName": raw_item.get("scientificName", ""),
                "description": raw_item.get("description", ""),
            }

    return {
        "name": default_name,
        "scientificName": "",
        "description": "",
    }


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": 'Missing file field "image"'}), 400

    if model is None:
        return jsonify({"error": "Model is not loaded. Place plant_disease_model.h5 in ml-service."}), 503

    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"error": "No image file selected"}), 400

    try:
        image_batch = preprocess_image(image_file)
        predictions = model.predict(image_batch, verbose=0)

        predicted_index = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))

        label_info = resolve_label(predicted_index)

        response = {
            "disease": {
                "name": label_info["name"],
                "scientificName": label_info.get("scientificName", ""),
                "confidence": round(confidence, 4),
                "description": label_info.get("description", ""),
            },
            "recommendations": [],
            "severity": "medium",
            "isHealthy": "healthy" in label_info["name"].lower(),
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
