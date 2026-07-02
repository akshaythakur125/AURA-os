import { ImageResponse } from "next/og";

export const alt = "AuraCheck | First-Impression Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050a14 0%, #0d1b2a 50%, #1a0a1e 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-60px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)",
          }}
        />
        <span
          style={{
            fontSize: "96px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #f0f4ff 0%, #818cf8 50%, #f472b6 100%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.1,
          }}
        >
          AuraCheck
        </span>
        <span
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginTop: "12px",
            fontWeight: 500,
          }}
        >
          First-Impression Intelligence
        </span>
      </div>
    ),
    { ...size },
  );
}
