"use client";

export async function exportCertificateToPdf(element: HTMLElement, fileName: string) {
  if (!element) {
    throw new Error("Certificate element not found");
  }

  try {
    // Wait for DOM to be fully rendered and images to load
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    
    // Wait for all images in the certificate to load with better timeout handling
    const images = element.querySelectorAll("img");
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve<void>(undefined);
      }
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Image load timeout:", img.src);
          resolve(); // Continue even if image times out
        }, 10000); // 10 seconds per image
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          console.warn("Image load error:", img.src);
          resolve(); // Continue even if image fails
        };
      });
    });
    
    await Promise.all(imagePromises);

    // Small delay to ensure everything is settled - increased for complex certificates
    await new Promise((resolve) => setTimeout(resolve, 1000));

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

    // Adaptive scale based on element size to prevent timeouts
    // Large certificates (>1000px) use lower scale for better performance
    const elementArea = element.scrollWidth * element.scrollHeight;
    const scale = elementArea > 1000000 ? 1.5 : elementArea > 500000 ? 1.75 : 2.0;

    // Add timeout wrapper for html2canvas
    const canvasPromise = html2canvas(element, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false, // Changed to false for better compatibility
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      removeContainer: true, // Remove container after rendering
      imageTimeout: 10000, // Reduced to 10 seconds per image
      foreignObjectRendering: false, // Disable for better performance
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.classList.contains("no-export");
      },
      onclone: (clonedDocument) => {
        // Simplified onclone for better performance
        const certificateElement = clonedDocument.querySelector(".certificate-export") as HTMLElement | null;
        if (certificateElement) {
          // Quick image optimization - only fix src attributes
          const nextImages = clonedDocument.querySelectorAll("img[src]");
          nextImages.forEach((img) => {
            const imgElement = img as HTMLImageElement;
            // Ensure src is absolute URL for html2canvas
            if (imgElement.src && !imgElement.src.startsWith("http") && !imgElement.src.startsWith("data:")) {
              const baseUrl = window.location.origin;
              if (imgElement.src.startsWith("/")) {
                imgElement.src = baseUrl + imgElement.src;
              }
            }
            // Remove Next.js specific attributes
            imgElement.removeAttribute("srcset");
            imgElement.removeAttribute("decoding");
          });

          // Simplified style cleaning - only essential styles
          const cleanStyles: Partial<CSSStyleDeclaration> = {
            boxShadow: "none",
            filter: "none",
            mixBlendMode: "normal",
          };

          // Apply styles only to top-level element for performance
          Object.entries(cleanStyles).forEach(([property, value]) => {
            if (value !== undefined) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (certificateElement.style as any)[property] = value;
            }
          });
        }
      },
    });

    // Add timeout to prevent hanging - increased to 60 seconds for very large certificates
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Canvas generation timeout after 60 seconds")), 60000);
    });

    const canvas = await Promise.race([canvasPromise, timeoutPromise]) as HTMLCanvasElement;
    
    if (!canvas || !canvas.width || !canvas.height) {
      throw new Error("Canvas generation failed: invalid canvas dimensions");
    }

    // Use slightly lower quality for very large images to reduce processing time
    const quality = elementArea > 1000000 ? 0.95 : 1.0;
    const imgData = canvas.toDataURL("image/png", quality);
    
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
