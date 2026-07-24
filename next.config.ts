import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Scoped to the WebContainers spike only — COEP: require-corp would
        // otherwise block cross-origin resources (e.g. moodboard images) app-wide.
        source: "/webcontainer-test",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
