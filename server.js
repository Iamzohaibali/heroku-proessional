const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Hello from Heroku!",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});