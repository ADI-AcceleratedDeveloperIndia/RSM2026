import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const photoId = searchParams.get("photoId");

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    const bucket = new GridFSBucket(db, { bucketName: "eventPhotos" });
    const objectId = new mongoose.Types.ObjectId(photoId);

    // Check if file exists
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    const file = files[0];
    const downloadStream = bucket.openDownloadStream(objectId);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    return new Promise<NextResponse>((resolve, reject) => {
      downloadStream.on("data", (chunk) => chunks.push(chunk));
      downloadStream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(buffer, {
            headers: {
              "Content-Type": file.contentType || "image/jpeg",
              "Content-Length": file.length.toString(),
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          })
        );
      });
      downloadStream.on("error", (err) => {
        console.error("Download stream error:", err);
        reject(
          NextResponse.json(
            { error: "Failed to retrieve photo" },
            { status: 500 }
          )
        );
      });
    });
  } catch (error: any) {
    console.error("Get photo error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve photo" },
      { status: 500 }
    );
  }
}
