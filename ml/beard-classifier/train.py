"""
Train a small facial-hair classifier (clean / stubble / beard) with transfer
learning on MobileNetV3-Small — deliberately tiny so it runs in the browser.

Two-phase training: (1) freeze the ImageNet backbone and train the head, then
(2) unfreeze the top of the backbone and fine-tune at a low LR.

Usage (Colab GPU recommended):
  python train.py --labels labels.csv --epochs 8 --fine-tune-epochs 5 --out saved_model
"""

import argparse

import pandas as pd
import tensorflow as tf

CLASSES = ["clean", "stubble", "beard"]
IMG = 128


def make_ds(df: pd.DataFrame, training: bool, batch: int) -> tf.data.Dataset:
    paths = df["image_path"].values
    labels = df["label"].map(CLASSES.index).values

    def load(path, label):
        img = tf.io.decode_jpeg(tf.io.read_file(path), channels=3)
        # Center-crop to the lower ~60% of the face (mouth/jaw/chin) where facial
        # hair lives, then resize — focuses the model on the relevant region.
        h = tf.shape(img)[0]
        img = img[tf.cast(tf.cast(h, tf.float32) * 0.4, tf.int32):, :, :]
        img = tf.image.resize(img, (IMG, IMG))
        return img, label

    ds = tf.data.Dataset.from_tensor_slices((paths, labels))
    if training:
        ds = ds.shuffle(4096)
    ds = ds.map(load, num_parallel_calls=tf.data.AUTOTUNE)
    if training:
        aug = tf.keras.Sequential([
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomBrightness(0.2),
            tf.keras.layers.RandomContrast(0.2),
        ])
        ds = ds.map(lambda x, y: (aug(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)
    return ds.batch(batch).prefetch(tf.data.AUTOTUNE)


def build_model() -> tf.keras.Model:
    base = tf.keras.applications.MobileNetV3Small(
        input_shape=(IMG, IMG, 3), include_top=False, weights="imagenet", include_preprocessing=True
    )
    base.trainable = False
    inp = tf.keras.Input((IMG, IMG, 3))
    x = base(inp, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(len(CLASSES), activation="softmax")(x)
    return tf.keras.Model(inp, out), base


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--labels", required=True)
    ap.add_argument("--epochs", type=int, default=8)
    ap.add_argument("--fine-tune-epochs", type=int, default=5)
    ap.add_argument("--batch", type=int, default=64)
    ap.add_argument("--out", default="saved_model")
    args = ap.parse_args()

    df = pd.read_csv(args.labels)
    train_ds = make_ds(df[df.split == "train"], True, args.batch)
    val_ds = make_ds(df[df.split == "val"], False, args.batch)

    model, base = build_model()
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3),
                  loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)

    # Fine-tune the top of the backbone.
    base.trainable = True
    for layer in base.layers[:-40]:
        layer.trainable = False
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-5),
                  loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=args.fine_tune_epochs)

    model.export(args.out)  # SavedModel for the TF.js converter
    print(f"saved -> {args.out}")


if __name__ == "__main__":
    main()
