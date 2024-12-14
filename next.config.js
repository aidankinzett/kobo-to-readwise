/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Add this to handle location references better in static builds
  experimental: {
    appDocumentPreloading: false,
  },
};

export default nextConfig;
