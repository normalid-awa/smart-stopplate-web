/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        backendUrl: "https://192.168.0.126:8081/graphql",
        wsBackendUrl: "ws://192.168.0.126:8080/graphql"
    },
};

module.exports = nextConfig
