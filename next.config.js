/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: process.env.NEXT_PUBLIC_backendUrl + ":path*",
				basePath: false,
			},
		];
	},
	skipTrailingSlashRedirect: true,
	skipMiddlewareUrlNormalize: true,
};

module.exports = nextConfig
