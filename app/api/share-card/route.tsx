import { ImageResponse } from "next/og";
import { toDataURL } from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "single";
  const appUrl = searchParams.get("url") || "https://auracheck.vercel.app";

  let qrDataUri = "";
  try {
    qrDataUri = await toDataURL(appUrl, { width: 200, margin: 1 });
  } catch {
    // QR generation failed
  }

  // Battle mode
  if (mode === "battle") {
    const leftScore = parseInt(searchParams.get("leftScore") || "0", 10);
    const rightScore = parseInt(searchParams.get("rightScore") || "0", 10);
    const leftLabel = searchParams.get("leftLabel") || "You";
    const rightLabel = searchParams.get("rightLabel") || "Them";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "linear-gradient(135deg, #050a14 0%, #0d1b2a 50%, #1a0a1e 100%)",
            padding: "48px 32px",
            position: "relative",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <div style={{ position: "absolute", top: "-120px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)" }} />

          <div style={{ fontSize: 14, color: "#a78bfa", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            AuraCheck Battle
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 48, width: "100%", maxWidth: 700 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: 24, borderRadius: 16, background: leftScore >= rightScore ? "rgba(250,204,21,0.08)" : "rgba(255,255,255,0.03)", border: leftScore >= rightScore ? "2px solid rgba(250,204,21,0.3)" : "1px solid rgba(255,255,255,0.05)" }}>
              {leftScore >= rightScore && <span style={{ fontSize: 32, marginBottom: 8 }}>👑</span>}
              <span style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>{leftLabel}</span>
              <span style={{ fontSize: 96, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>{leftScore}</span>
              <span style={{ fontSize: 14, color: "#666" }}>/ 100</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#666" }}>VS</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: 24, borderRadius: 16, background: rightScore >= leftScore ? "rgba(250,204,21,0.08)" : "rgba(255,255,255,0.03)", border: rightScore >= leftScore ? "2px solid rgba(250,204,21,0.3)" : "1px solid rgba(255,255,255,0.05)" }}>
              {rightScore >= leftScore && <span style={{ fontSize: 32, marginBottom: 8 }}>👑</span>}
              <span style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>{rightLabel}</span>
              <span style={{ fontSize: 96, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>{rightScore}</span>
              <span style={{ fontSize: 14, color: "#666" }}>/ 100</span>
            </div>
          </div>

          <span style={{ marginTop: 32, fontSize: 18, color: "#d8b4fe", fontWeight: 600, textAlign: "center" }}>
            AuraCheck battle: {leftScore} vs {rightScore} · who wins?
          </span>

          {qrDataUri ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
              <img src={qrDataUri} width={140} height={140} style={{ borderRadius: 16 }} />
              <span style={{ fontSize: 12, color: "#666", marginTop: 8 }}>Check your Aura Score</span>
            </div>
          ) : (
            <span style={{ marginTop: 48, fontSize: 14, color: "#666" }}>
              {appUrl.replace("https://", "")} · Check your Aura Score
            </span>
          )}

          <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#555" }}>
            {appUrl.replace("https://", "")} · Presentation guidance only
          </div>
        </div>
      ),
      { width: 1080, height: 1920 },
    );
  }

  // Single score mode (default)
  const score = parseInt(searchParams.get("score") || "0", 10);
  const category = searchParams.get("category") || "";
  const signal = searchParams.get("signal") || "";
  const leak = searchParams.get("leak") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(135deg, #050a14 0%, #0d1b2a 50%, #1a0a1e 100%)",
          padding: "48px 32px",
          position: "relative",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ position: "absolute", top: "-120px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)" }} />

        <div style={{ fontSize: 14, color: "#a78bfa", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          AuraCheck Result
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
          <span style={{ fontSize: 128, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 20, color: "#666", marginTop: -8 }}>/ 100</span>
          <span style={{ fontSize: 14, color: "#a78bfa", marginTop: 16, padding: "6px 24px", borderRadius: 20, background: "rgba(147,51,234,0.15)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Aura Score
          </span>
        </div>

        <div style={{ marginTop: 48, padding: "8px 28px", borderRadius: 20, background: "rgba(255,255,255,0.04)", fontSize: 20, color: "#ffffff", fontWeight: 600, textAlign: "center" }}>
          {category || "Your Category"}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 48, width: "100%", maxWidth: 600 }}>
          <div style={{ flex: 1, padding: 20, borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Strongest Signal</span>
            <span style={{ fontSize: 15, color: "#ffffff", fontWeight: 600 }}>{signal || "—"}</span>
          </div>
          <div style={{ flex: 1, padding: 20, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Biggest Vibe Leak</span>
            <span style={{ fontSize: 15, color: "#ffffff", fontWeight: 600 }}>{leak || "—"}</span>
          </div>
        </div>

        {qrDataUri ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 48 }}>
            <img src={qrDataUri} width={160} height={160} style={{ borderRadius: 16 }} />
            <span style={{ fontSize: 13, color: "#666", marginTop: 8 }}>Scan to check your Aura Score</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 56 }}>
            <span style={{ fontSize: 16, color: "#d8b4fe", fontWeight: 600 }}>Check your Aura Score →</span>
            <span style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{appUrl.replace("https://", "")}</span>
          </div>
        )}

        <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#555" }}>
          {appUrl.replace("https://", "")} · Presentation guidance only
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
