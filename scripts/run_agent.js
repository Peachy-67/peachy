import fs from "fs";
import path from "path";

async function runAgent() {

  console.log("🍑 Peachy AI agent starting...");

  const projectFiles = fs.readdirSync("./");

  console.log("📁 Current repo files:", projectFiles);

  // simple improvement example
  const logFile = "peachy_log.txt";

  const entry = `Peachy ran at ${new Date().toISOString()}\n`;

  fs.appendFileSync(logFile, entry);

  console.log("✅ Logged run to peachy_log.txt");

}

runAgent();