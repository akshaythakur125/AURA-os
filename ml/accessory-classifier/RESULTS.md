# Accessory / jewellery classifier — trained, evaluated, partially shipped

Trained here on CPU against **CelebA** attributes (streamed from Hugging Face).
This replaces the app's old edge-density guesses ("lots of edges near the eyes
⇒ glasses"), which were unreliable.

## What ran

- Streamed 22.5k CelebA rows → kept **7,123** images, balanced across 6 labels
  (~1.1k positives each + 1.6k all-negative).
- **MobileNetV2** @128px, multi-label (sigmoid + binary cross-entropy),
  8 epochs head + 6 fine-tune.
- Preprocessing baked into the graph, so the browser feeds raw 0-255 pixels.

### Why MobileNetV2, not V3
V3 trained fine but its fused **hard-swish** activation is **not implemented in
the TF.js CPU backend** — the model threw on any device without WebGL. V2 uses
ReLU6 (supported everywhere) *and* scored better:

| Label | V3 P/R | V2 P/R |
|---|---|---|
| Eyeglasses | 0.92 / 0.45 | **0.90 / 0.78** |
| Hat | 0.94 / 0.81 | **0.93 / 0.88** |
| Necktie | 0.73 / 0.86 | **0.83 / 0.83** |

## Results (validation, n=1068)

Because a wrong claim is worse than silence, thresholds were swept per label
and we only ship labels clearing **precision ≥ 0.85** at useful recall.

| Label | Threshold | Precision | Recall | Shipped |
|---|---|---|---|---|
| Eyeglasses | 0.40 | **0.86** | 0.81 | ✅ |
| Wearing_Hat | 0.30 | **0.91** | 0.94 | ✅ |
| Wearing_Necktie | 0.60 | **0.86** | 0.82 | ✅ |
| Wearing_Earrings | — | ≤0.67 | — | ❌ |
| Wearing_Necklace | — | ≤0.54 | — | ❌ |
| Bags_Under_Eyes | — | ≤0.71 | 0.32 | ❌ |

Earrings/necklaces are small and often occluded in a face crop; the geometric
under-eye measurement in `skinDetail.ts` beats the model, so it stays.

## A face crop is REQUIRED

Tested on real full-body photos with and without the MediaPipe face box:

| Photo | No box | With face box |
|---|---|---|
| glasses photo | glasses 0.30 ❌ missed, **hat 0.88 false positive** | **glasses 0.84 ✅**, hat 0.02 ✅ |
| sunglasses photo | — | **glasses 0.86 ✅** |
| 11 face-detected photos | — | 2 true positives, **0 false positives** |

So `detectAccessories()` **returns null without a face box** rather than
guessing. The one false positive we saw (hat 0.54) occurred only on the
no-face fallback, which is now removed.

## Not trainable from this dataset

- **Acne** — CelebA has no acne/blemish label. Not attempted; a wrong "you have
  acne" is worse than no answer. `skinDetail.ts` reports what is measurable
  (evenness, texture, shine, under-eye) and states it isn't a dermatological
  assessment.
- **Bracelets / watches** — CelebA is a face crop; wrists aren't in frame.

## Reproduce

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install tensorflow-cpu pillow numpy datasets
PER_LABEL=1100 MAX_STREAM=60000 NEG_TARGET=1600 python train_accessories.py
BAR=0.85 MIN_RECALL=0.25 python eval_thresholds.py     # -> thresholds.json

# convert (separate env; tfjs pins its own TF)
python3 -m venv .venv-tfjs && . .venv-tfjs/bin/activate
pip install tensorflowjs && pip install "protobuf==6.31.1"
tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model \
  "--quantize_float16=*" saved_model ../../public/models/accessories
```

Note: `--quantize_uint8` collapsed accuracy; **float16** (4.4 MB) is the
shipped quantization.
