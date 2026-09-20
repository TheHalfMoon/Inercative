import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const marker = "INERACTIVE_WORKSPACE_SHELL_READY";
const packageRoot = process.cwd();
const candidates = [
  path.join(packageRoot, ".next", "standalone", "packages", "control-plane", "server.js"),
  path.join(packageRoot, ".next", "standalone", "server.js"),
];

const serverPath = candidates.find((candidate) => fs.existsSync(candidate));
if (serverPath === undefined) {
  throw new Error("Standalone server.js was not produced in an expected location.");
}

const port = "3210";
const child = spawn(process.execPath, [serverPath], {
  cwd: path.dirname(serverPath),
  env: {
    ...process.env,
    HOSTNAME: "127.0.0.1",
    PORT: port,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
child.stdout.setEncoding("utf8");
child.stderr.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  if (typeof chunk === "string") {
    output += chunk;
  }
});
child.stderr.on("data", (chunk) => {
  if (typeof chunk === "string") {
    output += chunk;
  }
});

async function waitForMarker() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error("Standalone server exited before smoke request.\n" + output);
    }

    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      const body = await response.text();
      if (response.ok && body.includes(marker)) {
        return;
      }
    } catch {
      // Server may still be starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Timed out waiting for workspace shell marker.\n" + output);
}

try {
  await waitForMarker();
  console.log(marker);
} finally {
  child.kill("SIGTERM");
}
