/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/proxy/main/:path*',
        destination: 'http://192.168.18.108:8080/:path*',
      },
      {
        source: '/proxy/chat/:path*',
        destination: 'http://192.168.18.108:8082/:path*',
      },
      {
        source: '/proxy/workout/:path*',
        destination: 'http://192.168.18.108:8083/:path*',
      },
    ];
  },
};

export default nextConfig;
