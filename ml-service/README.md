# ML Service

This service provides a fast plant disease training and inference pipeline using TensorFlow + MobileNetV2 transfer learning.

## Files

- train_model.py: trains a model and exports labels.json
- predict_service.py: Flask prediction API at /predict
- labels.json: class index to disease name mapping
- requirements.txt: Python dependencies

## 1) Download dataset (PlantVillage)

Use a PlantVillage image dataset where each class has its own folder. Your local structure should look like:

dataset/
   Tomato___Early_blight/
   Tomato___Late_blight/
   Potato___healthy/
   ...

Any equivalent class-folder structure works.

## 2) Install dependencies

Recommended on Windows:

python -m venv .venv
.venv\\Scripts\\activate
python -m pip install --upgrade pip
pip install -r requirements.txt

If you already installed once and saw protobuf conflicts, run:

pip uninstall -y tensorflow protobuf
pip install -r requirements.txt

## 3) Train model

Run from the ml-service folder:

python train_model.py --dataset_dir ./dataset --epochs 10

Outputs created in ml-service:

- plant_disease_model.h5
- labels.json

## 4) Start prediction server

python predict_service.py

Server URL:

http://localhost:5001

Prediction endpoint:

POST http://localhost:5001/predict

Form-data:

- image: image file

Response format:

{
   "disease": {
      "name": "Disease name",
      "confidence": 0.93
   },
   "severity": "medium",
   "isHealthy": false
}
