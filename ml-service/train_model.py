import json
import os
from typing import Dict, Tuple

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator


IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 2
SEED = 42
DATASET_DIR = os.path.join(".", "dataset", "PlantVillage")
MODEL_PATH = os.path.join(".", "plant_disease_model.h5")
LABELS_PATH = os.path.join(".", "labels.json")


def resolve_dataset_dir() -> str:
    primary = os.path.abspath(DATASET_DIR)
    nested = os.path.join(primary, "PlantVillage")

    if os.path.isdir(primary):
        if os.path.isdir(nested):
            return nested
        return primary

    raise FileNotFoundError(f"Dataset directory not found: {primary}")


def build_generators(dataset_dir: str) -> Tuple[tf.keras.preprocessing.image.DirectoryIterator, tf.keras.preprocessing.image.DirectoryIterator]:
    datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        validation_split=0.2,
    )

    train_gen = datagen.flow_from_directory(
        dataset_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="training",
        shuffle=True,
        seed=SEED,
    )

    val_gen = datagen.flow_from_directory(
        dataset_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation",
        shuffle=False,
        seed=SEED,
    )

    return train_gen, val_gen


def build_model(num_classes: int) -> tf.keras.Model:
    base_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.5)(x)
    outputs = Dense(num_classes, activation="softmax")(x)
    model = Model(inputs, outputs)

    model.compile(
        optimizer=Adam(learning_rate=0.0001),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def save_labels(class_indices: Dict[str, int]) -> str:
    labels_map: Dict[str, str] = {str(idx): name for name, idx in class_indices.items()}
    with open(LABELS_PATH, "w", encoding="utf-8") as f:
        json.dump(labels_map, f, indent=2)
    return LABELS_PATH


def main() -> None:
    dataset_dir = resolve_dataset_dir()
    print(f"[INFO] Loading dataset from: {dataset_dir}")

    train_gen, val_gen = build_generators(dataset_dir)
    model = build_model(num_classes=train_gen.num_classes)

    print(f"[INFO] Classes found: {list(train_gen.class_indices.keys())}")
    print(f"[INFO] Starting training for {EPOCHS} epochs")

    history = None
    labels_path = ""
    try:
        history = model.fit(
            train_gen,
            validation_data=val_gen,
            epochs=EPOCHS,
            verbose=1,
        )
    finally:
        model.save(MODEL_PATH)
        labels_path = save_labels(train_gen.class_indices)
        print("[INFO] Model saved successfully: plant_disease_model.h5")
        print(f"[INFO] Labels saved: {os.path.abspath(labels_path)}")

    if history is not None:
        final_train_acc = float(history.history.get("accuracy", [0.0])[-1])
        final_val_acc = float(history.history.get("val_accuracy", [0.0])[-1])
        print(f"[INFO] Final training accuracy: {final_train_acc:.4f}")
        print(f"[INFO] Final validation accuracy: {final_val_acc:.4f}")


if __name__ == "__main__":
    main()
