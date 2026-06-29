import type { ShareCardData } from "@/types/share";

export function buildShareText(data: ShareCardData): string {
  const parts: string[] = [];

  if (data.auraScore > 0) {
    parts.push(`My Aura Score is ${data.auraScore}/100.`);
  }

  if (data.biggestStatusLeak) {
    parts.push(`Biggest status leak: ${data.biggestStatusLeak}.`);
  }

  if (data.strongestSignal) {
    parts.push(`Strongest signal: ${data.strongestSignal}.`);
  }

  if (data.quickFix) {
    parts.push(`Quick fix: ${data.quickFix}.`);
  }

  parts.push("AuraCheck showed my upgrade path. Find your biggest status leak.");

  return parts.join(" ");
}

export async function copyShareText(data: ShareCardData): Promise<boolean> {
  const text = buildShareText(data);

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
