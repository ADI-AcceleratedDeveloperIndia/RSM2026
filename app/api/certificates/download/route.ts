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

    // Get signature URLs
    let rtaSignatureUrl = "";
    if (certificate.type !== "organiser" && certificate.regionCode) {
      const sigMap = await SignatureMap.findOne({ regionCode: certificate.regionCode });
      if (sigMap?.signatureUrl) {
        rtaSignatureUrl = sigMap.signatureUrl;
      }
    }

    // Load assets (in production, these should be stored securely)
    const ministerPhotoPath = join(process.cwd(), "public", "assets", "minister", "photo.jpg");
    const emblemPath = join(process.cwd(), "public", "assets", "seals", "telangana-emblem.png");
    const ministerSigPath = join(process.cwd(), "public", "assets", "signatures", "minister.png");
    const secretarySigPath = join(process.cwd(), "public", "assets", "signatures", "secretary.png");

    let ministerPhoto = "";
    let emblem = "";
    let ministerSig = "";
    let secretarySig = "";
    let rtaSig = "";

    try {
      if (existsSync(ministerPhotoPath)) {
        ministerPhoto = readFileSync(ministerPhotoPath, "base64");
      }
      if (existsSync(emblemPath)) {
        emblem = readFileSync(emblemPath, "base64");
      }
      if (existsSync(ministerSigPath)) {
        ministerSig = readFileSync(ministerSigPath, "base64");
      }
      if (existsSync(secretarySigPath)) {
        secretarySig = readFileSync(secretarySigPath, "base64");
      }
      if (rtaSignatureUrl) {
        const rtaPath = join(process.cwd(), "public", rtaSignatureUrl);
        if (existsSync(rtaPath)) {
          rtaSig = readFileSync(rtaPath, "base64");
        }
      }
    } catch (err) {
      console.warn("Asset loading error:", err);
    }

    const html = generateCertificateHTML({
      certificate,
      qrDataUrl,
      ministerPhoto: `data:image/jpeg;base64,${ministerPhoto}`,
      emblem: `data:image/png;base64,${emblem}`,
      ministerSig: `data:image/png;base64,${ministerSig}`,
      secretarySig: `data:image/png;base64,${secretarySig}`,
      rtaSig: rtaSig ? `data:image/png;base64,${rtaSig}` : "",
    });

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    const pdfUint8Array = new Uint8Array(pdf);
    const pdfBlob = new Blob([pdfUint8Array.buffer], { type: "application/pdf" });

    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${cid}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

function generateCertificateHTML({
  certificate,
  qrDataUrl,
  ministerPhoto,
  emblem,
  ministerSig,
  secretarySig,
  rtaSig,
}: {
  certificate: any;
  qrDataUrl: string;
  ministerPhoto: string;
  emblem: string;
  ministerSig: string;
  secretarySig: string;
  rtaSig: string;
}) {
  const ministerName = process.env.MINISTER_NAME || "Ponnam Prabhakar";
  const ministerTitle = process.env.MINISTER_TITLE || "Hon'ble Cabinet Minister";
  const secretaryName = process.env.PRINCIPAL_SECRETARY_NAME || "Principal Secretary";
  const secretaryTitle = process.env.PRINCIPAL_SECRETARY_TITLE || "Principal Secretary, Transport Department";

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
        .minister-photo {
          width: 120px;
          height: 150px;
          object-fit: cover;
          border: 2px solid #333;
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
          justify-content: space-around;
          margin-top: 60px;
          align-items: flex-end;
        }
        .signature-block {
          text-align: center;
          width: ${rtaSig ? "30%" : "45%"};
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
        <div></div>
        <img src="${ministerPhoto}" class="minister-photo" alt="Minister" />
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
        <div class="signature-block">
          <img src="${secretarySig}" class="signature-img" alt="Secretary Signature" />
          <div class="signature-name">${secretaryName}</div>
          <div class="signature-title">${secretaryTitle}</div>
        </div>
        ${rtaSig ? `
        <div class="signature-block">
          <img src="${rtaSig}" class="signature-img" alt="RTA Signature" />
          <div class="signature-name">Regional Transport Authority</div>
          <div class="signature-title">${certificate.regionCode || ""}</div>
        </div>
        ` : ""}
      </div>

      
    </body>
    </html>
  `;
}

