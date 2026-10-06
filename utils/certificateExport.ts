"use client";

// Helper function to get RGB value from computed style
// Browsers convert oklab/lab to RGB in computed styles, so we use that
const getRgbFromComputed = (computedValue: string, fallback: string): string => {
  if (computedValue.startsWith("rgb")) {
    return computedValue;
  }
  if (computedValue.startsWith("#")) {
    return computedValue;
  }
  if (
    computedValue === "transparent" ||
    computedValue === "initial" ||
    computedValue === "inherit"
  ) {
    return computedValue;
  }
  if (
    computedValue.includes("oklab(") ||
    computedValue.includes("lab(") ||
    computedValue.includes("oklch(") ||
    computedValue.includes("lch(")
  ) {
    return fallback;
  }
  return computedValue || fallback;
};

// Define onclone callback to sanitize styles and images
const oncloneCallback = (clonedDocument: Document) => {
  // CRITICAL FIX: Inject style tag to override ALL oklab/lab colors BEFORE html2canvas processes
  const styleOverride = clonedDocument.createElement("style");
  styleOverride.textContent = `
    /* Force all colors to RGB - prevents oklab/lab parsing errors */
    .certificate-export * {
      color: rgb(0, 0, 0) !important;
      background-color: rgb(255, 255, 255) !important;
      border-color: rgb(0, 0, 0) !important;
    }
    /* Preserve green colors for certificate */
    .certificate-export .text-green-800,
    .certificate-export .text-green-900 { color: rgb(22, 101, 52) !important; }
    .certificate-export .text-green-600 { color: rgb(22, 163, 74) !important; }
    .certificate-export .text-green-700 { color: rgb(21, 128, 61) !important; }
    .certificate-export .text-gray-500 { color: rgb(107, 114, 128) !important; }
    .certificate-export .text-gray-600 { color: rgb(75, 85, 99) !important; }
    .certificate-export .text-gray-700 { color: rgb(55, 65, 81) !important; }
    .certificate-export .text-gray-800 { color: rgb(31, 41, 55) !important; }
    .certificate-export .bg-white { background-color: rgb(255, 255, 255) !important; }
    .certificate-export .border-green-200 { border-color: rgb(187, 247, 208) !important; }
    .certificate-export .border-green-600 { border-color: rgb(22, 163, 74) !important; }
  `;
  clonedDocument.head.appendChild(styleOverride);

  // Ensure all images in cloned document have absolute URLs
  const clonedImages = clonedDocument.querySelectorAll("img");
  clonedImages.forEach((img) => {
    const imgElement = img as HTMLImageElement;
    if (imgElement.src && !imgElement.src.startsWith("http") && !imgElement.src.startsWith("data:")) {
      const baseUrl = window.location.origin;
      const srcAttr = imgElement.getAttribute("src") || imgElement.src;
      if (srcAttr.startsWith("/")) {
        imgElement.src = baseUrl + srcAttr;
      } else {
        imgElement.src = baseUrl + "/" + srcAttr;
      }
    }
    imgElement.removeAttribute("srcset");
    imgElement.removeAttribute("decoding");
    imgElement.removeAttribute("loading");
    imgElement.removeAttribute("data-nimg");
    imgElement.style.display = "block";
    imgElement.style.visibility = "visible";
  });

  // Clean up unsupported color functions (oklab, lab) from all elements
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
      try {
        const computedStyle = window.getComputedStyle(htmlElement);
        const computedColor = computedStyle.color;
        const computedBg = computedStyle.backgroundColor;
        const computedBorder = computedStyle.borderColor;

        if (computedColor) {
          htmlElement.style.color = getRgbFromComputed(computedColor, "#000000");
        }
        if (computedBg && computedBg !== "transparent") {
          htmlElement.style.backgroundColor = getRgbFromComputed(computedBg, "#ffffff");
        }
        if (computedBorder) {
          htmlElement.style.borderColor = getRgbFromComputed(computedBorder, "#000000");
        }

        htmlElement.style.borderTopColor = getRgbFromComputed(computedStyle.borderTopColor, "#000000");
        htmlElement.style.borderRightColor = getRgbFromComputed(computedStyle.borderRightColor, "#000000");
        htmlElement.style.borderBottomColor = getRgbFromComputed(computedStyle.borderBottomColor, "#000000");
        htmlElement.style.borderLeftColor = getRgbFromComputed(computedStyle.borderLeftColor, "#000000");
      } catch (e) {
        htmlElement.style.color = "#000000";
        htmlElement.style.backgroundColor = "#ffffff";
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
};

/**
 * Robustly renders the certificate element to an HTMLCanvasElement
 */
export async function generateCertificateCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  if (!element) {
    throw new Error("Certificate element not found");
  }

  // Wait for DOM to be fully rendered
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  // Convert all image srcs to absolute URLs for html2canvas
  const images = element.querySelectorAll("img");
  images.forEach((img) => {
    const imgElement = img as HTMLImageElement;
    if (imgElement.src && !imgElement.src.startsWith("http") && !imgElement.src.startsWith("data:")) {
      const baseUrl = window.location.origin;
      if (imgElement.src.startsWith("/")) {
        imgElement.src = baseUrl + imgElement.src;
      } else if (imgElement.getAttribute("src")) {
        imgElement.src = baseUrl + "/" + imgElement.getAttribute("src");
      }
    }
    imgElement.removeAttribute("srcset");
    imgElement.removeAttribute("decoding");
    imgElement.removeAttribute("loading");
  });

  const imagePromises = Array.from(images).map((img) => {
    const imgElement = img as HTMLImageElement;
    if (imgElement.complete && imgElement.naturalWidth > 0 && imgElement.naturalHeight > 0) {
      return Promise.resolve<void>(undefined);
    }
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(); // Continue even if timeout
      }, 8000);

      if (imgElement.complete) {
        clearTimeout(timeout);
        resolve();
        return;
      }

      imgElement.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      imgElement.onerror = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  });

  await Promise.all(imagePromises);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default ?? html2canvasModule;

  const elementArea = element.scrollWidth * element.scrollHeight;
  const baseScale = elementArea > 1000000 ? 1.0 : elementArea > 500000 ? 1.2 : 1.5;

  let canvas: HTMLCanvasElement | null = null;
  let lastError: Error | null = null;
  const scales = [baseScale, baseScale * 0.8, baseScale * 0.6];

  for (let attempt = 0; attempt < scales.length; attempt++) {
    try {
      const currentScale = scales[attempt];
      const attemptCanvasPromise = html2canvas(element, {
        scale: currentScale,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        removeContainer: true,
        imageTimeout: 8000,
        foreignObjectRendering: false,
        onclone: attempt === 0 ? oncloneCallback : undefined,
        ignoreElements: (el) => {
          return el.classList.contains("no-export");
        },
      });

      const attemptTimeout = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error(`Canvas generation timeout (attempt ${attempt + 1})`)),
          45000
        );
      });

      canvas = (await Promise.race([attemptCanvasPromise, attemptTimeout])) as HTMLCanvasElement;

      if (canvas && canvas.width > 0 && canvas.height > 0) {
        break;
      }
    } catch (error: any) {
      lastError = error;
      if (attempt === scales.length - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  if (!canvas || !canvas.width || !canvas.height) {
    throw lastError || new Error("Failed to generate canvas for certificate");
  }

  return canvas;
}

/**
 * Exports the certificate as an official PDF document
 */
export async function exportCertificateToPdf(element: HTMLElement, fileName: string): Promise<void> {
  try {
    const canvas = await generateCertificateCanvas(element);

    const jsPDFModule = await import("jspdf");
    let JsPDFConstructor: any;
    if (jsPDFModule.jsPDF) {
      JsPDFConstructor = jsPDFModule.jsPDF;
    } else if (jsPDFModule.default) {
      JsPDFConstructor = jsPDFModule.default;
    } else if (typeof (jsPDFModule as any).jsPDF === "function") {
      JsPDFConstructor = (jsPDFModule as any).jsPDF;
    } else {
      throw new Error("Failed to load jsPDF constructor");
    }

    const imgData = canvas.toDataURL("image/png", 1.0);
    if (!imgData || imgData === "data:,") {
      throw new Error("Failed to convert canvas to image data");
    }

    const pxToPt = (px: number) => (px * 72) / 96;
    const pdfWidth = pxToPt(canvas.width);
    const pdfHeight = pxToPt(canvas.height);

    const pdf = new JsPDFConstructor({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "pt",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
  } catch (error: any) {
    console.error("Certificate PDF export error:", error);
    throw new Error(
      `PDF generation failed: ${error?.message || "Unknown error"}. Please check browser console for details.`
    );
  }
}

/**
 * Exports the certificate as a high-definition PNG image file
 */
export async function exportCertificateToPng(element: HTMLElement, fileName: string): Promise<string> {
  try {
    const canvas = await generateCertificateCanvas(element);
    const dataUrl = canvas.toDataURL("image/png", 1.0);

    if (!dataUrl || dataUrl === "data:,") {
      throw new Error("Failed to convert certificate canvas to PNG image");
    }

    const downloadFileName = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return dataUrl;
  } catch (error: any) {
    console.error("Certificate PNG export error:", error);
    throw new Error(
      `PNG generation failed: ${error?.message || "Unknown error"}. Please check browser console for details.`
    );
  }
}

/**
 * Generates a PNG Blob of the certificate for Web Share API or file uploads
 */
export async function getCertificateBlob(element: HTMLElement): Promise<Blob> {
  const canvas = await generateCertificateCanvas(element);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to generate image blob from canvas"));
        }
      },
      "image/png",
      1.0
    );
  });
}
