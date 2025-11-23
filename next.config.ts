/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
