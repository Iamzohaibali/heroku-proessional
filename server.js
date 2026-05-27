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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});