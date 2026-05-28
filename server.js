require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

/*
|--------------------------------------------------------------------------
| BASIC SECURITY SETTINGS
|--------------------------------------------------------------------------
*/

// Hide Express technology info
app.disable("x-powered-by");

// Secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Parse JSON safely
app.use(express.json({ limit: "10kb" }));

// Prevent huge form submissions
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/*
|--------------------------------------------------------------------------
| HTTPS REDIRECT (FOR PRODUCTION)
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }

  next();
});

/*
|--------------------------------------------------------------------------
| CORS CONFIGURATION
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "https://zohaibtech.dev",
  "https://www.zohaibtech.dev",
  "https://api.zohaibtech.dev",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| RATE LIMITING
|--------------------------------------------------------------------------
*/

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

/*
|--------------------------------------------------------------------------
| API KEY MIDDLEWARE
|--------------------------------------------------------------------------
*/

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "API key missing",
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key",
    });
  }

  next();
};

/*
|--------------------------------------------------------------------------
| REQUEST LOGGER
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );

  next();
});

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Professional Secure API Running",
    version: "3.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| CI/CD VERIFICATION ROUTE
|--------------------------------------------------------------------------
*/

app.get("/ci-cd", (req, res) => {
  res.json({
    success: true,
    message: "CI/CD pipeline working successfully",
    deployment: {
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      platform: process.platform,
    },
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| SECURED SYSTEM INFO ROUTE
|--------------------------------------------------------------------------
*/

app.get("/system-info", apiKeyMiddleware, (req, res) => {
  res.json({
    success: true,

    app: {
      name: "Heroku Secure API",
      version: "3.0.0",
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

/*
|--------------------------------------------------------------------------
| DEMO POST ROUTE WITH VALIDATION
|--------------------------------------------------------------------------
*/

app.post("/api/message", (req, res) => {
  const { name, message } = req.body;

  // Basic validation
  if (!name || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      error: "Valid name is required",
    });
  }

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: "Valid message is required",
    });
  }

  // Length validation
  if (name.length > 50 || message.length > 500) {
    return res.status(400).json({
      success: false,
      error: "Input too long",
    });
  }

  res.status(201).json({
    success: true,
    data: {
      name,
      message,
    },
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);

  // CORS errors
  if (err.message === "CORS policy violation") {
    return res.status(403).json({
      success: false,
      error: "Access denied by CORS policy",
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
========================================
🚀 Secure API Server Running
🌍 Environment: ${process.env.NODE_ENV || "development"}
📡 Port: ${PORT}
========================================
  `);
});