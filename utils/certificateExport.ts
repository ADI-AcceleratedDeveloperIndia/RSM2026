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

    // Helper function to get RGB value from computed style
    // Browsers convert oklab/lab to RGB in computed styles, so we use that
    const getRgbFromComputed = (computedValue: string, fallback: string): string => {
      // If it's already RGB/RGBA, return it
      if (computedValue.startsWith("rgb")) {
        return computedValue;
      }
      
      // If it's hex, return it
      if (computedValue.startsWith("#")) {
        return computedValue;
      }
      
      // For transparent or other special values, return as is
      if (computedValue === "transparent" || computedValue === "initial" || computedValue === "inherit") {
        return computedValue;
      }
      
      // If it contains oklab/lab, return fallback (browser should have converted it, but just in case)
      if (computedValue.includes("oklab(") || computedValue.includes("lab(") || computedValue.includes("oklch(") || computedValue.includes("lch(")) {
        return fallback;
      }
      
      // Return the computed value as-is (should be RGB from browser)
      return computedValue || fallback;
    };

    // Define onclone callback once for reuse
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
          
          // Get computed styles and FORCE them to RGB
          try {
            const computedStyle = window.getComputedStyle(htmlElement);
            
            // ALWAYS set color properties to RGB - don't check, just force set
            const computedColor = computedStyle.color;
            const computedBg = computedStyle.backgroundColor;
            const computedBorder = computedStyle.borderColor;
            
            // Convert to RGB if not already
            if (computedColor) {
              htmlElement.style.color = getRgbFromComputed(computedColor, "#000000");
            }
            if (computedBg && computedBg !== "transparent") {
              htmlElement.style.backgroundColor = getRgbFromComputed(computedBg, "#ffffff");
            }
            if (computedBorder) {
              htmlElement.style.borderColor = getRgbFromComputed(computedBorder, "#000000");
            }
            
            // Force set all border colors
            htmlElement.style.borderTopColor = getRgbFromComputed(computedStyle.borderTopColor, "#000000");
            htmlElement.style.borderRightColor = getRgbFromComputed(computedStyle.borderRightColor, "#000000");
            htmlElement.style.borderBottomColor = getRgbFromComputed(computedStyle.borderBottomColor, "#000000");
            htmlElement.style.borderLeftColor = getRgbFromComputed(computedStyle.borderLeftColor, "#000000");
          } catch (e) {
            // Ignore errors but set safe defaults
            htmlElement.style.color = "#000000";
            htmlElement.style.backgroundColor = "#ffffff";
          }
          
          // Apply other clean styles
          Object.entries(cleanStyles).forEach(([property, value]) => {
            if (value !== undefined) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (htmlElement.style as any)[property] = value;
            }
          });
          
          // Recursively apply to children
          Array.from(node.children).forEach(applyCleanStyles);
        };

        applyCleanStyles(certificateElement);
      }
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
