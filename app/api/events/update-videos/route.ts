import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

// Validate YouTube URL
function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

// Extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Convert any YouTube URL to embed format
function normalizeYouTubeUrl(url: string): string {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url; // Return as-is if we can't extract ID
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventReferenceId, youtubeVideos } = body;

    if (!eventReferenceId) {
      return NextResponse.json(
        { error: "Event Reference ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(youtubeVideos)) {
      return NextResponse.json(
        { error: "youtubeVideos must be an array" },
        { status: 400 }
      );
    }

    // Limit to 5 videos
    if (youtubeVideos.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 YouTube videos allowed" },
        { status: 400 }
      );
    }

    // Validate and normalize YouTube URLs
    const normalizedVideos: string[] = [];
    for (const url of youtubeVideos) {
      if (!url || typeof url !== "string") continue;
      const trimmedUrl = url.trim();
      if (!trimmedUrl) continue;

      if (!isValidYouTubeUrl(trimmedUrl)) {
        return NextResponse.json(
          { error: `Invalid YouTube URL: ${trimmedUrl}` },
          { status: 400 }
        );
      }

      normalizedVideos.push(normalizeYouTubeUrl(trimmedUrl));
    }

    await connectDB();

    // Verify event exists and is approved
    const event = await Event.findOne({ referenceId: eventReferenceId });
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.approved) {
      return NextResponse.json(
        { error: "Event must be approved before adding videos" },
        { status: 400 }
      );
    }

    // Update event with YouTube videos
    await Event.updateOne(
      { referenceId: eventReferenceId },
      { youtubeVideos: normalizedVideos }
    );

    return NextResponse.json({
      success: true,
      youtubeVideos: normalizedVideos,
    });
  } catch (error: any) {
    console.error("Update videos error:", error);
    return NextResponse.json(
      { error: "Failed to update videos" },
      { status: 500 }
    );
  }
}

