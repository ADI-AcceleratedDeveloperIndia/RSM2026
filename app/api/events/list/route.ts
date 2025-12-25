import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { getCache, setCache } from "@/lib/cache";

const CACHE_KEY = "events:list";
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cached = getCache<{ events: any[] }>(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    await connectDB();
    
    // Only return approved events
    const events = await Event.find({ approved: true })
      .sort({ date: -1 })
      .limit(100)
      .select("referenceId title date location organizerName institution approved groupPhoto youtubeVideos createdAt")
      .lean(); // Use lean() for better performance

    const result = { events };
    
    // Cache the result
    setCache(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Events list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

