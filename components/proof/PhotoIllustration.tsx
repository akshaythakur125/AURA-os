"use client";

interface PhotoIllustrationProps {
  variant: "before" | "after";
  scenario: "lighting" | "background" | "outfit" | "framing" | "profile" | "consistency" | "glowup" | "waste";
}

export function PhotoIllustration({ variant, scenario }: PhotoIllustrationProps) {
  const isBefore = variant === "before";

  const configs: Record<string, { bg: string; person: string; outfit: string; accent: string; lighting: string }> = {
    lighting: {
      bg: isBefore ? "#1a0a0a" : "#0a1a0a",
      person: isBefore ? "#2a1515" : "#1a3a1a",
      outfit: isBefore ? "#1a1a1a" : "#2a4a2a",
      accent: isBefore ? "#4a1a1a" : "#2a6a2a",
      lighting: isBefore ? "url(#bad-lighting)" : "url(#good-lighting)",
    },
    background: {
      bg: isBefore ? "#1a1a2e" : "#0a1a0a",
      person: isBefore ? "#2a2a3a" : "#1a3a1a",
      outfit: isBefore ? "#1a1a2a" : "#2a4a2a",
      accent: isBefore ? "#3a3a4a" : "#2a5a2a",
      lighting: isBefore ? "url(#busy-bg)" : "url(#clean-bg)",
    },
    outfit: {
      bg: isBefore ? "#1a1a1a" : "#0a1a0a",
      person: isBefore ? "#2a2a2a" : "#1a3a1a",
      outfit: isBefore ? "#0a0a0a" : "#2a4a2a",
      accent: isBefore ? "#3a3a3a" : "#2a5a2a",
      lighting: isBefore ? "url(#mismatch)" : "url(#coordinated)",
    },
    framing: {
      bg: isBefore ? "#1a1a2e" : "#0a1a0a",
      person: isBefore ? "#2a2a3a" : "#1a3a1a",
      outfit: isBefore ? "#1a1a2a" : "#2a4a2a",
      accent: isBefore ? "#3a3a4a" : "#2a5a2a",
      lighting: isBefore ? "url(#bad-frame)" : "url(#good-frame)",
    },
    profile: {
      bg: isBefore ? "#1a0a1a" : "#0a1a0a",
      person: isBefore ? "#2a1a2a" : "#1a3a1a",
      outfit: isBefore ? "#1a1a1a" : "#2a4a2a",
      accent: isBefore ? "#4a2a4a" : "#2a5a2a",
      lighting: isBefore ? "url(#dark-profile)" : "url(#bright-profile)",
    },
    consistency: {
      bg: isBefore ? "#1a1a1a" : "#0a1a0a",
      person: isBefore ? "#2a2a2a" : "#1a3a1a",
      outfit: isBefore ? "#1a1a1a" : "#2a4a2a",
      accent: isBefore ? "#3a3a3a" : "#2a5a2a",
      lighting: isBefore ? "url(#inconsistent)" : "url(#consistent)",
    },
    glowup: {
      bg: isBefore ? "#1a0a0a" : "#0a1a0a",
      person: isBefore ? "#2a1515" : "#1a3a1a",
      outfit: isBefore ? "#1a1a1a" : "#2a4a2a",
      accent: isBefore ? "#4a1a1a" : "#2a6a2a",
      lighting: isBefore ? "url(#before-glow)" : "url(#after-glow)",
    },
    waste: {
      bg: isBefore ? "#1a1a2e" : "#0a1a0a",
      person: isBefore ? "#2a2a3a" : "#1a3a1a",
      outfit: isBefore ? "#1a1a2a" : "#2a4a2a",
      accent: isBefore ? "#3a3a4a" : "#2a5a2a",
      lighting: isBefore ? "url(#wasted)" : "url(#intentional)",
    },
  };

  const c = configs[scenario] || configs.lighting;

  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${scenario}-bg-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.bg} />
          <stop offset="100%" stopColor={isBefore ? "#0a0a0a" : "#0a150a"} />
        </linearGradient>
        <radialGradient id={`${scenario}-light-${variant}`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={isBefore ? "#1a1a2a" : "#2a4a2a"} stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id={`${scenario}-blur-${variant}`}>
          <feGaussianBlur stdDeviation={isBefore ? "2" : "0.5"} />
        </filter>
      </defs>

      {/* Background */}
      <rect width="200" height="260" fill={`url(#${scenario}-bg-${variant})`} />

      {/* Lighting effect */}
      <rect width="200" height="260" fill={`url(#${scenario}-light-${variant})`} />

      {/* Room/setting elements */}
      {isBefore ? (
        <>
          {/* Busy background - cluttered room */}
          <rect x="10" y="20" width="40" height="60" fill="#1a1a2a" opacity="0.4" rx="2" />
          <rect x="150" y="30" width="35" height="50" fill="#1a1a2a" opacity="0.3" rx="2" />
          <rect x="60" y="15" width="25" height="35" fill="#2a2a3a" opacity="0.3" rx="2" />
          {/* Messy items */}
          <circle cx="30" cy="100" r="8" fill="#2a2a3a" opacity="0.3" />
          <rect x="140" y="90" width="20" height="15" fill="#2a2a3a" opacity="0.3" rx="2" />
        </>
      ) : (
        <>
          {/* Clean background - minimal wall */}
          <rect x="0" y="0" width="200" height="180" fill="#0a1a0a" opacity="0.5" />
          <line x1="0" y1="180" x2="200" y2="180" stroke="#1a3a1a" strokeWidth="0.5" opacity="0.5" />
        </>
      )}

      {/* Person silhouette - body */}
      <ellipse cx="100" cy="220" rx="55" ry="35" fill={c.person} opacity="0.8" />

      {/* Person silhouette - torso */}
      <path
        d="M60 140 Q100 120 140 140 L145 200 Q100 210 55 200 Z"
        fill={c.outfit}
        opacity="0.9"
      />

      {/* Person silhouette - head */}
      <circle cx="100" cy="100" r="30" fill={c.person} opacity="0.9" />

      {/* Hair */}
      <path
        d="M70 90 Q100 65 130 90 Q135 75 100 60 Q65 75 70 90"
        fill={isBefore ? "#1a1a2a" : "#0a2a0a"}
        opacity="0.8"
      />

      {/* Outfit details */}
      {isBefore ? (
        <>
          {/* Bad outfit - mismatched, wrinkled */}
          <path
            d="M65 145 L135 145 L138 195 Q100 205 62 195 Z"
            fill={c.outfit}
            opacity="0.7"
            stroke="#1a1a2a"
            strokeWidth="0.5"
          />
          {/* Wrinkle lines */}
          <line x1="75" y1="155" x2="85" y2="170" stroke="#0a0a1a" strokeWidth="0.5" opacity="0.5" />
          <line x1="115" y1="150" x2="125" y2="165" stroke="#0a0a1a" strokeWidth="0.5" opacity="0.5" />
          <line x1="90" y1="160" x2="95" y2="180" stroke="#0a0a1a" strokeWidth="0.5" opacity="0.4" />
        </>
      ) : (
        <>
          {/* Good outfit - clean, fitted */}
          <path
            d="M65 145 L135 145 L138 195 Q100 205 62 195 Z"
            fill={c.outfit}
            opacity="0.9"
            stroke="#1a4a1a"
            strokeWidth="0.5"
          />
          {/* Clean lines */}
          <line x1="100" y1="145" x2="100" y2="195" stroke="#1a4a1a" strokeWidth="0.3" opacity="0.4" />
        </>
      )}

      {/* Arms */}
      <path
        d={isBefore ? "M60 150 L40 180 L45 185 L65 155" : "M60 150 L45 175 L50 180 L65 155"}
        fill={c.person}
        opacity="0.8"
      />
      <path
        d={isBefore ? "M140 150 L160 180 L155 185 L135 155" : "M140 150 L155 175 L150 180 L135 155"}
        fill={c.person}
        opacity="0.8"
      />

      {/* Face features - minimal */}
      <circle cx="90" cy="95" r="2" fill={isBefore ? "#1a1a2a" : "#0a2a0a"} opacity="0.6" />
      <circle cx="110" cy="95" r="2" fill={isBefore ? "#1a1a2a" : "#0a2a0a"} opacity="0.6" />
      <path
        d={isBefore ? "M95 108 Q100 112 105 108" : "M95 106 Q100 110 105 106"}
        stroke={isBefore ? "#1a1a2a" : "#0a2a0a"}
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />

      {/* Lighting overlay for "after" - warm glow */}
      {!isBefore && (
        <circle cx="100" cy="80" r="60" fill="#2a4a2a" opacity="0.15" />
      )}

      {/* Score indicator dot */}
      <circle
        cx="180"
        cy="20"
        r="8"
        fill={isBefore ? "#ef4444" : "#22c55e"}
        opacity="0.8"
      />
    </svg>
  );
}
