next.config.js 
```
/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        backendUrl: "https://0.0.0.0",
        wsBackendUrl: "wss://0.0.0.0",
    },
};

module.exports = nextConfig

```

.env 
```
backendUrl = "https://0.0.0.0"
wsBackendUrl = "wss://0.0.0.0"
```