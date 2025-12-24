"use client";

export async function exportCertificateToPdf(element: HTMLElement, fileName: string) {
  if (!element) {
    throw new Error("Certificate element not found");
  }

  // Quick check for images - don't wait too long
  const images = element.querySelectorAll("img");
  const imagePromises = Array.from(images).map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
          return;
        }
        // Very short timeout - continue quickly
        const timeout = setTimeout(() => resolve(), 1000); // 1 second max per image
        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(); // Continue even if image fails
        };
      })
  );
  
  // Wait for images but don't block too long
  await Promise.race([
    Promise.all(imagePromises),
    new Promise<void>((resolve) => setTimeout(resolve, 2000)) // Max 2 seconds total for all images
  ]);

  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default ?? html2canvasModule;

  // Lower scale for faster generation (1.5 instead of 2.0)
  const scale = 1.5;

  // Generate canvas quickly
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    ignoreElements: (element) => {
      return element.classList.contains("no-export");
    },
    onclone: (clonedDocument) => {
      const certificateElement = clonedDocument.querySelector(".certificate-export") as HTMLElement | null;
      if (certificateElement) {
        const cleanStyles: Partial<CSSStyleDeclaration> = {
          boxShadow: "none",
          filter: "none",
          mixBlendMode: "normal",
          backgroundImage: "none",
          backgroundColor: "#ffffff",
        };

        const applyCleanStyles = (node: Element) => {
          const htmlElement = node as HTMLElement;
          const computedStyle = window.getComputedStyle(htmlElement);
          if (computedStyle.color && computedStyle.color.includes("lab(")) {
            htmlElement.style.color = "#000000";
          }
          if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes("lab(")) {
            htmlElement.style.backgroundColor = "#ffffff";
          }
          if (computedStyle.borderColor && computedStyle.borderColor.includes("lab(")) {
            htmlElement.style.borderColor = "#000000";
          }
          Object.entries(cleanStyles).forEach(([property, value]) => {
            if (value !== undefined) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (htmlElement.style as any)[property] = value;
            }
          });
          Array.from(node.children).forEach(applyCleanStyles);
        };

        applyCleanStyles(certificateElement);
      }
    },
  });

  // Convert to PNG and download instantly
  const pngFileName = fileName.replace(/\.pdf$/i, ".png");
  
  // Use toBlob for better performance
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error("Failed to generate PNG");
    }
    
    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = pngFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, "image/png", 0.95); // High quality PNG
}

