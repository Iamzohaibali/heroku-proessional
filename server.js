const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Version 2.0 - Hello, World!",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
  });
});

// CI/CD Test Route - Useful for deployment verification
app.get("/ci-cd", (req, res) => {
  res.json({
    status: "success",
    message: "CI/CD pipeline test successful",
    timestamp: new Date().toISOString(),
    buildInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || "development",
      gitCommit: process.env.GIT_COMMIT_HASH || "local-dev",
      buildNumber: process.env.BUILD_NUMBER || "N/A",
    },
    checks: {
      database: process.env.DB_CONNECTED === "true" ? "connected" : "not configured",
      cache: process.env.REDIS_CONNECTED === "true" ? "connected" : "not configured",
      api: "healthy",
    },
  });
});

app.get("/system-info", (req, res) => {
  res.json({
    app: {
      name: "Heroku Learning API",
      version: "2.0.0",
      uptimeSeconds: process.uptime(),
    },
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      memoryUsage: process.memoryUsage(),
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT,
    },
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});