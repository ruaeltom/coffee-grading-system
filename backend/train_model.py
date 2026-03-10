import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

# Image settings
IMG_SIZE = (224, 224)
BATCH_SIZE = 16

# CLAHE function
def apply_clahe(image):
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l_clahe = clahe.apply(l)

    lab = cv2.merge((l_clahe, a, b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)


# Apply CLAHE in TensorFlow pipeline
def clahe_tf(images, labels):

    def _clahe_batch(batch):
        batch = batch.numpy().astype(np.uint8)
        processed = np.array([apply_clahe(img) for img in batch])
        return processed.astype(np.float32)

    images = tf.py_function(_clahe_batch, [images], tf.float32)
    images.set_shape((None, 224, 224, 3))

    return images, labels


# Load dataset
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    "dataset",
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    "dataset",
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

class_names = train_ds.class_names
print("Classes:", class_names)


# Ignore corrupted images
train_ds = train_ds.ignore_errors()
val_ds = val_ds.ignore_errors()


# Normalize
normalization_layer = layers.Rescaling(1./255)

# Data augmentation
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
])


# Apply CLAHE
train_ds = train_ds.map(clahe_tf)
val_ds = val_ds.map(clahe_tf)

# Normalize
train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))


# Improve performance
AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.map(
    lambda x, y: (data_augmentation(x, training=True), y)
)

train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)


# Simple CNN model (original working one)
model = models.Sequential([

    layers.Conv2D(32, 3, activation='relu', input_shape=(224,224,3)),
    layers.MaxPooling2D(),

    layers.Conv2D(64, 3, activation='relu'),
    layers.MaxPooling2D(),

    layers.Conv2D(128, 3, activation='relu'),
    layers.MaxPooling2D(),

    layers.Flatten(),

    layers.Dense(128, activation='relu'),

    layers.Dense(len(class_names), activation='softmax')
])


# Compile
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
early_stop = tf.keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=3,
    restore_best_weights=True
)


# Train
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=15,
    callbacks=[early_stop]
)


# Save model
model.save("coffee_classifier_v2.h5")

print("Model saved as coffee_classifier_v2.h5")