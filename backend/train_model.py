import cv2
import numpy as np

import tensorflow as tf
from tensorflow.keras import layers, models

# Image settings
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
#background removal
def segment_coffee_cherries(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)

    # Define color ranges for cherries
    lower = np.array([0, 30, 30])
    upper = np.array([179, 255, 255])

    mask = cv2.inRange(hsv, lower, upper)

    # Remove noise
    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    # Apply mask
    segmented = cv2.bitwise_and(image, image, mask=mask)

    return segmented
#clahe
def apply_clahe(image):
    # Convert RGB → LAB color space
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    
    # Split channels
    l, a, b = cv2.split(lab)

    # Apply CLAHE on Lightness channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l_clahe = clahe.apply(l)

    # Merge channels back
    lab = cv2.merge((l_clahe, a, b))

    # Convert LAB → RGB
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
def clahe_tf(images, labels):
    def _clahe_batch(batch):
        batch = batch.numpy().astype(np.uint8)
        processed = np.array([apply_clahe(img) for img in batch])
        return processed.astype(np.float32)

    images = tf.py_function(_clahe_batch, [images], tf.float32)
    images.set_shape((None, 224, 224, 3))  # Preserve batch dimension
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

# Apply CLAHE before normalization
train_ds = train_ds.map(clahe_tf)
val_ds   = val_ds.map(clahe_tf)

# Normalize
def preprocess_batch(images, labels):
    processed = []
    
    for img in images:
        img = img.numpy().astype("uint8")
        img = preprocess_image(img)
        processed.append(img)

    processed = np.array(processed)
    return processed/255.0, labels


train_ds = train_ds.map(lambda x,y: tf.py_function(preprocess_batch, [x,y], [tf.float32, tf.int32]))
val_ds   = val_ds.map(lambda x, y: (normalization_layer(x), y))





# Improve performance
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.map(
    lambda x, y: (data_augmentation(x, training=True), y)
)
train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)

# Better CNN model
model = models.Sequential([

    layers.Input(shape=(224,224,3)),

    layers.Conv2D(32, (3,3), activation='relu', padding="same"),
    layers.BatchNormalization(),
    layers.MaxPooling2D(),

    layers.Conv2D(64, (3,3), activation='relu', padding="same"),
    layers.BatchNormalization(),
    layers.MaxPooling2D(),

    layers.Conv2D(128, (3,3), activation='relu', padding="same"),
    layers.BatchNormalization(),
    layers.MaxPooling2D(),

    layers.Conv2D(256, (3,3), activation='relu', padding="same"),
    layers.BatchNormalization(),
    layers.MaxPooling2D(),

    layers.Flatten(),

    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),

    layers.Dense(128, activation='relu'),
    layers.Dropout(0.3),

    layers.Dense(len(class_names), activation='softmax')
])

# Compile
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=20
)

# Save improved model
model.save("coffee_classifier_v2.h5")
print("Improved model saved as coffee_classifier_v2.h5")
