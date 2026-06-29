export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string
): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

export async function shareCanvasImage(
  canvas: HTMLCanvasElement,
  filename: string,
  text: string
): Promise<"shared" | "downloaded" | "unavailable"> {
  const blob = await canvasToBlob(canvas);
  if (!blob) return "unavailable";

  const file = new File([blob], filename.endsWith(".png") ? filename : `${filename}.png`, {
    type: "image/png",
  });

  if (typeof navigator !== "undefined" && "canShare" in navigator && navigator.canShare) {
    const shareData = { files: [file], title: text, text };
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return "shared";
      } catch {
        return "downloaded";
      }
    }
  }

  downloadCanvasAsPng(canvas, filename);
  return "downloaded";
}
