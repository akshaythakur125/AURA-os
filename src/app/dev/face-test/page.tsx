"use client";

import { useEffect, useState } from "react";
import { scanFace, loadImage } from "@/lib/face/faceScan";

// Dev-only harness to verify in-browser face scanning end to end.
export default function FaceTestPage() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const img = params.get("img") || "/celebs/global-street-tech.jpg";
        setStatus("loading-image");
        const el = await loadImage(img);
        setStatus("scanning");
        const t0 = performance.now();
        const r = await scanFace(el);
        const ms = Math.round(performance.now() - t0);
        setStatus(r ? "done" : "no-face");
        setResult(JSON.stringify({ ms, ...r }, null, 2));
      } catch (e) {
        setStatus("error");
        setResult(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>Face scan test</h1>
      <p data-testid="status">status: {status}</p>
      <pre data-testid="result" style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
    </div>
  );
}
