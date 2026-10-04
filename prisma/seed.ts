import { spawn } from "child_process";
import path from "path";

// prisma/seed.ts forwards directly to prisma/seed-production.js
// to ensure ONLY demo1-demo6, Super Admin, and Master Plans are seeded.
async function main() {
  console.log("🌱 Forwarding seed execution to seed-production.js...");
  const seedScriptPath = path.join(__dirname, "seed-production.js");
  const child = spawn("node", [seedScriptPath], { stdio: "inherit" });
  
  child.on("close", (code) => {
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
