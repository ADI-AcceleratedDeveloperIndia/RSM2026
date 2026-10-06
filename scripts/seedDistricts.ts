import connectDB from "../lib/db";
import District from "../models/District";
import { TELANGANA_DISTRICTS } from "../lib/districts";

async function seedDistricts() {
  await connectDB();

  console.log("Seeding State Districts...");
  let createdCount = 0;
  let updatedCount = 0;

  for (const d of TELANGANA_DISTRICTS) {
    const existing = await District.findOne({ code: d.code });
    if (!existing) {
      await District.create({
        code: d.code,
        name: d.name,
        state: d.state,
        stateCode: d.stateCode,
        headquarters: d.name,
      });
      createdCount++;
    } else {
      await District.updateOne(
        { code: d.code },
        {
          $set: {
            name: d.name,
            state: d.state,
            stateCode: d.stateCode,
          },
        }
      );
      updatedCount++;
    }
  }

  console.log(`Districts seeding completed: ${createdCount} created, ${updatedCount} updated.`);
  process.exit(0);
}

seedDistricts().catch((err) => {
  console.error("Error seeding districts:", err);
  process.exit(1);
});
