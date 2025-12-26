import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import translationRoute from "./routes/translation.js";
const key = process.env.KEY;
console.log("P3",key);


const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors({
  origin: ["http://localhost:3000"], // 🔐 change when deployed
  methods: ["GET"],
}));

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

const PORT = process.env.PORT;


app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
