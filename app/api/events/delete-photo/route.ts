import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import Organizer from "@/models/Organizer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { getEventFromMemory, saveEventInMemory } from "@/lib/organizerStore";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON request" },
        { status: 400 }
      );
    }

    const { eventReferenceId, organizerId } = body;

    if (!eventReferenceId || !organizerId) {
      return NextResponse.json(
        { error: "Event Reference ID and Organizer ID are required" },
        { status: 400 }
      );
    }

    const cleanRefId = String(eventReferenceId).trim();
    const cleanOrgId = String(organizerId).trim();

    let event: any = null;
    let dbConnected = false;

    try {
      await connectDB();
      dbConnected = true;
      event = await Event.findOne({ referenceId: cleanRefId });
    } catch (dbError: any) {
      console.warn("MongoDB unavailable during photo deletion, checking memory store:", dbError?.message);
    }

    if (!event) {
      event = getEventFromMemory(cleanRefId);
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Authorization check
    let isAuthorized = (event.organizerId === cleanOrgId);

    if (!isAuthorized && dbConnected) {
      try {
        const org = (await Organizer.findOne({
          $or: [
            { finalId: cleanOrgId },
            { temporaryId: cleanOrgId },
            { email: cleanOrgId.toLowerCase() },
          ],
        }).lean()) as any;

        if (org && (org.finalId === event.organizerId || org.temporaryId === event.organizerId)) {
          isAuthorized = true;
        }
      } catch (e) {
        // Ignored
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized: Organizer ID does not match the organizer for this event" },
        { status: 403 }
      );
    }

    // Delete photo from GridFS if exists
    if (dbConnected && event.groupPhoto) {
      try {
        const db = mongoose.connection.db;
        if (db) {
          const bucket = new GridFSBucket(db, { bucketName: "eventPhotos" });
          if (mongoose.Types.ObjectId.isValid(event.groupPhoto)) {
            await bucket.delete(new mongoose.Types.ObjectId(event.groupPhoto));
          }
        }
      } catch (err) {
        console.error("Error deleting photo from GridFS:", err);
      }
    }

    if (dbConnected) {
      try {
        await Event.updateOne(
          { referenceId: cleanRefId },
          { $unset: { groupPhoto: "" } }
        );
      } catch (e) {
        console.warn("Event photo unset error:", e);
      }
    }

    // Update in-memory event
    const memoryEvent = getEventFromMemory(cleanRefId);
    if (memoryEvent) {
      memoryEvent.groupPhoto = undefined;
      saveEventInMemory(memoryEvent);
    }

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete photo error:", error);
    return NextResponse.json(
      { error: "Failed to delete photo. Please try again." },
      { status: 400 }
    );
  }
}
