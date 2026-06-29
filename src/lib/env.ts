import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let loaded = false;

function stripInlineComment(value: string) {
  let quote: string | null = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if ((char === '"' || char === "'") && value[index - 1] !== "\\") {
      quote = quote === char ? null : char;
    }

    if (char === "#" && quote === null && /\s/.test(value[index - 1] ?? " ")) {
      return value.slice(0, index).trim();
    }
  }

  return value.trim();
}

function parseValue(raw: string) {
  let value = stripInlineComment(raw);

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return value.replaceAll("\\n", "\n");
}

export function loadLocalEnv() {
  if (loaded) {
    return;
  }

  loaded = true;
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
    const value = parseValue(trimmed.slice(index + 1));
    process.env[key] ??= value;
  }
}

export function getEnv(name: string) {
  loadLocalEnv();
  return process.env[name];
}

export function requiredEnv(name: string) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }

  return value;
}
