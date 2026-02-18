import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pyodide"],
  turbopack: {},
};

export default nextConfig;
