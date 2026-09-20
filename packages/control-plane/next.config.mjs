import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(packageRoot, "../.."),
  transpilePackages: ["@ineractive/protocol"],
};

export default nextConfig;
