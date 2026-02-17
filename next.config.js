/** @type {import('next').NextConfig} */
const nextConfig = {
    // Otimizações de performance
    swcMinify: true,
    compress: true,

    // Imagens otimizadas
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Experimental features para melhor performance
    experimental: {
        optimizePackageImports: ["@supabase/supabase-js", "react"],
    },

    // Headers para cache
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=60, s-maxage=60",
                    },
                ],
            },
            {
                source: "/:path*",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
