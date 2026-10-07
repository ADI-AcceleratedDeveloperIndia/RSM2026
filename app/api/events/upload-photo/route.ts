import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { getEventFromMemory, saveEventInMemory } from "@/lib/organizerStore";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const eventReferenceId = (formData.get("eventReferenceId") as string)?.trim();
    const organizerId = (formData.get("organizerId") as string)?.trim();
    const file = formData.get("file") as File | null;

    if (!eventReferenceId || !file) {
      return NextResponse.json(
        { error: "Event Reference ID and file are required" },
        { status: 400 }
      );
    }

    // Check file size (1MB limit)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 1MB" },
        { status: 400 }
      );
    }

    // Check file type (only images)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    try {
      await connectDB();
    } catch (dbErr: any) {
      console.warn("MongoDB connection failed in upload-photo:", dbErr?.message);
      return NextResponse.json(
        { error: "Storage service temporarily unavailable. Please try again shortly." },
        { status: 503 }
      );
    }

    // Verify event exists
    let event = await Event.findOne({ referenceId: eventReferenceId });
    if (!event) {
      const mem = getEventFromMemory(eventReferenceId);
      if (mem) event = mem as any;
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.approved) {
      const isOwner = organizerId && (event.organizerId === organizerId);
      if (!isOwner) {
        return NextResponse.json(
          { error: "Event must be approved or verified by the organizing coordinator before uploading photos" },
          { status: 400 }
        );
      }
    }

    // Delete old photo if exists
    if (event.groupPhoto) {
      try {
        const db = mongoose.connection.db;
        if (db && mongoose.Types.ObjectId.isValid(event.groupPhoto)) {
          const bucket = new GridFSBucket(db, { bucketName: "eventPhotos" });
          await bucket.delete(new mongoose.Types.ObjectId(event.groupPhoto));
        }
      } catch (err) {
        console.error("Error deleting old photo:", err);
      }
    }

    // Upload new photo to GridFS
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database storage engine is not ready. Please try again." },
        { status: 503 }
      );
    }

    const bucket = new GridFSBucket(db, { bucketName: "eventPhotos" });
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() || "jpg";
    const filename = `${eventReferenceId}-${Date.now()}.${fileExt}`;

    return new Promise<NextResponse>((resolve) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.type,
      });

      uploadStream.on("finish", async () => {
        try {
          const photoIdStr = uploadStream.id.toString();

          // Update event with new photo ID in MongoDB
          await Event.updateOne(
            { referenceId: eventReferenceId },
            { groupPhoto: photoIdStr }
          );

          // Update memory store
          const memEvent = getEventFromMemory(eventReferenceId);
          if (memEvent) {
            memEvent.groupPhoto = photoIdStr;
            saveEventInMemory(memEvent);
          }

          resolve(
            NextResponse.json({
              success: true,
              photoId: photoIdStr,
            })
          );
        } catch (err: any) {
          console.error("Error updating event photo ID:", err);
          resolve(
            NextResponse.json(
              { error: "Failed to link photo to event record" },
              { status: 500 }
            )
          );
        }
      });

      uploadStream.on("error", (err) => {
        console.error("GridFS upload stream error:", err);
        resolve(
          NextResponse.json(
            { error: "Failed to upload photo to storage" },
            { status: 500 }
          )
        );
      });

      uploadStream.end(buffer);
    });
  } catch (error: any) {
    console.error("Upload photo error:", error);
    return NextResponse.json(
      { error: "Failed to process photo upload. Please try again." },
      { status: 400 }
    );
  }
}
