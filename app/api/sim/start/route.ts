import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
// Optional: log scene starts if needed
// For now, we'll just return success

export async function POST(request: NextRequest) {
  try {
    // Optional: Add start logging here if needed
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: true }); // Fail silently
  }
}






