"""
End-to-end CPU run: stream a balanced CelebA subset, train the clean/stubble/
beard classifier, evaluate, sanity-test on our own celeb photos (the woman MUST
NOT read as beard), and save the model. Logs progress so it can run in the bg.
"""
import os, sys, time, glob
import numpy as np
from PIL import Image

IMG = 128
PER_CLASS = int(os.environ.get("PER_CLASS", "1000"))
MAX_STREAM = int(os.environ.get("MAX_STREAM", "22000"))
CLASSES = ["clean", "stubble", "beard"]


def log(*a):
    print(f"[{time.strftime('%H:%M:%S')}]", *a, flush=True)


def pos(v):  # normalise CelebA attr encodings (0/1 or -1/1) to boolean
    try:
        return float(v) > 0.5
    except Exception:
        return bool(v)


def lower_crop(pil):
    # Tight chin/mouth crop (center-bottom) — avoids side hair/ears/clothing and
    # roughly matches the aligned face crop production feeds from FaceMesh.
    w, h = pil.size
    return pil.crop((int(w * 0.22), int(h * 0.50), int(w * 0.78), int(h * 0.98))).resize((IMG, IMG)).convert("RGB")


def collect():
    from datasets import load_dataset
    ds = load_dataset("flwrlabs/celeba", split="train", streaming=True)
    buckets = {c: [] for c in CLASSES}
    seen = 0
    for row in ds:
        seen += 1
        nb, shadow = pos(row.get("No_Beard", 1)), pos(row.get("5_o_Clock_Shadow", 0))
        cls = "beard" if not nb else ("stubble" if shadow else "clean")
        if len(buckets[cls]) < PER_CLASS:
            try:
                arr = np.asarray(lower_crop(row["image"]), dtype=np.uint8)
                if arr.shape == (IMG, IMG, 3):
                    buckets[cls].append(arr)
            except Exception:
                pass
        if seen % 1000 == 0:
            log("streamed", seen, "collected", {c: len(buckets[c]) for c in CLASSES})
        if all(len(buckets[c]) >= PER_CLASS for c in CLASSES) or seen >= MAX_STREAM:
            break
    X, y = [], []
    for ci, c in enumerate(CLASSES):
        for a in buckets[c]:
            X.append(a); y.append(ci)
    return np.array(X), np.array(y), {c: len(buckets[c]) for c in CLASSES}


def main():
    import tensorflow as tf
    log("collecting balanced subset from CelebA (streaming)…")
    X, y, counts = collect()
    log("collected", counts, "total", len(X))
    if len(X) < 300 or min(counts.values()) < 100:
        log("NOT ENOUGH DATA — aborting"); sys.exit(2)

    idx = np.random.RandomState(42).permutation(len(X))
    X, y = X[idx], y[idx]
    n_val = int(len(X) * 0.15)
    Xtr, ytr, Xva, yva = X[n_val:], y[n_val:], X[:n_val], y[:n_val]
    log("train", len(Xtr), "val", len(Xva))

    def ds(Xa, ya, training):
        d = tf.data.Dataset.from_tensor_slices((Xa.astype("float32"), ya))
        if training:
            d = d.shuffle(2048)
            aug = tf.keras.Sequential([tf.keras.layers.RandomFlip("horizontal"),
                                       tf.keras.layers.RandomBrightness(0.2),
                                       tf.keras.layers.RandomContrast(0.2)])
            d = d.map(lambda x, l: (aug(x, training=True), l))
        return d.batch(32).prefetch(tf.data.AUTOTUNE)

    base = tf.keras.applications.MobileNetV3Small(
        input_shape=(IMG, IMG, 3), include_top=False, weights="imagenet", include_preprocessing=True)
    base.trainable = False
    inp = tf.keras.Input((IMG, IMG, 3))
    x = base(inp, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(3, activation="softmax")(x)
    model = tf.keras.Model(inp, out)

    model.compile(tf.keras.optimizers.Adam(1e-3), "sparse_categorical_crossentropy", metrics=["accuracy"])
    log("phase 1: train head")
    model.fit(ds(Xtr, ytr, True), validation_data=ds(Xva, yva, False), epochs=10, verbose=2)

    base.trainable = True
    for l in base.layers[:-40]:
        l.trainable = False
    model.compile(tf.keras.optimizers.Adam(1e-5), "sparse_categorical_crossentropy", metrics=["accuracy"])
    log("phase 2: fine-tune")
    model.fit(ds(Xtr, ytr, True), validation_data=ds(Xva, yva, False), epochs=8, verbose=2)

    va = model.evaluate(ds(Xva, yva, False), verbose=0)
    log("VAL accuracy:", round(va[1], 3))
    pred = model.predict(ds(Xva, yva, False), verbose=0).argmax(1)
    cm = tf.math.confusion_matrix(yva, pred, num_classes=3).numpy()
    log("confusion matrix (rows=true clean/stubble/beard):\n", cm)

    # --- sanity test on OUR celeb photos: the woman must NOT read as beard ---
    log("sanity test on our celeb photos:")
    for f in sorted(glob.glob("../../public/celebs/*.jpg"))[:8]:
        try:
            arr = np.asarray(lower_crop(Image.open(f)), dtype="float32")[None]
            p = model.predict(arr, verbose=0)[0]
            log("  ", os.path.basename(f).ljust(28), CLASSES[p.argmax()], "probs", [round(float(z), 2) for z in p])
        except Exception as e:
            log("  ", f, "ERR", e)

    model.export("saved_model")
    log("saved -> saved_model  (DONE)")


if __name__ == "__main__":
    main()
