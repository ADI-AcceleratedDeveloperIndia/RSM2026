import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import SignatureMap from "@/models/SignatureMap";
import { verifyCertificateUrl } from "@/lib/hmac";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Configure Chromium for serverless environments
chromium.setGraphicsMode = false;

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NEXT_PUBLIC_VERCEL === "1";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cid = searchParams.get("cid");
    const sig = searchParams.get("sig");

    if (!cid || !sig) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const verified = await verifyCertificateUrl(sig);
    if (!verified || verified.cid !== cid) {
      return NextResponse.json({ error: "Invalid or expired signature" }, { status: 403 });
    }

    await connectDB();
    const certificate = await Certificate.findOne({ certificateId: cid }).lean();

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Ensure eventType is explicitly checked (handle old certificates without eventType field)
    // For old certificates or online without event, eventType should be null/undefined
    const eventType = (certificate as any).eventType === "regional" ? "regional" : 
                      (certificate as any).eventType === "statewide" ? "statewide" : null;
    const participationContext = (certificate as any).participationContext || null;
    
    // Debug logging (remove in production if needed)
    console.log("Certificate download - eventType:", eventType, "participationContext:", participationContext, "certificateId:", cid);

    // No QR code
    const qrDataUrl = "";

    // Load assets (in production, these should be stored securely)
    const cmPhotoPath = join(process.cwd(), "public", "assets", "leadership", "CM.png");
    const ministerPhotoPath = join(process.cwd(), "public", "assets", "minister", "Sri-Ponnam-Prabhakar.jpg");
    const emblemPath = join(process.cwd(), "public", "assets", "seals", "telangana-emblem.png");
    const ministerSigPath = join(process.cwd(), "public", "assets", "signatures", "minister.png");
    
    // Regional authority logic: 
    // - TGSG-* (statewide) should NEVER show regional person
    // - Only regional event IDs (district codes like KRMR-*) should show regional person
    // - Check event reference ID prefix to ensure TGSG never shows regional person
    const eventRefId = (certificate as any).eventReferenceId || "";
    const isTGSGEvent = eventRefId.startsWith("TGSG-");
    const isRegionalEvent = eventType === "regional" && !isTGSGEvent; // Regional AND not TGSG
    const isStatewideEvent = eventType === "statewide" || isTGSGEvent; // Explicitly statewide OR TGSG prefix
    const isKarimnagar = certificate.district?.toLowerCase() === "karimnagar";
    
    // Only show regional person if it's a regional event (NOT statewide/TGSG)
    const showPadalaRahul = isRegionalEvent && !isStatewideEvent && isKarimnagar;
    const showPlaceholder = isRegionalEvent && !isStatewideEvent && !isKarimnagar;
    const regionalPhotoPath = join(process.cwd(), "public", "assets", "leadership", "Karimnagarrtamemberpadalarahul.webp");

    let cmPhoto = "";
    let ministerPhoto = "";
    let emblem = "";
    let ministerSig = "";
    let regionalPhoto = "";

    try {
      if (existsSync(cmPhotoPath)) {
        cmPhoto = readFileSync(cmPhotoPath, "base64");
      }
      if (existsSync(ministerPhotoPath)) {
        ministerPhoto = readFileSync(ministerPhotoPath, "base64");
      }
      if (existsSync(emblemPath)) {
        emblem = readFileSync(emblemPath, "base64");
      }
      if (existsSync(ministerSigPath)) {
        ministerSig = readFileSync(ministerSigPath, "base64");
      }
      // Load Padala Rahul photo only for Karimnagar regional events
      if (showPadalaRahul && existsSync(regionalPhotoPath)) {
        regionalPhoto = readFileSync(regionalPhotoPath, "base64");
      }
    } catch (err) {
      console.warn("Asset loading error:", err);
    }

    // Pass eventType and participationContext to template function
    const certificateWithContext = {
      ...certificate,
      eventType: eventType,
      participationContext: participationContext,
    };

    const html = generateCertificateHTML({
      certificate: certificateWithContext,
      qrDataUrl,
      cmPhoto: cmPhoto ? `data:image/png;base64,${cmPhoto}` : "",
      ministerPhoto: ministerPhoto ? `data:image/jpeg;base64,${ministerPhoto}` : "",
      emblem: emblem ? `data:image/png;base64,${emblem}` : "",
      ministerSig: ministerSig ? `data:image/png;base64,${ministerSig}` : "",
      regionalPhoto: regionalPhoto ? `data:image/webp;base64,${regionalPhoto}` : "",
      showPadalaRahul: showPadalaRahul,
      showPlaceholder: isRegionalEvent && !isKarimnagar,
    });

    // Set timeout for PDF generation (30 seconds max)
    const pdfGenerationPromise = (async () => {
      // Configure Chromium args for serverless
      const chromiumArgs = isServerless 
        ? [
            ...chromium.args,
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-first-run",
            "--no-sandbox",
            "--no-zygote",
            "--single-process",
            "--disable-extensions",
            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-breakpad",
            "--disable-client-side-phishing-detection",
            "--disable-default-apps",
            "--disable-features=TranslateUI",
            "--disable-hang-monitor",
            "--disable-ipc-flooding-protection",
            "--disable-popup-blocking",
            "--disable-prompt-on-repost",
            "--disable-renderer-backgrounding",
            "--disable-sync",
            "--disable-translate",
            "--metrics-recording-only",
            "--no-default-browser-check",
            "--safebrowsing-disable-auto-update",
            "--enable-automation",
            "--password-store=basic",
            "--use-mock-keychain",
          ]
        : chromium.args;

      // For local development, try to use Chrome/Chromium if available
      let executablePath: string | undefined;
      if (isServerless) {
        executablePath = await chromium.executablePath();
      } else {
        // In local development, try to find Chrome/Chromium
        // Common paths for macOS, Linux, and Windows
        const possiblePaths = [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
          '/Applications/Chromium.app/Contents/MacOS/Chromium', // macOS Chromium
          process.env.CHROME_PATH, // Custom path from env
        ];
        
        // Try to find Chrome
        for (const path of possiblePaths) {
          if (path && existsSync(path)) {
            executablePath = path;
            break;
          }
        }
      }

      // If no executable found in local dev, throw helpful error
      if (!isServerless && !executablePath) {
        throw new Error(
          "Chrome/Chromium not found. Please install Google Chrome or set CHROME_PATH environment variable. " +
          "For macOS: Chrome should be at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        );
      }

      const browser = await puppeteer.launch({
        args: chromiumArgs,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: true,
        timeout: 30000,
      });

      const page = await browser.newPage();
      
      try {
        // Set content and wait for network to be idle (all resources loaded)
        await page.setContent(html, { 
          waitUntil: "networkidle0", // Wait for all network requests to finish
          timeout: 30000,
        });
        
        // Simple wait to ensure rendering is complete
        // Don't use page.evaluate as it can cause "Target closed" errors
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate PDF immediately - don't do anything else that might close the page
        const pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          timeout: 30000,
        });

        return pdf;
      } catch (error: any) {
        console.error("PDF generation error in page:", error);
        throw error;
      } finally {
        // Close page and browser in finally block
        try {
          if (page && !page.isClosed()) {
            await page.close();
          }
        } catch (pageError) {
          // Ignore page close errors
        }
        
        try {
          await browser.close();
        } catch (browserError) {
          // Ignore browser close errors
        }
      }
    })();

    // Add overall timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("PDF generation timeout")), 30000);
    });

    const pdf = await Promise.race([pdfGenerationPromise, timeoutPromise]) as Buffer;

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${cid}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", {
      message: error?.message || String(error),
      stack: error?.stack,
      error: error
    });
    return NextResponse.json({ 
      error: "Failed to generate PDF",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}

function generateCertificateHTML({
  certificate,
  qrDataUrl,
  cmPhoto,
  ministerPhoto,
  emblem,
  ministerSig,
  regionalPhoto,
  showPadalaRahul,
  showPlaceholder,
}: {
  certificate: any;
  qrDataUrl: string;
  cmPhoto: string;
  ministerPhoto: string;
  emblem: string;
  ministerSig: string;
  regionalPhoto: string;
  showPadalaRahul: boolean;
  showPlaceholder: boolean;
}) {
  const ministerName = process.env.MINISTER_NAME || "Ponnam Prabhakar";
  const ministerTitle = process.env.MINISTER_TITLE || "Hon'ble Cabinet Minister";

  // Determine certificate type based on score (>=80% = Topper, 60-79% = Merit, <60% = Participant)
  let displayType = certificate.type?.toLowerCase() || "participant";
  if (certificate.type === "MERIT" && certificate.score !== undefined && certificate.total !== undefined && certificate.total > 0) {
    const percentage = (certificate.score / certificate.total) * 100;
    displayType = percentage >= 80 ? "topper" : "merit";
  }

  const typeLabels: Record<string, string> = {
    organiser: "Organiser",
    participant: "Participant",
    merit: "Merit",
    topper: "Topper",
  };

  // Get event type and participation context (handle old certificates)
  const eventType = (certificate.eventType === "regional" ? "regional" : 
                     certificate.eventType === "statewide" ? "statewide" : null);
  const participationContext = certificate.participationContext || null;
  
  // Regional authority logic: 
  // - TGSG-* (statewide) should NEVER show regional person
  // - Only regional event IDs (district codes like KRMR-*) should show regional person
  // - Check event reference ID prefix to ensure TGSG never shows regional person
  const eventRefId = certificate.eventReferenceId || "";
  const isTGSGEvent = eventRefId.startsWith("TGSG-");
  const isRegionalEvent = eventType === "regional" && !isTGSGEvent; // Regional AND not TGSG
  const isStatewideEvent = eventType === "statewide" || isTGSGEvent; // Explicitly statewide OR TGSG prefix
  const isKarimnagar = certificate.district?.toLowerCase() === "karimnagar";
  
  // Only show regional person if it's a regional event (NOT statewide/TGSG)
  const showPadalaRahul = isRegionalEvent && !isStatewideEvent && isKarimnagar;
  const showPlaceholder = isRegionalEvent && !isStatewideEvent && !isKarimnagar;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { margin: 0; size: A4; }
        body {
          margin: 0;
          padding: 40px;
          font-family: 'Times New Roman', serif;
          background: white;
          position: relative;
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          opacity: 0.05;
          width: 600px;
          height: 600px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }
        .photo-blocks {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .portrait {
          width: 120px;
          height: 150px;
          object-fit: cover;
          border: 2px solid #333;
          border-radius: 6px;
        }
        .title {
          text-align: center;
          font-size: 28px;
          font-weight: bold;
          margin: 20px 0;
          color: #1a472a;
        }
        .subtitle {
          text-align: center;
          font-size: 18px;
          margin-bottom: 40px;
          color: #2d5016;
        }
        .content {
          margin: 40px 0;
          line-height: 1.8;
          font-size: 16px;
        }
        .name {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          color: #1a472a;
        }
        .signatures {
          display: flex;
          justify-content: center;
          margin-top: 60px;
          align-items: flex-end;
        }
        .signature-block {
          text-align: center;
          width: 100%;
        }
        .signature-img {
          height: 60px;
          margin-bottom: 10px;
        }
        .signature-name {
          font-weight: bold;
          margin-top: 5px;
        }
        .signature-title {
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <img src="${emblem}" class="watermark" alt="Telangana Emblem" />
      
      <div class="header">
        <div class="photo-blocks">
          ${cmPhoto ? `<img src="${cmPhoto}" class="portrait" alt="Chief Minister" />` : ""}
          ${ministerPhoto ? `<img src="${ministerPhoto}" class="portrait" alt="Minister" />` : ""}
          ${showPadalaRahul && regionalPhoto ? `<img src="${regionalPhoto}" class="portrait" alt="Regional RTA Member" />` : ""}
          ${showPlaceholder ? `<div class="portrait" style="background: #f3f4f6; border: 2px dashed #9ca3af; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 12px;">Photo</div>` : ""}
        </div>
        <div></div>
      </div>

      <div class="title">CERTIFICATE OF ${typeLabels[displayType]?.toUpperCase() || "PARTICIPATION"}</div>
      <div class="subtitle">
        ${participationContext === "online" && !eventType 
          ? "Online Event - Road Safety Month - Telangana"
          : eventType === "statewide"
          ? "Statewide Event - Road Safety Month - Telangana"
          : eventType === "regional"
          ? "Regional Event - Road Safety Month - Telangana"
          : "Road Safety Month - Telangana"}
      </div>

      <div class="content">
        <p style="text-align: center;">
          This is to certify that <span class="name">${certificate.fullName}</span>
          ${certificate.institution ? `<br/><span style="font-size: 18px; color: #2d5016; font-weight: 500;">${certificate.institution}</span>` : ""}
          has ${displayType === "topper" ? "achieved top performance in" : displayType === "merit" ? "achieved merit in" : certificate.type === "ORGANIZER" ? "organized" : "participated in"} 
          ${certificate.activityType ? `<strong>${certificate.activityType.charAt(0).toUpperCase() + certificate.activityType.slice(1)}</strong>` : ""}
          ${certificate.eventTitle ? ` - ${certificate.eventTitle}` : ""}
          ${certificate.eventDate ? `on ${new Date(certificate.eventDate).toLocaleDateString()}` : ""}.
        </p>
        ${certificate.score !== undefined && certificate.total !== undefined ? `
          <p style="text-align: center; margin-top: 20px; font-size: 18px; color: #1a472a; font-weight: bold;">
            Score: ${certificate.score} / ${certificate.total}
          </p>
        ` : certificate.score !== undefined ? `
          <p style="text-align: center; margin-top: 20px; font-size: 18px; color: #1a472a; font-weight: bold;">
            Achievement: ${certificate.score}
          </p>
        ` : ""}
      </div>

      <div class="signatures">
        <div class="signature-block">
          <img src="${ministerSig}" class="signature-img" alt="Minister Signature" />
          <div class="signature-name">${ministerName}</div>
          <div class="signature-title">${ministerTitle}</div>
        </div>
        ${showPadalaRahul ? `
        <div class="signature-block">
          <div class="signature-name">Sri Padala Rahul Garu</div>
          <div class="signature-title">Regional Transport Authority Member, Karimnagar</div>
        </div>
        ` : showPlaceholder ? `
        <div class="signature-block">
          <div class="signature-name">Regional Authority</div>
          <div class="signature-title">${certificate.district || "District"}</div>
        </div>
        ` : ""}
      </div>

      
    </body>
    </html>
  `;
}

