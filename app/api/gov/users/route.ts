import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import AdminUser from "@/models/AdminUser";

const DEFAULT_OFFICERS = [
  {
    _id: "usr_gov_001",
    email: "admin@rsm2027.gov.in",
    fullName: "RSM 2027 Administrator",
    role: "superadmin",
    state: "State Government",
    district: "All Districts",
    permissions: ["all"],
  },
  {
    _id: "usr_gov_002",
    email: "commissioner.transport@stategov.in",
    fullName: "Transport Commissioner, State Government",
    role: "state_admin",
    state: "State Government",
    district: "State Headquarters",
    permissions: ["state_reports", "policy_approvals", "interventions"],
  },
  {
    _id: "usr_gov_003",
    email: "dto.hyderabad@stategov.in",
    fullName: "District Road Transport Authority Head, Hyderabad (Head of Transport)",
    role: "district_admin",
    state: "State Government",
    district: "Hyderabad",
    permissions: ["district_verification", "hazard_dispatch"],
  },
  {
    _id: "usr_gov_004",
    email: "dto.karimnagar@stategov.in",
    fullName: "District Road Transport Authority Head, Karimnagar (Head of Transport)",
    role: "district_admin",
    state: "State Government",
    district: "Karimnagar",
    permissions: ["district_verification", "hazard_dispatch"],
  },
  {
    _id: "usr_gov_005",
    email: "dto.warangal@stategov.in",
    fullName: "District Road Transport Authority Head, Warangal (Head of Transport)",
    role: "district_admin",
    state: "State Government",
    district: "Warangal",
    permissions: ["district_verification", "hazard_dispatch"],
  },
  {
    _id: "usr_gov_006",
    email: "verifier.central@stategov.in",
    fullName: "District Transport Nodal Field Verifier",
    role: "verifier",
    state: "State Government",
    district: "Hyderabad",
    permissions: ["field_verification", "hazard_resolution"],
  },
];

export async function GET() {
  try {
    await connectDB();
    const users = await AdminUser.find({}, { passwordHash: 0 }).lean();

    if (!users || users.length === 0) {
      return NextResponse.json({ users: DEFAULT_OFFICERS });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching gov users:", error);
    return NextResponse.json({ users: DEFAULT_OFFICERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, fullName, district, state } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["superadmin", "state_admin", "district_admin", "verifier", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    await connectDB();

    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An officer with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await AdminUser.create({
      email,
      passwordHash,
      role,
      fullName: fullName || email.split("@")[0],
      district: district || undefined,
      state: state || "State Government",
      permissions:
        role === "superadmin"
          ? ["all"]
          : role === "state_admin"
          ? ["state_reports", "policy_approvals"]
          : role === "district_admin"
          ? ["district_verification", "hazard_dispatch"]
          : ["field_verification"],
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.fullName,
        district: newUser.district,
        state: newUser.state,
      },
    });
  } catch (error: any) {
    console.error("Error creating gov user:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create officer account" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, role, district, fullName } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectDB();

    const updated = await AdminUser.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(role && { role }),
          ...(district && { district }),
          ...(fullName && { fullName }),
        },
      },
      { new: true, projection: { passwordHash: 0 } }
    );

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Error updating gov user:", error);
    return NextResponse.json({ error: "Failed to update officer" }, { status: 500 });
  }
}
