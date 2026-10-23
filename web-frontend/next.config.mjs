/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["msedge-tts", "ws", "@elevenlabs/elevenlabs-js"],
  },
};

export default nextConfig;
