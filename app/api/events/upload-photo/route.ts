import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const eventReferenceId = formData.get("eventReferenceId") as string;
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
        { error: "Event must be approved before uploading photos" },
        { status: 400 }
      );
    }

    // Delete old photo if exists
    if (event.groupPhoto) {
      try {
        const db = mongoose.connection.db;
        if (db) {
          const bucket = new GridFSBucket(db, { bucketName: "eventPhotos" });
          await bucket.delete(new mongoose.Types.ObjectId(event.groupPhoto));
        }
      } catch (err) {
        console.error("Error deleting old photo:", err);
        // Continue even if deletion fails
      }
    }

    // Upload new photo to GridFS
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    const bucket = new GridFSBucket(db, { bucketName: "eventPhotos" });
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${eventReferenceId}-${Date.now()}.${file.name.split(".").pop()}`;

    return new Promise<NextResponse>((resolve) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.type,
      });

      uploadStream.on("finish", async () => {
        try {
          // Update event with new photo ID
          await Event.updateOne(
            { referenceId: eventReferenceId },
            { groupPhoto: uploadStream.id.toString() }
          );

          resolve(
            NextResponse.json({
              success: true,
              photoId: uploadStream.id.toString(),
            })
          );
        } catch (err: any) {
          console.error("Error updating event:", err);
          resolve(
            NextResponse.json(
              { error: "Failed to update event" },
              { status: 500 }
            )
          );
        }
      });

      uploadStream.on("error", (err) => {
        console.error("GridFS upload error:", err);
        resolve(
          NextResponse.json(
            { error: "Failed to upload photo" },
            { status: 500 }
          )
        );
      });

      uploadStream.end(buffer);
    });
  } catch (error: any) {
    console.error("Upload photo error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

