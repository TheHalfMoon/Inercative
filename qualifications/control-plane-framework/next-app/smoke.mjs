import { spawn } from "node:child_process";

const marker = "INERACTIVE_CONTROL_PLANE_FRAMEWORK_QUALIFIED";
const port = 3100;
const host = "127.0.0.1";
const url = `http://${host}:${port}/`;

const server = spawn(process.execPath, [".next/standalone/server.js"], {
  env: {
    ...process.env,
    HOSTNAME: host,
    PORT: String(port),
    NEXT_TELEMETRY_DISABLED: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
server.stderr.on("data", (chunk) => {
  stderr += String(chunk);
});

const deadline = Date.now() + 30_000;
let success = false;

try {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      const body = await response.text();
      if (response.ok && body.includes(marker)) {
        success = true;
        break;
      }
    } catch {
      // Server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
} finally {
  server.kill("SIGTERM");
}

if (!success) {
  throw new Error(`Standalone HTTP smoke failed. stderr=\n${stderr}`);
}

console.log(JSON.stringify({ marker, node: process.version, url, result: "PASS" }));
