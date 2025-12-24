"use client";

export async function exportCertificateToPdf(element: HTMLElement, fileName: string) {
  if (!element) {
    throw new Error("Certificate element not found");
  }

  // Skip image loading wait - html2canvas handles it
  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default ?? html2canvasModule;

  // Lower scale for faster generation
  const scale = 1.2;

  // Generate canvas - simplified options for speed
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: false,
    logging: false,
    removeContainer: true,
    ignoreElements: (element) => {
      return element.classList.contains("no-export");
    },
  });

  // Convert to PNG using toDataURL (synchronous, faster)
  const pngFileName = fileName.replace(/\.pdf$/i, ".png");
  const dataUrl = canvas.toDataURL("image/png", 0.92);
  
  // Create download link and trigger download immediately
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = pngFileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  
  // Clean up after a short delay
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}

