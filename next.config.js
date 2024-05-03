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
	redirects: [
		{
			source: "/api",
			destination: process.env.NEXT_PUBLIC_backendUrl + "",
			permanent: true,
		},
	],
};

module.exports = nextConfig
