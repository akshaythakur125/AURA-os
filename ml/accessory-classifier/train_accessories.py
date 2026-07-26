"""
Train a multi-label accessory/jewellery classifier from CelebA attributes.

Why this exists: the app currently guesses accessories from edge density
(e.g. "lots of edges near the eyes => glasses"), which is exactly the kind of
unreliable heuristic that produces generic or wrong output. A small trained
model is dramatically more accurate and still runs on-device via TF.js.

Labels (all present in CelebA, all face/head-region):
  Eyeglasses, Wearing_Earrings, Wearing_Hat, Wearing_Necklace, Wearing_Necktie
  + Bags_Under_Eyes  (cross-checks our geometric under-eye measurement)

NOT trainable here: acne (CelebA has no acne label) and bracelets/watches
(CelebA is a face crop — wrists aren't in frame). Documented in RESULTS.md.

Run:
  PER_LABEL=1200 MAX_STREAM=60000 python train_accessories.py
"""
import os, sys, time, json
import numpy as np
from PIL import Image

IMG = 128
LABELS = [
    "Eyeglasses",
    "Wearing_Earrings",
    "Wearing_Hat",
    "Wearing_Necklace",
    "Wearing_Necktie",
    "Bags_Under_Eyes",
]
PER_LABEL = int(os.environ.get("PER_LABEL", "1200"))
MAX_STREAM = int(os.environ.get("MAX_STREAM", "60000"))
NEG_TARGET = int(os.environ.get("NEG_TARGET", "1800"))  # all-negative examples


def log(*a):
    print(f"[{time.strftime('%H:%M:%S')}]", *a, flush=True)


def pos(v):
    try:
        return float(v) > 0.5
    except Exception:
        return bool(v)


def prep(pil):
    """Full head crop — accessories live across hat/eyes/ears/neck, so unlike the
    beard model we do NOT crop tight to the chin."""
    return pil.convert("RGB").resize((IMG, IMG))


def collect():
    from datasets import load_dataset
    ds = load_dataset("flwrlabs/celeba", split="train", streaming=True)
    X, Y = [], []
    counts = {l: 0 for l in LABELS}
    negs = 0
    seen = 0
    for row in ds:
        seen += 1
        y = [1.0 if pos(row.get(l, 0)) else 0.0 for l in LABELS]
        any_pos = sum(y) > 0
        # Keep positives until each label's cap; keep a bounded pool of negatives.
        want = False
        if any_pos:
            # keep if it contributes to any label still under cap
            for i, l in enumerate(LABELS):
                if y[i] > 0 and counts[l] < PER_LABEL:
                    want = True
                    break
        elif negs < NEG_TARGET:
            want = True
        if want:
            try:
                arr = np.asarray(prep(row["image"]), dtype=np.uint8)
                if arr.shape == (IMG, IMG, 3):
                    X.append(arr); Y.append(y)
                    if any_pos:
                        for i, l in enumerate(LABELS):
                            if y[i] > 0:
                                counts[l] += 1
                    else:
                        negs += 1
            except Exception:
                pass
        if seen % 2000 == 0:
            log("streamed", seen, "kept", len(X), "counts", counts, "negs", negs)
        done = all(counts[l] >= PER_LABEL for l in LABELS) and negs >= NEG_TARGET
        if done or seen >= MAX_STREAM:
            break
    return np.array(X), np.array(Y, dtype="float32"), counts, negs, seen


def main():
    import tensorflow as tf
    log("collecting from CelebA (streaming)…")
    X, Y, counts, negs, seen = collect()
    log("collected", len(X), "images | label counts", counts, "| all-negative", negs, "| rows seen", seen)
    if len(X) < 800:
        log("NOT ENOUGH DATA — aborting"); sys.exit(2)

    idx = np.random.RandomState(42).permutation(len(X))
    X, Y = X[idx], Y[idx]
    n_val = int(len(X) * 0.15)
    Xtr, Ytr, Xva, Yva = X[n_val:], Y[n_val:], X[:n_val], Y[:n_val]
    log("train", len(Xtr), "val", len(Xva))

    def mkds(Xa, Ya, training):
        d = tf.data.Dataset.from_tensor_slices((Xa.astype("float32"), Ya))
        if training:
            d = d.shuffle(2048)
            aug = tf.keras.Sequential([
                tf.keras.layers.RandomFlip("horizontal"),
                tf.keras.layers.RandomBrightness(0.2),
                tf.keras.layers.RandomContrast(0.2),
            ])
            d = d.map(lambda x, y: (aug(x, training=True), y))
        return d.batch(32).prefetch(tf.data.AUTOTUNE)

    # MobileNetV2 (not V3): V3's fused hard-swish activation is NOT implemented
    # in the TF.js CPU backend, so a V3 model breaks on any device that falls
    # back from WebGL. V2 uses ReLU6, which is supported everywhere.
    base = tf.keras.applications.MobileNetV2(
        input_shape=(IMG, IMG, 3), include_top=False, weights="imagenet")
    base.trainable = False
    inp = tf.keras.Input((IMG, IMG, 3))
    # Bake V2's preprocessing in ([0,255] -> [-1,1]) so the browser can keep
    # feeding raw pixels exactly as before.
    x = tf.keras.layers.Rescaling(1.0 / 127.5, offset=-1.0)(inp)
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(len(LABELS), activation="sigmoid")(x)  # multi-label
    model = tf.keras.Model(inp, out)

    model.compile(tf.keras.optimizers.Adam(1e-3), "binary_crossentropy",
                  metrics=[tf.keras.metrics.AUC(name="auc", multi_label=True)])
    log("phase 1: head")
    model.fit(mkds(Xtr, Ytr, True), validation_data=mkds(Xva, Yva, False), epochs=int(os.environ.get("E1", "8")), verbose=2)

    base.trainable = True
    for l in base.layers[:-40]:
        l.trainable = False
    model.compile(tf.keras.optimizers.Adam(1e-5), "binary_crossentropy",
                  metrics=[tf.keras.metrics.AUC(name="auc", multi_label=True)])
    log("phase 2: fine-tune")
    model.fit(mkds(Xtr, Ytr, True), validation_data=mkds(Xva, Yva, False), epochs=int(os.environ.get("E2", "6")), verbose=2)

    # ── Honest per-label evaluation ──
    P = model.predict(mkds(Xva, Yva, False), verbose=0)
    log("\n=== PER-LABEL VALIDATION (threshold 0.5) ===")
    report = {}
    for i, l in enumerate(LABELS):
        yt = Yva[:, i] > 0.5
        yp = P[:, i] > 0.5
        tp = int(np.sum(yt & yp)); fp = int(np.sum(~yt & yp))
        fn = int(np.sum(yt & ~yp)); tn = int(np.sum(~yt & ~yp))
        prec = tp / (tp + fp) if tp + fp else 0.0
        rec = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
        acc = (tp + tn) / max(1, len(yt))
        report[l] = dict(precision=round(prec, 3), recall=round(rec, 3), f1=round(f1, 3),
                         acc=round(acc, 3), support=int(np.sum(yt)))
        log(f"  {l:20s} P={prec:.2f} R={rec:.2f} F1={f1:.2f} acc={acc:.2f} (n_pos={int(np.sum(yt))})")

    with open("results.json", "w") as f:
        json.dump({"labels": LABELS, "report": report, "counts": counts,
                   "train": len(Xtr), "val": len(Xva)}, f, indent=1)

    model.export("saved_model")
    log("saved -> saved_model (DONE)")


if __name__ == "__main__":
    main()
