/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.fs = false;
    config.resolve.alias.path = false;
    config.resolve.alias.crypto = false;
    return config;
  },
};

export default nextConfig;
