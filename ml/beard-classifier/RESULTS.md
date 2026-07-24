# Training results — run here, on CPU, from real data

I actually ran this pipeline in the dev sandbox (CPU, no GPU) against the public
**CelebA** dataset streamed from Hugging Face. This is a real trained model, not
a plan — but the honest verdict is: **not good enough to ship yet.**

## What ran

- Streamed a balanced subset from `flwrlabs/celeba` (clean / stubble / beard,
  derived from the `No_Beard` + `5_o_Clock_Shadow` attributes).
- MobileNetV3-Small transfer learning, 128px, tight chin-centered crop.
- Two runs; the better one used ~1400/class + 10+8 epochs.

## Numbers (best run)

- **Val accuracy: 72%** (3-class; chance = 33%).
- Per-class recall: clean **79%**, stubble **66%**, beard **71%**.
- The tighter chin crop lifted stubble from 28% → 66% vs the first run.

## Why it's NOT shipped

A held-out sanity check on our own celeb photos still produced the one failure
we refuse to ship:

```
ananya-sporty-luxe.jpg   ->  beard  (0.70)     # a woman, read as bearded
```

72% overall + a clean-shaven woman reading as "beard" is below the bar for a
paid feature. Threshold-hacking to pass 8 test images isn't real validation, so
the model stays out of the app.

## Why, honestly, and what would fix it

- **CPU + small subset + short training** (this sandbox) — not the full dataset
  or a GPU.
- **Crop mismatch**: CelebA faces are aligned; our photos aren't. Production
  should feed the model the **FaceMesh-aligned crop** (the app already computes
  the face box), not a naive center-bottom crop — that alone should cut the
  woman-false-positive.
- **Harder negatives**: more clean-shaven faces (incl. women with hair near the
  jaw) to stop the model keying on "dark lower face = beard".

The path that would clear the bar is the one in `README.md`: full CelebA + a
free Colab GPU + more epochs + the aligned crop. This run proves the pipeline
works end to end; it just needs the compute + alignment the sandbox can't give.

## Reproduce

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt datasets
PER_CLASS=1400 MAX_STREAM=45000 python run_here.py   # streams CelebA, trains, tests
```
