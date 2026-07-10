import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const score = searchParams.get("score") || "??";
  const category = searchParams.get("category") || "Your Aura";
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
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 40%, #2d1b4e 70%, #0a0a0f 100%)",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Aurora glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "20%",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "10%",
            width: "40%",
            height: "40%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          {/* Score */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              background: "linear-gradient(135deg, #a78bfa, #ec4899)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            {score}
          </div>

          {/* Category */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: 12,
            }}
          >
            {category}
          </div>

          {/* Leak */}
          {leak && (
            <div
              style={{
                fontSize: 20,
                color: "rgba(255, 255, 255, 0.5)",
                maxWidth: 600,
                textAlign: "center",
              }}
            >
              {leak}
            </div>
          )}

          {/* Brand */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 18,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.4)",
              letterSpacing: 2,
            }}
          >
            AURACHECK
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
