/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        backendUrl: "https://192.168.0.126:8080/graphql",
        wsBackendUrl: "wss://192.168.0.126:8080/graphql"
    },
};

module.exports = nextConfig
