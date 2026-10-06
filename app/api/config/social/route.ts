import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SystemConfig from "@/models/SystemConfig";

const DEFAULT_HASHTAGS = [
  "#RoadSafetyMonth2027",
  "#SadakSurakshaJeevanRaksha",
  "#StateTransport",
  "#SafeRoadsSaveLives",
  "#ZeroAccidents2027",
];

const DEFAULT_MESSAGE =
  "I am proud to receive the official Road Safety Certificate from the Government Transport Department! Let us commit to responsible road behaviour and zero accidents.";

export async function GET() {
  try {
    await connectDB();
    let config: any = await SystemConfig.findOne({ key: "platform_config" }).lean();

    if (!config) {
      config = await SystemConfig.create({
        key: "platform_config",
        stateName: "State Government",
        stateCode: "SG",
        year: 2027,
        socialHashtags: DEFAULT_HASHTAGS,
        socialShareMessage: DEFAULT_MESSAGE,
      });
    }

    const hashtags =
      Array.isArray(config?.socialHashtags) && config.socialHashtags.length > 0
        ? config.socialHashtags
        : DEFAULT_HASHTAGS;

    const message = config?.socialShareMessage || DEFAULT_MESSAGE;

    return NextResponse.json({
      success: true,
      socialHashtags: hashtags,
      socialShareMessage: message,
      stateName: config?.stateName || "State Government",
      stateCode: config?.stateCode || "SG",
      year: config?.year || 2027,
    });
  } catch (error: any) {
    console.error("Error fetching social config:", error);
    return NextResponse.json({
      success: true,
      socialHashtags: DEFAULT_HASHTAGS,
      socialShareMessage: DEFAULT_MESSAGE,
      stateName: "State Government",
      stateCode: "SG",
      year: 2027,
    });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { socialHashtags, socialShareMessage, updatedBy } = body;

    let cleanHashtags: string[] = [];
    if (Array.isArray(socialHashtags)) {
      cleanHashtags = socialHashtags
        .map((tag: any) => String(tag).trim())
        .filter((tag: string) => tag.length > 0)
        .map((tag: string) => (tag.startsWith("#") ? tag : `#${tag}`));
    } else if (typeof socialHashtags === "string") {
      cleanHashtags = socialHashtags
        .split(/[\s,]+/)
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)
        .map((tag: string) => (tag.startsWith("#") ? tag : `#${tag}`));
    }

    if (cleanHashtags.length === 0) {
      cleanHashtags = DEFAULT_HASHTAGS;
    }

    const cleanMessage =
      typeof socialShareMessage === "string" && socialShareMessage.trim().length > 0
        ? socialShareMessage.trim()
        : DEFAULT_MESSAGE;

    const updated: any = await SystemConfig.findOneAndUpdate(
      { key: "platform_config" },
      {
        $set: {
          socialHashtags: cleanHashtags,
          socialShareMessage: cleanMessage,
          updatedBy: updatedBy || "Superadmin",
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Social campaign parameters saved successfully",
      socialHashtags: updated?.socialHashtags || cleanHashtags,
      socialShareMessage: updated?.socialShareMessage || cleanMessage,
    });
  } catch (error: any) {
    console.error("Error saving social config:", error);
    return NextResponse.json(
      { error: "Failed to save social configuration", details: error?.message },
      { status: 500 }
    );
  }
}
