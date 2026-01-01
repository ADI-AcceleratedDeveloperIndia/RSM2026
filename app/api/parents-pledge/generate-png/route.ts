import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import connectDB from "@/lib/db";
import ParentsPledge from "@/models/ParentsPledge";

chromium.setGraphicsMode = false;
const isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME;

const TELUGU_PLEDGE = `తల్లిదండ్రుల హామీ పత్రం

నేను ఒక బాధ్యతాయుతమైన తల్లి / తండ్రిగా,
రోడ్డు భద్రతా నియమాలను తప్పనిసరిగా పాటిస్తానని హామీ ఇస్తున్నాను.
వాహనం నడుపుతున్నప్పుడు హెల్మెట్ లేదా సీటుబెల్ట్ ధరిస్తాను,
మొబైల్ ఫోన్ ఉపయోగించను, మద్యం సేవించి వాహనం నడపను.
నా ప్రవర్తన నా పిల్లల భవిష్యత్తుపై ప్రభావం చూపుతుందనే బాధ్యతతో,
వారికి మంచి ఆదర్శంగా ఉంటాను.

సడక్ సురక్ష – జీవన్ రక్ష`;

const ENGLISH_PLEDGE = `Parents Pledge

As a responsible parent, I pledge to follow road safety rules at all times.
I will wear a helmet or seatbelt while driving, avoid using mobile phones,
and never drive under the influence of alcohol.
I understand that my behavior sets an example for my children,
and I commit to being a positive role model for their future.

Safe Roads – Safe Lives`;

function generatePledgeHTML(pledge: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600;700&family=Inter:wght@400;600;700&display=swap');
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', 'Noto Sans Telugu', sans-serif;
      background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
      padding: 40px;
      width: 800px;
      min-height: 1000px;
    }
    .container {
      background: white;
      border: 3px solid #10b981;
      border-radius: 12px;
      padding: 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #065f46;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 10px 0;
    }
    .header h2 {
      color: #059669;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
    .pledge-content {
      margin: 30px 0;
      line-height: 1.8;
      font-size: 16px;
      color: #1f2937;
    }
    .pledge-telugu {
      margin-bottom: 30px;
      white-space: pre-line;
      font-family: 'Noto Sans Telugu', sans-serif;
    }
    .pledge-english {
      border-top: 1px solid #e5e7eb;
      padding-top: 30px;
      white-space: pre-line;
    }
    .details {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .detail-label {
      font-weight: 600;
      color: #374151;
    }
    .detail-value {
      color: #1f2937;
      font-weight: 500;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Parents Pledge</h1>
      <h2>తల్లిదండ్రుల హామీ పత్రం</h2>
    </div>
    
    <div class="pledge-content">
      <div class="pledge-telugu">${TELUGU_PLEDGE}</div>
      <div class="pledge-english">${ENGLISH_PLEDGE}</div>
    </div>
    
    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Child Name / పిల్లవాడి పేరు:</span>
        <span class="detail-value">${pledge.childName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Parent Name / తల్లిదండ్రుల పేరు:</span>
        <span class="detail-value">${pledge.parentName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Institution / పాఠశాల:</span>
        <span class="detail-value">${pledge.institutionName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">District / జిల్లా:</span>
        <span class="detail-value">${pledge.district}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date / తేదీ:</span>
        <span class="detail-value">${new Date(pledge.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
    </div>
    
    <div class="footer">
      Government of Telangana - Road Safety Month 2026
    </div>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pledgeId = searchParams.get("pledgeId");

    if (!pledgeId) {
      return NextResponse.json(
        { error: "Pledge ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const pledge = await ParentsPledge.findById(pledgeId);

    if (!pledge) {
      return NextResponse.json(
        { error: "Pledge not found" },
        { status: 404 }
      );
    }

    const html = generatePledgeHTML(pledge);

    // For local development, return HTML and let client generate PNG
    // For production/serverless, use Puppeteer
    if (!isServerless && !process.env.PUPPETEER_EXECUTABLE_PATH) {
      // Return HTML for client-side conversion
      return NextResponse.json({
        html: html,
        pledge: {
          childName: pledge.childName,
          parentName: pledge.parentName,
          institutionName: pledge.institutionName,
          district: pledge.district,
          date: new Date(pledge.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        },
        useClientSide: true,
      });
    }

    // Generate PNG using Puppeteer (for production/serverless)
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
        ]
      : [];

    const browser = await puppeteer.launch({
      args: chromiumArgs,
      defaultViewport: { width: 800, height: 1200 },
      executablePath: isServerless
        ? await chromium.executablePath()
        : process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      headless: true,
      timeout: 30000,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { 
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // Wait for fonts to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      const png = await page.screenshot({
        type: "png",
        fullPage: true,
      });

      return new NextResponse(png as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="Parents-Pledge-${pledge.childName.replace(/\s+/g, "-")}.png"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    console.error("PNG generation error:", {
      message: error?.message || String(error),
      stack: error?.stack,
      error: error
    });
    return NextResponse.json(
      { 
        error: "Failed to generate PNG",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}

