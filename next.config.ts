import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pyodide"],
  turbopack: {},
};

export default nextConfig;
