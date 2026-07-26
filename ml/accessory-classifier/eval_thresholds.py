"""
Per-label threshold sweep.

For AuraCheck we only ever SAY something when we're confident ("you're wearing
glasses"). Missing an accessory is harmless; claiming a wrong one is not. So we
optimise for PRECISION and pick, per label, the lowest threshold that still
clears the precision bar with useful recall. Labels that can't clear the bar at
any threshold are not shipped.
"""
import os, json
import numpy as np

IMG = 128
LABELS = ["Eyeglasses", "Wearing_Earrings", "Wearing_Hat", "Wearing_Necklace", "Wearing_Necktie", "Bags_Under_Eyes"]
PER_LABEL = int(os.environ.get("PER_LABEL", "1100"))
MAX_STREAM = int(os.environ.get("MAX_STREAM", "60000"))
NEG_TARGET = int(os.environ.get("NEG_TARGET", "1600"))
PRECISION_BAR = float(os.environ.get("BAR", "0.85"))
MIN_RECALL = float(os.environ.get("MIN_RECALL", "0.25"))

from PIL import Image  # noqa


def pos(v):
    try:
        return float(v) > 0.5
    except Exception:
        return bool(v)


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
        want = False
        if any_pos:
            for i, l in enumerate(LABELS):
                if y[i] > 0 and counts[l] < PER_LABEL:
                    want = True; break
        elif negs < NEG_TARGET:
            want = True
        if want:
            try:
                arr = np.asarray(row["image"].convert("RGB").resize((IMG, IMG)), dtype=np.uint8)
                if arr.shape == (IMG, IMG, 3):
                    X.append(arr); Y.append(y)
                    if any_pos:
                        for i, l in enumerate(LABELS):
                            if y[i] > 0: counts[l] += 1
                    else:
                        negs += 1
            except Exception:
                pass
        if all(counts[l] >= PER_LABEL for l in LABELS) and negs >= NEG_TARGET:
            break
        if seen >= MAX_STREAM:
            break
    return np.array(X), np.array(Y, dtype="float32")


def main():
    import tensorflow as tf
    X, Y = collect()
    idx = np.random.RandomState(42).permutation(len(X))
    X, Y = X[idx], Y[idx]
    n_val = int(len(X) * 0.15)
    Xva, Yva = X[:n_val], Y[:n_val]
    print(f"val set: {len(Xva)}")

    m = tf.saved_model.load("saved_model")
    fn = m.signatures["serve"]
    preds = []
    for i in range(0, len(Xva), 64):
        batch = tf.constant(Xva[i:i + 64].astype("float32"))
        out = fn(batch)
        preds.append(list(out.values())[0].numpy())
    P = np.concatenate(preds, 0)

    chosen = {}
    print("\n=== THRESHOLD SWEEP (precision / recall) ===")
    for i, l in enumerate(LABELS):
        yt = Yva[:, i] > 0.5
        row = []
        best = None
        for t in [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95]:
            yp = P[:, i] > t
            tp = int(np.sum(yt & yp)); fp = int(np.sum(~yt & yp)); fn_ = int(np.sum(yt & ~yp))
            prec = tp / (tp + fp) if tp + fp else 0.0
            rec = tp / (tp + fn_) if tp + fn_ else 0.0
            row.append(f"t={t}:P={prec:.2f}/R={rec:.2f}")
            if prec >= PRECISION_BAR and rec >= MIN_RECALL and best is None:
                best = (t, round(prec, 3), round(rec, 3))
        print(f"\n{l}")
        print("   " + "  ".join(row))
        if best:
            chosen[l] = {"threshold": best[0], "precision": best[1], "recall": best[2]}
            print(f"   -> SHIP at t={best[0]} (P={best[1]}, R={best[2]})")
        else:
            print(f"   -> DO NOT SHIP (cannot reach P>={PRECISION_BAR} with R>={MIN_RECALL})")

    with open("thresholds.json", "w") as f:
        json.dump({"precision_bar": PRECISION_BAR, "min_recall": MIN_RECALL, "ship": chosen}, f, indent=1)
    print("\nshippable labels:", list(chosen.keys()))
    print("wrote thresholds.json")


if __name__ == "__main__":
    main()
