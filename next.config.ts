import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Keep the route at "/" while exporting; GitHub Pages serves the artifact
  // from a project subpath, and Vite handles the asset prefix separately.
  basePath: "",
  images: { unoptimized: true },
};

export default nextConfig;
