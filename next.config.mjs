/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // This is needed for MediaPipe libraries
    config.resolve.fallback = { fs: false, path: false };
    
    // Ignore specific warnings from MediaPipe
    config.ignoreWarnings = [
      { module: /@mediapipe/ },
    ];
    
    return config;
  },
};

export default nextConfig;
