# Dataset Privacy and Storage

## Storage Locations

| Data Type | Location | Git |
|-----------|----------|-----|
| Raw public datasets | `datasets/raw/<dataset-id>/` | Excluded |
| Synthetic fixtures | `datasets/generated/` | Excluded |
| Private/consented images | `datasets/private/` | Excluded |
| Dataset cache | `datasets/cache/` | Excluded |
| Model weights | `models/` | Excluded |
| Registry + annotations | `datasets/registry/` | Included |
| Benchmark reports | `artifacts/benchmarks/` | Excluded |
| Annotation labels | localStorage (browser) | N/A |

## Rules

- Raw images are never committed to Git (`.gitignore` enforced).
- Images are never sent to analytics or error monitoring.
- Images are never included in logs.
- Temporary crops and derivatives are deleted after use.
- Dataset caches are cleared manually via `rm -rf datasets/cache/`.
- Benchmark reports reference image IDs, not raw image data.
- Private local fixtures are separated from public fixtures by directory.
- Production user uploads are excluded from training and evaluation by design (localStorage only, never server-stored for this purpose).
- No images leave the browser without explicit user consent.
- Dataset images may be stored locally for evaluation only.

## Retention

- Raw datasets: retained until manually deleted.
- Synthetic fixtures: regenerated on demand.
- Benchmark reports: retained until overwritten.
- Annotation labels: retained in browser until cleared.

## Access Control

- Annotation app at `/dev/annotate` is noindex and not publicly linked.
- Debug routes are noindex.
- No role-based access control on local filesystem.
