"""
Convert the trained SavedModel to a TF.js graph model the browser can run.

Run in a FRESH env (tensorflowjs pins specific TF versions):
  pip install tensorflowjs==4.17.0
  python export_tfjs.py --saved-model saved_model --out ../../public/models/beard

The output folder (model.json + *.bin shards, a few MB) drops straight into the
app's /public so it's served locally — the photo still never leaves the device.
"""

import argparse
import subprocess


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--saved-model", default="saved_model")
    ap.add_argument("--out", default="../../public/models/beard")
    args = ap.parse_args()

    cmd = [
        "tensorflowjs_converter",
        "--input_format=tf_saved_model",
        "--output_format=tfjs_graph_model",
        "--quantize_uint8",  # ~4x smaller for the browser
        args.saved_model,
        args.out,
    ]
    print("running:", " ".join(cmd))
    subprocess.run(cmd, check=True)
    print(f"TF.js model -> {args.out}")


if __name__ == "__main__":
    main()
