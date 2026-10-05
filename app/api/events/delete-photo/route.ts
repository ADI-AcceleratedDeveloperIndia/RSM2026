import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventReferenceId, organizerId } = body;

    if (!eventReferenceId || !organizerId) {
      return NextResponse.json(
        { error: "Event Reference ID and Organizer ID are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify event exists and organizer matches
    const event = await Event.findOne({ referenceId: eventReferenceId });
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Verify organizer ID matches
    if (event.organizerId !== organizerId) {
      return NextResponse.json(
        { error: "Unauthorized: Organizer ID does not match" },
        { status: 403 }
      );
    }

    // Delete photo from GridFS if exists
    if (event.groupPhoto) {
      try {
        const db = mongoose.connection.db;
        if (db) {
          const bucket = new GridFSBucket(db, { bucketName: "eventPhotos" });
          await bucket.delete(new mongoose.Types.ObjectId(event.groupPhoto));
        }
      } catch (err) {
        console.error("Error deleting photo from GridFS:", err);
        // Continue even if deletion fails
      }
    }

    // Clear groupPhoto field in event
    await Event.updateOne(
      { referenceId: eventReferenceId },
      { $unset: { groupPhoto: "" } }
    );

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete photo error:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}

