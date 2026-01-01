"use client";

export async function exportCertificateToPdf(element: HTMLElement, fileName: string) {
  if (!element) {
    throw new Error("Certificate element not found");
  }

  try {
    // Wait for DOM to be fully rendered and images to load
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    
    // Wait for all images to load and convert to absolute URLs
    const images = element.querySelectorAll("img");
    console.log(`Found ${images.length} images`);
    
    // Convert all image srcs to absolute URLs for html2canvas
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
      // Remove problematic attributes
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
          console.warn("Image load timeout:", imgElement.src);
          resolve(); // Continue even if timeout
        }, 8000); // Increased to 8 seconds
        
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
          console.warn("Image load error:", imgElement.src);
          resolve(); // Continue even if error
        };
      });
    });
    
    await Promise.all(imagePromises);
    console.log("All images loaded");

    // Longer delay to ensure everything is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 1500));

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
    // Very aggressive scaling for large certificates to prevent timeouts
    const elementArea = element.scrollWidth * element.scrollHeight;
    // Use even lower scale for better performance and reliability
    const scale = elementArea > 1000000 ? 0.8 : elementArea > 500000 ? 1.0 : 1.2;
    
    console.log("PDF generation config:", {
      width: element.scrollWidth,
      height: element.scrollHeight,
      area: elementArea,
      scale: scale,
      imageCount: images.length
    });

    // Add timeout wrapper for html2canvas with aggressive optimizations
    const canvasPromise = html2canvas(element, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true, // Changed back to true - some browsers need this
      logging: true, // Enable logging to debug issues
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      removeContainer: true, // Remove container after rendering
      imageTimeout: 5000, // Reduced to 5 seconds per image
      foreignObjectRendering: false, // Disable for better performance
      onclone: (clonedDocument) => {
        // Ensure all images in cloned document have absolute URLs
        const clonedImages = clonedDocument.querySelectorAll("img");
        clonedImages.forEach((img) => {
          const imgElement = img as HTMLImageElement;
          // Force absolute URL
          if (imgElement.src && !imgElement.src.startsWith("http") && !imgElement.src.startsWith("data:")) {
            const baseUrl = window.location.origin;
            const srcAttr = imgElement.getAttribute("src") || imgElement.src;
            if (srcAttr.startsWith("/")) {
              imgElement.src = baseUrl + srcAttr;
            } else {
              imgElement.src = baseUrl + "/" + srcAttr;
            }
          }
          // Remove all problematic attributes
          imgElement.removeAttribute("srcset");
          imgElement.removeAttribute("decoding");
          imgElement.removeAttribute("loading");
          imgElement.removeAttribute("data-nimg");
          // Ensure image is visible
          imgElement.style.display = "block";
          imgElement.style.visibility = "visible";
        });
      },
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.classList.contains("no-export");
      },
    });

    // Add timeout to prevent hanging - reduced to 30 seconds with retry logic
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Canvas generation timeout after 30 seconds")), 30000);
    });

    let canvas: HTMLCanvasElement | null = null;
    
    // Try up to 2 times with progressively lower scale
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          // On retry, use even lower scale
          const retryScale = scale * 0.75;
          console.log(`Retry attempt ${attempt + 1} with scale ${retryScale}`);
          const retryCanvasPromise = html2canvas(element, {
            scale: retryScale,
            backgroundColor: "#ffffff",
            useCORS: true,
            allowTaint: true,
            logging: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            removeContainer: true,
            imageTimeout: 5000,
            foreignObjectRendering: false,
            ignoreElements: (element) => {
              return element.classList.contains("no-export");
            },
          });
          const retryTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Canvas generation timeout after 30 seconds")), 30000);
          });
          canvas = await Promise.race([retryCanvasPromise, retryTimeout]) as HTMLCanvasElement;
        } else {
          canvas = await Promise.race([canvasPromise, timeoutPromise]) as HTMLCanvasElement;
        }
        break; // Success, exit retry loop
      } catch (error: any) {
        console.warn(`Canvas generation attempt ${attempt + 1} failed:`, error?.message);
        if (attempt === 1) {
          // Last attempt failed, throw the error
          throw error;
        }
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!canvas) {
      throw new Error("Failed to generate canvas after all retry attempts");
    }
    
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
