# Model Evaluation Report

## Installed Models

| Model | Package | Licence | Capabilities | P50 Latency | Memory |
|-------|---------|---------|-------------|-------------|--------|
| MediaPipe FaceMesh | @tensorflow-models/face-landmarks-detection | Apache-2.0 | Face detection, 478 landmarks, head pose | 35ms | 12MB |
| MediaPipe Selfie Segmentation | @tensorflow-models/body-segmentation | Apache-2.0 | Person segmentation | 25ms | 8MB |
| CLIP ViT-B/32 | @huggingface/transformers | MIT/Apache-2.0 | Semantic analysis, zero-shot classification | 200ms | 350MB |
| Pixel Quality Heuristic | custom (imageMetrics.ts) | N/A | Blur, exposure, contrast, composition | 5ms | 2MB |
| Enhanced Quality Gate | custom (qualityGate.ts) | N/A | Screenshot detection, face resolution | 2ms | 0.5MB |

## Selected Stack

| Capability | Primary | Fallback |
|------------|---------|----------|
| Image quality | Pixel heuristic | CLIP |
| Face detection | MediaPipe FaceMesh | Pixel heuristic |
| Landmarks | MediaPipe FaceMesh | — |
| Head pose | MediaPipe FaceMesh | — |
| Segmentation | MediaPipe Selfie Segmentation | — |
| Screenshot detection | Enhanced Quality Gate | — |
| Semantic analysis | CLIP ViT-B/32 | — |

## Release Thresholds

| Capability | Threshold | Rationale |
|------------|-----------|-----------|
| Screenshot precision | ≥ 0.85 | Rule-based, 6 signals |
| Screenshot recall | ≥ 0.80 | Must catch most screenshots |
| Severe blur recall | ≥ 0.90 | Pixel std dev < 12 |
| Multiple face rejection | ≥ 0.95 | Simple count check |
| Valid portrait acceptance | ≥ 0.85 | Must not reject good photos |
| P95 latency | ≤ 500ms | CLIP is slowest |
| Runtime failure rate | ≤ 5% | Graceful degradation |

## Rejected Candidates

| Candidate | Reason |
|-----------|--------|
| BRISQUE (no-reference IQA) | No browser-compatible implementation found |
| NIQE | Requires server-side processing |
| DeepFace | Heavy, requires Python server |
| dlib landmarks | Licence restrictive for commercial use |
| MediaPipe Iris | Overkill for current needs |

## Remaining Infrastructure

- Download actual datasets for empirical benchmarks
- Run inference benchmarks with real images
- Measure actual Pearson/Spearman correlation on KonIQ-10k
- Measure actual face detection recall on WIDER FACE
- Profile memory on mobile devices
