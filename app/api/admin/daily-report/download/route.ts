import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DailyReport from "@/models/DailyReport";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required (format: YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    await connectDB();

    const report = await DailyReport.findOne({ date });
    if (!report) {
      return NextResponse.json(
        { error: "Report not found for the specified date" },
        { status: 404 }
      );
    }

    // Generate CSV
    const csvRows: string[] = [];

    // Header
    csvRows.push("DAILY REPORT - " + date);
    csvRows.push("");

    // Statistics
    csvRows.push("STATISTICS");
    csvRows.push("Total Certificates," + report.stats.totalCertificates);
    csvRows.push("Total Appreciations," + report.stats.totalAppreciations);
    csvRows.push("Total Events," + report.stats.totalEvents);
    csvRows.push("Quiz Passes," + report.stats.totalQuizPasses);
    csvRows.push("Quiz Attempts," + report.stats.totalQuizAttempts);
    csvRows.push("Pass Rate %," + report.stats.passRate);
    csvRows.push("Simulation Plays," + report.stats.totalSimulationPlays);
    csvRows.push("Success Rate %," + report.stats.successRate);
    csvRows.push("Avg Time (seconds)," + report.stats.avgTimeSeconds);
    csvRows.push("");

    // Events
    csvRows.push("EVENTS");
    csvRows.push("Event ID,Title,Organizer ID,Organizer Name,Institution,Date,Location,Approved");
    report.events.forEach((event: any) => {
      csvRows.push(
        `"${event.referenceId}","${event.title}","${event.organizerId}","${event.organizerName}","${event.institution}","${event.date}","${event.location}","${event.approved}"`
      );
    });
    csvRows.push("");

    // Participants
    csvRows.push("PARTICIPANTS");
    csvRows.push("Certificate ID,Full Name,Institution,Type,Score,Total,Percentage,Activity Type,Event ID,Event Title,Created At");
    report.participants.forEach((participant: any) => {
      csvRows.push(
        `"${participant.certificateId}","${participant.fullName}","${participant.institution || ""}","${participant.type}","${participant.score}","${participant.total}","${participant.percentage}","${participant.activityType}","${participant.eventReferenceId || ""}","${participant.eventTitle || ""}","${participant.createdAt}"`
      );
    });
    csvRows.push("");

    // Organizers
    csvRows.push("ORGANIZERS");
    csvRows.push("Temporary ID,Final ID,Full Name,Email,Phone,Institution,Designation,Status,Created At");
    report.organizers.forEach((organizer: any) => {
      csvRows.push(
        `"${organizer.temporaryId}","${organizer.finalId || ""}","${organizer.fullName}","${organizer.email}","${organizer.phone}","${organizer.institution}","${organizer.designation}","${organizer.status}","${organizer.createdAt}"`
      );
    });

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=daily-report-${date}.csv`,
      },
    });
  } catch (error: any) {
    console.error("Daily report download error:", error);
    return NextResponse.json(
      { error: "Failed to download daily report" },
      { status: 500 }
    );
  }
}







