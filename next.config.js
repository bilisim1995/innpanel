/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production için optimize edilmiş ayarlar
  reactStrictMode: true,
  swcMinify: true, // SWC minifier'ı etkinleştir
  
  // Image optimization
  images: {
    domains: ['images.pexels.com', 'innpanel.b-cdn.net'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // TypeScript ve ESLint ayarları
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Compression
  compress: true,
  
  // Output ayarları
  output: 'standalone',
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig