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

    // Define onclone callback once for reuse
    const oncloneCallback = (clonedDocument: Document) => {
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
    };

    // Add timeout to prevent hanging - increased to 45 seconds for complex certificates
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Canvas generation timeout after 45 seconds")), 45000);
    });

    let canvas: HTMLCanvasElement | null = null;
    let lastError: Error | null = null;
    
    // Try up to 3 times with progressively lower scale
    const scales = [scale, scale * 0.7, scale * 0.5];
    
    for (let attempt = 0; attempt < scales.length; attempt++) {
      try {
        const currentScale = scales[attempt];
        console.log(`Canvas generation attempt ${attempt + 1} with scale ${currentScale}`);
        
        const attemptCanvasPromise = html2canvas(element, {
          scale: currentScale,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: true,
          logging: attempt === 0, // Only log first attempt
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          removeContainer: true,
          imageTimeout: 8000, // 8 seconds per image
          foreignObjectRendering: false,
          onclone: attempt === 0 ? oncloneCallback : undefined, // Only use onclone on first attempt
          ignoreElements: (element) => {
            return element.classList.contains("no-export");
          },
        });
        
        const attemptTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Canvas generation timeout after 45 seconds (attempt ${attempt + 1})`)), 45000);
        });
        
        canvas = await Promise.race([attemptCanvasPromise, attemptTimeout]) as HTMLCanvasElement;
        
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          console.log(`Canvas generated successfully on attempt ${attempt + 1}`);
          break; // Success, exit retry loop
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`Canvas generation attempt ${attempt + 1} failed:`, error?.message);
        if (attempt === scales.length - 1) {
          // Last attempt failed, throw the error
          throw error;
        }
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!canvas || !canvas.width || !canvas.height) {
      throw lastError || new Error("Failed to generate canvas after all retry attempts");
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
