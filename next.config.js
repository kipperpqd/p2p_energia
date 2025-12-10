module.exports = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.gp2p.cloud',
      },
    ],
  },
}

