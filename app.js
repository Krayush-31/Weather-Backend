import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import translationRoute from "./routes/translation.js";

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

// ✅ Proper CORS setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",               // Vite dev server
      "http://localhost:3000",               // optional (CRA)
      "https://weather-backend-g6xf.onrender.com",
      "https://cloudstoknow.vercel.app"  
    ],
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  })
);

// ✅ Handle preflight requests (VERY IMPORTANT)
app.options("*", cors());

app.use(express.json());

/* ---------------- ROUTES ---------------- */

app.use("/api/translations", translationRoute);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Translation & Weather API is running",
  });
});

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({
    error: "Internal Server Error",
  });
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
