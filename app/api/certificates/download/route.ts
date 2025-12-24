import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import SignatureMap from "@/models/SignatureMap";
import { verifyCertificateUrl } from "@/lib/hmac";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

chromium.setGraphicsMode = false;

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
    const certificate = await Certificate.findOne({ certificateId: cid });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // No QR code
    const qrDataUrl = "";

    // Load assets (in production, these should be stored securely)
    // Include CM, Minister, and Padala Rahul (RTA) photos
    const cmPhotoPath = join(process.cwd(), "public", "assets", "leadership", "CM.png");
    const ministerPhotoPath = join(process.cwd(), "public", "assets", "minister", "Sri-Ponnam-Prabhakar.jpg");
    const emblemPath = join(process.cwd(), "public", "assets", "seals", "telangana-emblem.png");
    const ministerSigPath = join(process.cwd(), "public", "assets", "signatures", "minister.png");
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
      if (existsSync(regionalPhotoPath)) {
        regionalPhoto = readFileSync(regionalPhotoPath, "base64");
      }
    } catch (err) {
      console.warn("Asset loading error:", err);
    }

    const html = generateCertificateHTML({
      certificate,
      qrDataUrl,
      cmPhoto: cmPhoto ? `data:image/png;base64,${cmPhoto}` : "",
      ministerPhoto: ministerPhoto ? `data:image/jpeg;base64,${ministerPhoto}` : "",
      emblem: emblem ? `data:image/png;base64,${emblem}` : "",
      ministerSig: ministerSig ? `data:image/png;base64,${ministerSig}` : "",
      regionalPhoto: regionalPhoto ? `data:image/webp;base64,${regionalPhoto}` : "",
    });

    // Set timeout for PDF generation (30 seconds max)
    const pdfGenerationPromise = (async () => {
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
        timeout: 30000, // 30 second timeout
      });

      try {
        const page = await browser.newPage();
        
        // Set content with simpler wait strategy
        await page.setContent(html, { 
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        
        // Wait for images to load
        await page.waitForTimeout(2000);

        const pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          timeout: 15000,
        });

        return pdf;
      } finally {
        await browser.close();
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
}: {
  certificate: any;
  qrDataUrl: string;
  cmPhoto: string;
  ministerPhoto: string;
  emblem: string;
  ministerSig: string;
  regionalPhoto: string;
}) {
  const ministerName = process.env.MINISTER_NAME || "Ponnam Prabhakar";
  const ministerTitle = process.env.MINISTER_TITLE || "Hon'ble Cabinet Minister";

  const typeLabels: Record<string, string> = {
    organiser: "Organiser",
    participant: "Participant",
    merit: "Merit",
  };

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
          ${regionalPhoto ? `<img src="${regionalPhoto}" class="portrait" alt="Padala Rahul - RTA Member" />` : ""}
        </div>
        <div></div>
      </div>

      <div class="title">CERTIFICATE OF ${typeLabels[certificate.type]?.toUpperCase() || "PARTICIPATION"}</div>
      <div class="subtitle">Road Safety Month - Telangana</div>

      <div class="content">
        <p style="text-align: center;">
          This is to certify that <span class="name">${certificate.fullName}</span>
          ${certificate.institution ? `from ${certificate.institution}` : ""}
          has ${certificate.type === "merit" ? "achieved merit in" : certificate.type === "organiser" ? "organized" : "participated in"} 
          ${certificate.eventTitle || "Road Safety Month activities"}
          ${certificate.eventDate ? `on ${new Date(certificate.eventDate).toLocaleDateString()}` : ""}.
        </p>
      </div>

      <div class="signatures">
        <div class="signature-block">
          <img src="${ministerSig}" class="signature-img" alt="Minister Signature" />
          <div class="signature-name">${ministerName}</div>
          <div class="signature-title">${ministerTitle}</div>
        </div>
      </div>

      
    </body>
    </html>
  `;
}

