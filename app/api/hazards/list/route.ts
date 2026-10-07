import { NextResponse } from "next/server";
import { getGovSession } from "@/lib/govAuth";
import connectDB from "@/lib/db";
import Hazard from "@/models/Hazard";

const FALLBACK_HAZARDS = [
  {
    hazardId: "HZD-KRMR-00101",
    title: "Deep Pothole Cluster near Collectorate Junction",
    description: "Multiple severe potholes causing vehicular destabilization during evening rush hours.",
    category: "pothole",
    severity: "critical",
    status: "reported",
    district: "Karimnagar",
    location: "Collectorate Main Road, Opp SBI",
    reportedBy: "S. Rao (Citizen Vigilance)",
    photos: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60"],
    createdAt: new Date("2027-01-16T09:30:00Z"),
  },
  {
    hazardId: "HZD-KRMR-00102",
    title: "Missing Cautionary Signage at Blind S-Curve",
    description: "Acute blind curve lacking retro-reflective cautionary signs and cat eyes.",
    category: "missing_sign",
    severity: "high",
    status: "assigned",
    district: "Karimnagar",
    location: "Manakondur Bypass Junction",
    assignedTo: "Roads & Buildings Department",
    reportedBy: "Transport Safety Volunteer Team",
    photos: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60"],
    createdAt: new Date("2027-01-15T14:20:00Z"),
  },
  {
    hazardId: "HZD-HYDR-00201",
    title: "Broken Traffic Signal at Gachibowli Crossroad",
    description: "Primary traffic signal blinker inactive causing pedestrian crossing chaos.",
    category: "broken_signal",
    severity: "high",
    status: "reported",
    district: "Hyderabad",
    location: "Gachibowli Flyover Underpass",
    reportedBy: "K. Sharma",
    photos: ["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60"],
    createdAt: new Date("2027-01-16T11:00:00Z"),
  },
  {
    hazardId: "HZD-HYDR-00202",
    title: "Vegetation Overgrowth Obstructing Stop Sign",
    description: "Dense roadside boughs completely obscuring compulsory Stop sign before arterial merge.",
    category: "poor_visibility",
    severity: "medium",
    status: "resolved",
    district: "Hyderabad",
    location: "KBR Park Outer Ring Road",
    assignedTo: "GHMC Horticulture Division",
    resolvedBy: "Field Officer M. Patel",
    resolvedAt: new Date("2027-01-17T15:30:00Z"),
    resolutionNotes: "Vegetation cleared and high-intensity prismatic sign restored.",
    photos: ["https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&auto=format&fit=crop&q=60"],
    afterPhotos: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60"],
    createdAt: new Date("2027-01-14T08:15:00Z"),
  },
  {
    hazardId: "HZD-WRGL-00301",
    title: "Lack of Footpath along High School Zone",
    description: "Students forced to walk on active carriage way due to broken pedestrian curb.",
    category: "no_footpath",
    severity: "high",
    status: "reported",
    district: "Warangal",
    location: "Subedari Police Station Road",
    reportedBy: "Parent Teacher Association",
    photos: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60"],
    createdAt: new Date("2027-01-16T16:45:00Z"),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let district = searchParams.get("district");
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);

  // DTO Session scoping: if logged in as district_admin, enforce their district
  try {
    const session = await getGovSession();
    if (session?.user?.role === "district_admin" && session?.user?.district) {
      district = session.user.district;
    }
  } catch (_) {}

  try {
    await connectDB();

    const query: Record<string, any> = {};

    if (district && district !== "all") query.district = district;
    if (status && status !== "all") query.status = status;
    if (severity && severity !== "all") query.severity = severity;
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { hazardId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [hazards, total] = await Promise.all([
      Hazard.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Hazard.countDocuments(query),
    ]);

    if (total > 0) {
      return NextResponse.json({
        hazards,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    // Fallback hazards if DB is empty
    let filteredFallback = FALLBACK_HAZARDS;
    if (district && district !== "all") {
      filteredFallback = filteredFallback.filter(h => h.district.toLowerCase() === district.toLowerCase());
    }
    if (status && status !== "all") {
      filteredFallback = filteredFallback.filter(h => h.status === status);
    }
    if (severity && severity !== "all") {
      filteredFallback = filteredFallback.filter(h => h.severity === severity);
    }

    return NextResponse.json({
      hazards: filteredFallback,
      total: filteredFallback.length,
      page: 1,
      totalPages: 1,
    });
  } catch (error) {
    console.warn("Error fetching hazards, using fallback list:", error);
    let filteredFallback = FALLBACK_HAZARDS;
    if (district && district !== "all") {
      filteredFallback = filteredFallback.filter(h => h.district.toLowerCase() === district.toLowerCase());
    }
    if (status && status !== "all") {
      filteredFallback = filteredFallback.filter(h => h.status === status);
    }
    return NextResponse.json({
      hazards: filteredFallback,
      total: filteredFallback.length,
      page: 1,
      totalPages: 1,
    });
  }
}
