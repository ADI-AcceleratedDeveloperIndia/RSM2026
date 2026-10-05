"use client";

export async function exportCertificateToPdf(element: HTMLElement, fileName: string) {
  if (!element) {
    throw new Error("Certificate element not found");
  }

  // Use requestAnimationFrame to ensure DOM is fully rendered
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default ?? html2canvasModule;
  const jsPDFModule = await import("jspdf");
  const { jsPDF } = jsPDFModule;

  // Generate canvas with good quality
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    removeContainer: true,
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

  // Calculate PDF dimensions (A4 ratio)
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = (imgHeight / imgWidth) * pdfWidth;

  // Create PDF
  const pdf = new jsPDF({
    orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
    unit: "mm",
    format: [pdfWidth, pdfHeight],
  });

  const imgData = canvas.toDataURL("image/png", 1.0);
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  // Download PDF
  pdf.save(fileName.replace(/\.png$/i, ".pdf"));
}

