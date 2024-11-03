/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }
      return config;
    },
    transpilePackages: ['youtube-player', 'youtube-search-api', 'react-lite-youtube-embed'],
    async headers() {
        return [
          {
            source: '/:path*',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: `
                  default-src 'self';
                  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com;
                  frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;
                  img-src 'self' https://i.ytimg.com https://*.googleusercontent.com;
                  style-src 'self' 'unsafe-inline';
                  connect-src 'self' https://www.youtube.com https://googleads.g.doubleclick.net;
                `.replace(/\s{2,}/g, ' ').trim()
              },
            ],
          },
        ]
      },
    };
  export default nextConfig;