import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  logging: {
    browserToTerminal: false,
    serverFunctions: true,
  },
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
}

export default nextConfig
