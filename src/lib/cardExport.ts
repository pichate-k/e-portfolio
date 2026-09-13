import { toPng } from "html-to-image";

interface DownloadCardOptions {
  element: HTMLElement;
  filename: string;
  pixelRatio?: number;
}

/**
 * Downloads a DOM element as a high-resolution PNG image
 */
export async function downloadCardImage({
  element,
  filename,
  pixelRatio = 2.5, // 560px * 2.5 ~= 1400px width (super crisp 300 DPI equivalent)
}: DownloadCardOptions): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      pixelRatio,
      cacheBust: true,
      skipAutoScale: true,
      style: {
        transform: "none",
        boxShadow: "none",
      },
    });

    const link = document.createElement("a");
    link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Failed to export card image:", err);
    throw err;
  }
}

/**
 * Downloads both front and back images side-by-side or sequentially
 */
export async function downloadBothSides(
  frontEl: HTMLElement,
  backEl: HTMLElement,
  baseFilename: string
): Promise<void> {
  await downloadCardImage({
    element: frontEl,
    filename: `${baseFilename}-front.png`,
  });

  // Short delay so browser initiates second download
  await new Promise((resolve) => setTimeout(resolve, 300));

  await downloadCardImage({
    element: backEl,
    filename: `${baseFilename}-back.png`,
  });
}
