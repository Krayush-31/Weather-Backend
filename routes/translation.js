import express from "express";
import fs from "fs";
import path from "path";
import { stateLanguageMap } from "../data/stateLanguageMap.js";

const router = express.Router();

/* ---------------- HELPERS ---------------- */

const getWeatherKey = () => process.env.KEY;

const loadTranslation = (lang) => {
  const basePath = path.resolve("data/translations");
  const filePath = path.join(basePath, `${lang}.json`);

  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  return JSON.parse(
    fs.readFileSync(path.join(basePath, "en.json"), "utf-8")
  );
};

const getCityFromCoords = async (lat, lon) => {
  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${getWeatherKey()}`
  );
  const data = await res.json();

  if (!data?.length) return null;

  return {
    name: data[0].name,
    state: data[0].state,
    country: data[0].country,
    lat,
    lon,
  };
};

const getAQI = async (lat, lon) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${getWeatherKey()}`
  );
  const data = await res.json();
  return data?.list?.[0]?.main?.aqi ?? null;
};

/* ---------------- ROUTE ---------------- */

router.get("/", async (req, res) => {
  try {
    console.log("RUNTIME KEY:", process.env.KEY);

    const { lat, lon, language } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon are required" });
    }

    const city = await getCityFromCoords(lat, lon);

    let finalLang = "en";
    if (language === "hi") finalLang = "hi";

    if (language === "regional" && city?.state) {
      finalLang = stateLanguageMap[city.state] || "en";
    }

    const uiText = loadTranslation(finalLang);

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=${finalLang}&appid=${getWeatherKey()}`
    );

    if (!weatherRes.ok) {
      const text = await weatherRes.text();
      console.error("❌ OpenWeather:", weatherRes.status, text);
      throw new Error("Weather API failed");
    }

    const weatherData = await weatherRes.json();

    const weather = {
      current: weatherData.list[0],
      hourly: weatherData.list.slice(0, 8),
      daily: weatherData.list.filter((_, i) => i % 8 === 0).slice(0, 7),
      timezone: weatherData.city.timezone,
    };

    const aqi = await getAQI(lat, lon);

    res.json({
      language: finalLang,
      uiText,
      city,
      weather,
      aqi,
    });

  } catch (err) {
    console.error("🔥 BACKEND ERROR:", err);
    res.status(500).json({
      error: "Weather fetch failed",
      details: err.message,
    });
  }
});

export default router;
