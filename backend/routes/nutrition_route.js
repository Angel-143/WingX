// routes/nutrition_route.js
import express from "express";
import isAuth from "../middleware/isAuth.js";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import sharp from "sharp";

const nutritionRoute = express.Router();
const upload = multer({ dest: "uploads/" });
const LOGMEAL_BASE = "https://api.logmeal.com/v2";

nutritionRoute.post("/scan", isAuth, upload.single("image"), async (req, res) => {
    let compressedPath = null;
    try {
        if (!req.file) return res.status(400).json({ message: "Image required" });

        const token = process.env.LOGMEAL_API_KEY;

        // ── Compress image ──
        compressedPath = req.file.path + "_compressed.jpg";
        await sharp(req.file.path)
            .resize({ width: 800, withoutEnlargement: true })
            .jpeg({ quality: 75 })
            .toFile(compressedPath);
        fs.unlinkSync(req.file.path);

        console.log(`📸 Compressed: ${(fs.statSync(compressedPath).size / 1024).toFixed(1)} KB`);

        // ── STEP 1: Recognize ──
        const imageBuffer = fs.readFileSync(compressedPath);
        const formData    = new FormData();
        formData.append("image", imageBuffer, { filename: "food.jpg", contentType: "image/jpeg" });

        const recognizeRes = await fetch(`${LOGMEAL_BASE}/image/segmentation/complete`, {
            method:  "POST",
            headers: { "Authorization": `Bearer ${token}`, ...formData.getHeaders() },
            body:    formData,
        });

        fs.unlinkSync(compressedPath);
        compressedPath = null;

        if (!recognizeRes.ok) {
            const err = await recognizeRes.json();
            return res.status(500).json({ message: err.message || "Recognition failed" });
        }

        const recognizeData = await recognizeRes.json();
        const imageId       = recognizeData.imageId;
        const foodItems     = recognizeData.segmentation_results || [];

        if (!imageId) return res.status(500).json({ message: "No imageId from LogMeal" });

        const detectedFoods = foodItems
            .flatMap(seg => seg.recognition_results?.map(r => r.name) || [])
            .slice(0, 3);

        console.log("🍽️ Detected:", detectedFoods);

        // ── STEP 2: Nutrition ──
        const nutritionRes = await fetch(`${LOGMEAL_BASE}/nutrition/recipe/nutritionalInfo`, {
            method:  "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body:    JSON.stringify({ imageId }),
        });

        if (!nutritionRes.ok) {
            const err = await nutritionRes.json();
            return res.status(500).json({ message: err.message || "Nutrition fetch failed" });
        }

        const nutritionData = await nutritionRes.json();

        // ✅ Correct field names from totalNutrients
        const t = nutritionData.nutritional_info?.totalNutrients || {};

        const nutrition = {
            foodName:     detectedFoods[0] || "Food Item",
            detectedFoods,
            calories:     Math.round(t.ENERC_KCAL?.quantity || 0),
            protein:      Math.round(t.PROCNT?.quantity     || 0),
            carbs:        Math.round(t.CHOCDF?.quantity     || 0),
            fat:          Math.round(t.FAT?.quantity        || 0),
            fiber:        Math.round(t.FIBTG?.quantity      || 0),
            sugar:        Math.round(t.SUGAR?.quantity      || 0),
            servingSize:  `${nutritionData.serving_size || ""}g`,
            confidence:   detectedFoods.length > 0 ? "high" : "low",
            source:       "LogMeal AI",
        };

        console.log("✅ Nutrition:", nutrition);
        return res.status(200).json({ success: true, nutrition });

    } catch (error) {
        console.error("Scan error:", error.message);
        if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        if (compressedPath && fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
        return res.status(500).json({ message: "Scan failed: " + error.message });
    }
});

export default nutritionRoute;