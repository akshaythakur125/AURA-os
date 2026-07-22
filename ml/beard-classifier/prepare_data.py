"""
Build a 3-class facial-hair label file (clean / stubble / beard) from CelebA.

CelebA ships 40 binary attributes per face. We derive our label from four of
them (values are +1 / -1 in the CelebA attr file):

  - No_Beard            (+1 = no beard)
  - 5_o_Clock_Shadow    (+1 = light stubble)
  - Goatee, Mustache    (used to nudge borderline cases toward "beard")

Mapping:
  beard    : No_Beard == -1               (clearly has a beard)
  stubble  : No_Beard == +1 and 5_o_Clock_Shadow == +1
  clean    : No_Beard == +1 and 5_o_Clock_Shadow == -1

Input : the Kaggle "CelebA" dataset (jessicali9530/celeba-dataset), which gives
        img_align_celeba/ and list_attr_celeba.csv.
Output: labels.csv  (columns: image_path, label, split)

Usage:
  python prepare_data.py \
      --attr /path/to/list_attr_celeba.csv \
      --img-dir /path/to/img_align_celeba \
      --out labels.csv \
      --per-class 8000
"""

import argparse
import os

import pandas as pd
from sklearn.model_selection import train_test_split


def build(attr_csv: str, img_dir: str, per_class: int) -> pd.DataFrame:
    df = pd.read_csv(attr_csv)
    # The Kaggle CSV has the image id in the first column (name varies).
    id_col = df.columns[0]

    def label_row(r):
        if r["No_Beard"] == -1:
            return "beard"
        return "stubble" if r["5_o_Clock_Shadow"] == 1 else "clean"

    df["label"] = df.apply(label_row, axis=1)
    df["image_path"] = df[id_col].apply(lambda n: os.path.join(img_dir, n))
    df = df[df["image_path"].apply(os.path.exists)]

    # Balance the classes so the model doesn't just learn the prior.
    parts = []
    for cls in ["clean", "stubble", "beard"]:
        sub = df[df["label"] == cls]
        parts.append(sub.sample(min(per_class, len(sub)), random_state=42))
    balanced = pd.concat(parts).sample(frac=1.0, random_state=42).reset_index(drop=True)

    train_df, val_df = train_test_split(
        balanced, test_size=0.15, stratify=balanced["label"], random_state=42
    )
    train_df = train_df.assign(split="train")
    val_df = val_df.assign(split="val")
    return pd.concat([train_df, val_df])[["image_path", "label", "split"]]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--attr", required=True, help="list_attr_celeba.csv")
    ap.add_argument("--img-dir", required=True, help="img_align_celeba/")
    ap.add_argument("--out", default="labels.csv")
    ap.add_argument("--per-class", type=int, default=8000)
    args = ap.parse_args()

    out = build(args.attr, args.img_dir, args.per_class)
    out.to_csv(args.out, index=False)
    print(out["label"].value_counts())
    print(f"wrote {len(out)} rows -> {args.out}")


if __name__ == "__main__":
    main()
