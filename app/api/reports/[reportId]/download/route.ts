import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GovernmentReport from "@/models/GovernmentReport";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    await connectDB();

    const report = (await GovernmentReport.findOne({ reportId }).lean()) as any;
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const lines: string[] = [];
    lines.push(`REPORT_ID,${report.reportId}`);
    lines.push(`TITLE,"${report.title.replace(/"/g, '""')}"`);
    lines.push(`SCOPE,${report.scope}`);
    lines.push(`STATE,${report.state}`);
    lines.push(`GENERATED_AT,"${new Date(report.generatedAt).toISOString()}"`);
    lines.push("");
    lines.push("SECTION,METRIC,VALUE");
    lines.push(`AUDIT,Hazard Reported,${report.hazardAudit?.reported || 0}`);
    lines.push(`AUDIT,Hazard Resolved,${report.hazardAudit?.resolved || 0}`);
    lines.push(`AUDIT,Hazard Rectification Rate,${report.hazardAudit?.rectificationRate || 0}%`);
    lines.push(`AUDIT,Actions Committed,${report.actionAudit?.committed || 0}`);
    lines.push(`AUDIT,Actions Completed,${report.actionAudit?.completed || 0}`);
    lines.push(`AUDIT,Actions Verified,${report.actionAudit?.verified || 0}`);
    lines.push("");
    lines.push("TOP_DISTRICTS,RANK,DISTRICT,SCORE,GRADE");
    (report.topDistricts || []).forEach((d: any) => {
      lines.push(`TOP_DISTRICTS,${d.rank || 1},"${d.districtName}",${d.score},${d.grade}`);
    });

    const csvContent = lines.join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${report.reportId}-summary.csv"`,
      },
    });
  } catch (error) {
    console.error("Report download error:", error);
    return NextResponse.json({ error: "Failed to download report" }, { status: 500 });
  }
}
