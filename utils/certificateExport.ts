"use client";

export async function exportCertificateToPdf(element: HTMLElement, fileName: string) {
  if (!element) {
    throw new Error("Certificate element not found");
  }

  try {
    // Wait for DOM to be fully rendered and images to load
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    
    // Wait for all images in the certificate to load
    const images = element.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails
          // Timeout after 5 seconds per image
          setTimeout(() => resolve, 5000);
        });
      })
    );

    // Small delay to ensure everything is settled
    await new Promise((resolve) => setTimeout(resolve, 500));

    const html2canvasModule = await import("html2canvas");
    const jsPDFModule = await import("jspdf");

    const html2canvas = html2canvasModule.default ?? html2canvasModule;
    
    // Handle jsPDF v3.0.4 module loading - it exports as named export 'jsPDF'
    let JsPDFConstructor: any;
    if (jsPDFModule.jsPDF) {
      // Named export (jsPDF v3.x)
      JsPDFConstructor = jsPDFModule.jsPDF;
    } else if (jsPDFModule.default) {
      // Default export (older versions)
      JsPDFConstructor = jsPDFModule.default;
    } else if (typeof (jsPDFModule as any).jsPDF === 'function') {
      // Fallback for different module structures
      JsPDFConstructor = (jsPDFModule as any).jsPDF;
    } else {
      console.error("jsPDF module structure:", Object.keys(jsPDFModule));
      throw new Error("Failed to load jsPDF module. Module structure: " + JSON.stringify(Object.keys(jsPDFModule)));
    }

    const scale = 2.5;

    // Add timeout wrapper for html2canvas
    const canvasPromise = html2canvas(element, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.classList.contains("no-export");
      },
      onclone: (clonedDocument) => {
        const certificateElement = clonedDocument.querySelector(".certificate-export") as HTMLElement | null;
        if (certificateElement) {
          // Convert Next.js Image components to regular img tags
          const nextImages = clonedDocument.querySelectorAll("img[src]");
          nextImages.forEach((img) => {
            const imgElement = img as HTMLImageElement;
            // Ensure src is absolute URL for html2canvas
            if (imgElement.src && !imgElement.src.startsWith("http") && !imgElement.src.startsWith("data:")) {
              // Convert relative paths to absolute
              const baseUrl = window.location.origin;
              if (imgElement.src.startsWith("/")) {
                imgElement.src = baseUrl + imgElement.src;
              }
            }
            // Remove Next.js specific attributes
            imgElement.removeAttribute("srcset");
            imgElement.removeAttribute("decoding");
          });

          const cleanStyles: Partial<CSSStyleDeclaration> = {
            boxShadow: "none",
            filter: "none",
            mixBlendMode: "normal",
            backgroundImage: "none",
            backgroundColor: "#ffffff",
          };

          const applyCleanStyles = (node: Element) => {
            const htmlElement = node as HTMLElement;
            
            // Clean any lab() colors and replace with standard colors
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

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Canvas generation timeout after 25 seconds")), 25000);
    });

    const canvas = await Promise.race([canvasPromise, timeoutPromise]) as HTMLCanvasElement;
    
    if (!canvas || !canvas.width || !canvas.height) {
      throw new Error("Canvas generation failed: invalid canvas dimensions");
    }

    const imgData = canvas.toDataURL("image/png", 1.0);
    
    if (!imgData || imgData === "data:,") {
      throw new Error("Failed to convert canvas to image data");
    }

    const pxToPt = (px: number) => (px * 72) / 96;
    const pdfWidth = pxToPt(canvas.width);
    const pdfHeight = pxToPt(canvas.height);

    if (!JsPDFConstructor || typeof JsPDFConstructor !== 'function') {
      throw new Error("jsPDF constructor is not a function");
    }

    const pdf = new JsPDFConstructor({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "pt",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  } catch (error: any) {
    // Enhanced error logging
    console.error("Certificate export error details:", {
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name,
      element: element ? { width: element.offsetWidth, height: element.offsetHeight } : null,
    });
    
    // Re-throw with more context
    throw new Error(
      `PDF generation failed: ${error?.message || "Unknown error"}. ` +
      `Please check browser console for details.`
    );
  }
}
