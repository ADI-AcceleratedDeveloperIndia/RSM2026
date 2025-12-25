import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DailyReport from "@/models/DailyReport";
import Event from "@/models/Event";
import Certificate from "@/models/Certificate";
import Organizer from "@/models/Organizer";
import QuizAttempt from "@/models/QuizAttempt";
import SimulationPlay from "@/models/SimulationPlay";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication (add your auth check here)
    await connectDB();

    // Get date from request body, or use today's date
    const body = await request.json().catch(() => ({}));
    const dateStr = body.date || new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if report already exists for this date
    const existingReport = await DailyReport.findOne({ date: dateStr });
    if (existingReport) {
      return NextResponse.json({
        success: true,
        message: "Report already exists for this date",
        reportId: existingReport._id,
        date: dateStr,
      });
    }

    // Calculate start and end of day (12 AM to 11:59 PM) for the specified date
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Collect all data for today
    const [events, certificates, organizers, quizAttempts, simulationPlays] = await Promise.all([
      Event.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).lean(),
      Certificate.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).lean(),
      Organizer.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).lean(),
      QuizAttempt.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).lean(),
      SimulationPlay.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).lean(),
    ]);

    // Calculate statistics
    const totalCertificates = certificates.length;
    const totalAppreciations = certificates.filter((c: any) => c.appreciationOptIn && c.appreciationText).length;
    const totalEvents = events.length;
    const totalQuizPasses = quizAttempts.filter((q: any) => q.passed).length;
    const totalQuizAttempts = quizAttempts.length;
    const passRate = totalQuizAttempts > 0 ? (totalQuizPasses / totalQuizAttempts) * 100 : 0;
    const totalSimulationPlays = simulationPlays.length;
    
    // Calculate simulation success rate
    const successfulSimulations = simulationPlays.filter((s: any) => s.success).length;
    const successRate = totalSimulationPlays > 0 ? (successfulSimulations / totalSimulationPlays) * 100 : 0;
    
    // Calculate average time
    const totalTime = simulationPlays.reduce((sum: number, s: any) => sum + (s.seconds || 0), 0);
    const avgTimeSeconds = totalSimulationPlays > 0 ? Math.round(totalTime / totalSimulationPlays) : 0;

    // Format participants data
    const participants = certificates.map((cert: any) => ({
      certificateId: cert.certificateId,
      fullName: cert.fullName,
      institution: cert.institution || "",
      type: cert.type,
      score: cert.score,
      total: cert.total,
      percentage: cert.total > 0 ? Math.round((cert.score / cert.total) * 100) : 0,
      activityType: cert.activityType,
      eventReferenceId: cert.eventReferenceId || "",
      eventTitle: cert.eventTitle || "",
      createdAt: cert.createdAt,
    }));

    // Create daily report
    const dailyReport = new DailyReport({
      date: dateStr,
      events: events.map((e: any) => ({
        referenceId: e.referenceId,
        title: e.title,
        organizerId: e.organizerId,
        organizerName: e.organizerName,
        institution: e.institution,
        date: e.date,
        location: e.location,
        approved: e.approved,
        createdAt: e.createdAt,
      })),
      participants,
      organizers: organizers.map((o: any) => ({
        temporaryId: o.temporaryId,
        finalId: o.finalId || "",
        fullName: o.fullName,
        email: o.email,
        phone: o.phone,
        institution: o.institution,
        designation: o.designation,
        status: o.status,
        createdAt: o.createdAt,
      })),
      stats: {
        totalCertificates,
        totalAppreciations,
        totalEvents,
        totalQuizPasses,
        totalQuizAttempts,
        passRate: Math.round(passRate * 100) / 100,
        totalSimulationPlays,
        successRate: Math.round(successRate * 100) / 100,
        avgTimeSeconds,
      },
    });

    await dailyReport.save();

    return NextResponse.json({
      success: true,
      reportId: dailyReport._id,
      date: dateStr,
      stats: dailyReport.stats,
    });
  } catch (error: any) {
    console.error("Daily report collection error:", error);
    return NextResponse.json(
      { error: "Failed to collect daily report" },
      { status: 500 }
    );
  }
}

