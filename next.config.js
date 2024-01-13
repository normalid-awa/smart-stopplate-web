/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        backendUrl: "https://58.82.203.87:8080/graphql",
        wsBackendUrl: "wss://58.82.203.87:8080/graphql",
    },
};

module.exports = nextConfig
