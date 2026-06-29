import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) {
    return;
  }

  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    if (index <= 0) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

loadEnvFile();

const appUrl = process.env.APP_URL ?? "http://localhost:4321";
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("CRON_SECRET is required.");
  process.exit(1);
}

const response = await fetch(`${appUrl.replace(/\/$/, "")}/api/cron/monitor`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`
  }
});

const text = await response.text();
console.log(text);

if (!response.ok) {
  process.exitCode = 1;
}
