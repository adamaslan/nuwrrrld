/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Transpile Three.js packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];

    // Tree-shake Three.js
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': 'three/src/Three.js',
    };

    // Optimize chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three-vendor',
            priority: 10,
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
