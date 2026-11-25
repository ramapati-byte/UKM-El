import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Hanya aktifkan standalone output pada production build jika diperlukan,
  // untuk mempercepat dev build dan menghindari file-tracing berlebih saat 'npm run dev'.
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  reactStrictMode: false, // Mencegah double-render & double-mounting effect di mode development
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@react-oauth/google",
      "sweetalert2",
      "axios",
      "html5-qrcode",
      "react-qr-code",
    ],
  },
};

export default nextConfig;
