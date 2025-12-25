"use client";

import type { jsPDF as JsPDFConstructorType } from "jspdf";

type JsPdfModule = typeof import("jspdf");

export async function exportCertificateToPdf(element: HTMLElement, fileName: string) {
  if (!element) {
    throw new Error("Certificate element not found");
  }

  const html2canvasModule = await import("html2canvas");
  const jsPDFModule: JsPdfModule = await import("jspdf");

  const html2canvas = html2canvasModule.default ?? html2canvasModule;
  
  // Handle jsPDF module loading
  let JsPDFConstructor: typeof JsPDFConstructorType;
  if ('default' in jsPDFModule && jsPDFModule.default) {
    JsPDFConstructor = jsPDFModule.default as typeof JsPDFConstructorType;
  } else if ('jsPDF' in jsPDFModule && jsPDFModule.jsPDF) {
    JsPDFConstructor = jsPDFModule.jsPDF as typeof JsPDFConstructorType;
  } else {
    throw new Error("Failed to load jsPDF module");
  }

  const scale = 2.5;

  const canvas = await html2canvas(element, {
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

  const imgData = canvas.toDataURL("image/png");

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

