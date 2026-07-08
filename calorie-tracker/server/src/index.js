import "dotenv/config";
import express from "express";
import cors from "cors";
import { identifyFoodItems } from "./gemini.js";
import { lookupCaloriesPer100g } from "./usda.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/analyze", async (req, res) => {
  const { image, mediaType } = req.body ?? {};
  if (!image || !mediaType) {
    return res.status(400).json({ error: "Request must include base64 'image' and 'mediaType'." });
  }

  try {
    const identifiedItems = await identifyFoodItems({ base64Image: image, mediaType });

    const items = await Promise.all(
      identifiedItems.map(async (item) => {
        let calorieInfo = null;
        try {
          calorieInfo = await lookupCaloriesPer100g(item.name);
        } catch (err) {
          console.error(`USDA lookup error for "${item.name}":`, err.message);
        }

        const totalCalories = calorieInfo
          ? Math.round((calorieInfo.caloriesPer100g / 100) * item.estimated_grams)
          : null;

        return {
          name: item.name,
          notes: item.notes ?? null,
          estimatedGrams: item.estimated_grams,
          matchedName: calorieInfo?.matchedName ?? null,
          caloriesPer100g: calorieInfo?.caloriesPer100g ?? null,
          totalCalories,
        };
      })
    );

    const totalCalories = items.reduce((sum, item) => sum + (item.totalCalories ?? 0), 0);
    const hasUnmatchedItems = items.some((item) => item.totalCalories == null);

    res.json({ items, totalCalories, hasUnmatchedItems });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: "Failed to analyze photo. Please try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Calorie tracker server listening on port ${PORT}`);
});
