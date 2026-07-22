# Train our own facial-hair classifier (free, on-device)

A tiny **clean / stubble / beard** classifier that runs **in the browser** — so
it keeps AuraCheck's "the photo never leaves your device" promise, unlike the
paid cloud SDKs.

> **Status: pipeline authored, not yet trained.** The code here is complete and
> ready to run, but the actual training needs a GPU and the CelebA dataset —
> that runs on **free Google Colab** (~30–60 min), not inside the app repo.
> Nothing here is a trained model yet; don't ship it as if it were.

## Why this one (and not skin quality)

Facial hair is **trainable for free** because a good public, labelled dataset
exists — **CelebA** (200k faces, 40 attributes incl. `No_Beard`,
`5_o_Clock_Shadow`, `Goatee`, `Mustache`, `Sideburns`). Skin *quality*
(oiliness/acne/texture severity) has **no comparable ethical public dataset**;
doing that well needs licensed dermatology data — a separate, bigger project.

## Recipe (Google Colab, free GPU)

1. **New Colab notebook → Runtime → Change runtime type → GPU.**
2. Get CelebA (Kaggle `jessicali9530/celeba-dataset`) — you get
   `img_align_celeba/` + `list_attr_celeba.csv`.
3. Upload this folder (or `git clone` the repo) and run:

   ```bash
   pip install -r requirements.txt
   python prepare_data.py --attr list_attr_celeba.csv --img-dir img_align_celeba --out labels.csv --per-class 8000
   python train.py --labels labels.csv --epochs 8 --fine-tune-epochs 5 --out saved_model
   ```

   Expect roughly **88–93% val accuracy** on the 3 classes (clean/stubble/beard
   is a much easier problem than skin grading — that's the point).

4. Export to a browser model (fresh cell — `tensorflowjs` pins its own TF):

   ```bash
   pip install tensorflowjs==4.17.0
   python export_tfjs.py --saved-model saved_model --out public/models/beard
   ```

5. Download `public/models/beard/` (a few MB: `model.json` + `*.bin`) and commit
   it to the app's `public/models/beard/`.

## Wire it into the app

The scan already crops the face (FaceMesh gives the bounding box). Once the model
is in `/public/models/beard/`, add a lazy inference step in
`src/lib/face/faceScan.ts`:

```ts
// npm i @tensorflow/tfjs   (lazy-import so it only loads on a scan)
const tf = await import("@tensorflow/tfjs");
const model = await tf.loadGraphModel("/models/beard/model.json");
// crop the lower ~60% of the face box, resize to 128x128, run:
const probs = model.predict(input) as tf.Tensor;   // [clean, stubble, beard]
```

Feed the result into `FaceShapeCard` as a real "facial hair: stubble" line with
a confidence — replacing the pixel heuristic that (correctly) never shipped.

## Honesty checklist before shipping the trained model

- [ ] Val accuracy is genuinely > ~85% and it does **not** call clean-shaven
      women "bearded" (test on a held-out set with both).
- [ ] The `.bin` shards + `model.json` are actually committed and load in prod.
- [ ] Inference runs on-device (no network call with the image).
