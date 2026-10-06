import connectDB from "../lib/db";
import AdminUser from "../models/AdminUser";
import bcrypt from "bcryptjs";

async function seed() {
  await connectDB();
  
  const officers = [
    {
      email: "admin@rsm2027.gov.in",
      password: "RSM2027@admin",
      role: "superadmin",
      fullName: "RSM 2027 Administrator (System Owner)",
      state: "State Government",
      district: "All Districts",
      permissions: ["all"],
    },
    {
      email: "commissioner.transport@stategov.in",
      password: "RSM2027@state",
      role: "state_admin",
      fullName: "Transport Commissioner, State Government",
      state: "State Government",
      district: "State Headquarters",
      permissions: ["state_reports", "policy_approvals", "interventions"],
    },
    {
      email: "dto.hyderabad@stategov.in",
      password: "RSM2027@dto",
      role: "district_admin",
      fullName: "District Road Transport Authority Head, Hyderabad (Head of Transport)",
      state: "State Government",
      district: "Hyderabad",
      permissions: ["district_verification", "hazard_dispatch"],
    },
    {
      email: "dto.karimnagar@stategov.in",
      password: "RSM2027@dto",
      role: "district_admin",
      fullName: "District Road Transport Authority Head, Karimnagar (Head of Transport)",
      state: "State Government",
      district: "Karimnagar",
      permissions: ["district_verification", "hazard_dispatch"],
    },
    {
      email: "dto.warangal@stategov.in",
      password: "RSM2027@dto",
      role: "district_admin",
      fullName: "District Road Transport Authority Head, Warangal (Head of Transport)",
      state: "State Government",
      district: "Warangal",
      permissions: ["district_verification", "hazard_dispatch"],
    },
    {
      email: "verifier.central@stategov.in",
      password: "RSM2027@verifier",
      role: "verifier",
      fullName: "District Transport Nodal Field Verifier",
      state: "State Government",
      district: "Hyderabad",
      permissions: ["field_verification", "hazard_resolution"],
    },
  ];

  console.log("Seeding government officers and RBAC hierarchy...");

  for (const off of officers) {
    const passwordHash = await bcrypt.hash(off.password, 12);
    await AdminUser.findOneAndUpdate(
      { email: off.email },
      {
        $set: {
          email: off.email,
          passwordHash,
          role: off.role,
          fullName: off.fullName,
          state: off.state,
          district: off.district,
          permissions: off.permissions,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Seeded: ${off.role} -> ${off.email} (${off.district})`);
  }

  console.log("Government RBAC seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
