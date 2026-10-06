import connectDB from "../lib/db";
import AdminUser from "../models/AdminUser";
import bcrypt from "bcryptjs";

async function seed() {
  await connectDB();
  
  const email = "admin@rsm2027.gov.in";
  const password = "RSM2027@admin";
  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log("Admin user already exists:", email);
    process.exit(0);
  }
  
  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.create({
    email,
    passwordHash,
    role: "superadmin",
    fullName: "RSM 2027 Administrator",
    state: "State Government",
  });
  
  console.log("Government admin created:");
  console.log("  Email:", email);
  console.log("  Password:", password);
  console.log("  Role: superadmin");
  process.exit(0);
}

seed().catch(console.error);
