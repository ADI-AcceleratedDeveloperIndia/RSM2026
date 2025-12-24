"use client";

import type { jsPDF } from "jspdf";

export async function exportCertificateToPdf(element: HTMLElement, fileName: string) {
  if (!element) {
    throw new Error("Certificate element not found");
  }

  // Wait for images to load (with shorter timeout)
  const images = element.querySelectorAll("img");
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          const timeout = setTimeout(() => {
            // Continue even if image times out
            resolve();
          }, 3000); // 3 second timeout per image (reduced from 10)
          img.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeout);
            // Continue even if image fails to load
            resolve();
          };
        })
    )
  );

  const html2canvasModule = await import("html2canvas");
  const { jsPDF: JsPDFConstructor } = await import("jspdf");

  const html2canvas = html2canvasModule.default ?? html2canvasModule;

  // Reduced scale for faster generation (2.0 instead of 2.5)
  const scale = 2.0;

  // Add timeout to html2canvas operation (30 seconds)
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

  // Add overall timeout wrapper (increased to 45 seconds for slower devices)
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("PDF generation timed out after 45 seconds")), 45000);
  });

  const canvas = await Promise.race([canvasPromise, timeoutPromise]);

  const imgData = canvas.toDataURL("image/png", 0.9); // Lower quality (0.9) for faster processing

  const pxToPt = (px: number) => (px * 72) / 96;
  const pdfWidth = pxToPt(canvas.width);
  const pdfHeight = pxToPt(canvas.height);

  const pdf = new JsPDFConstructor({
    orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
    unit: "pt",
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
}

