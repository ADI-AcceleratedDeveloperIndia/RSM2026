import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const certificates = await Certificate.find({
      appreciationOptIn: true,
      appreciationText: { $exists: true, $ne: "" },
    }).sort({ createdAt: -1 });

    const csvHeader = "Name,Institution,Type,Appreciation Text,Date\n";
    const csvRows = certificates
      .map(
        (cert) =>
          `"${cert.fullName}","${cert.institution || ""}","${cert.type}","${(cert.appreciationText || "").replace(/"/g, '""')}","${cert.createdAt.toISOString()}"`
      )
      .join("\n");

    const csv = csvHeader + csvRows;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=appreciations.csv",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}



