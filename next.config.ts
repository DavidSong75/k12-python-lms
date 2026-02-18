import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pyodide"],
  output: "standalone",
  turbopack: {},
};

export default nextConfig;
