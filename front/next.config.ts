/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001', // Porta do backend
        pathname: '/captcha', // Caminho do CAPTCHA
      },
    ],
  },
};

module.exports = nextConfig;
