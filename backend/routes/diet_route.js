// routes/diet_route.js
import express from "express";
import isAuth from "../middleware/isAuth.js";
import User from "../models/user_models.js";
import Item from "../models/item_model.js";
import Shop from "../models/shop_model.js";

const dietRoute = express.Router();

// ── Save / Update Diet Plan ──
dietRoute.put("/plan", isAuth, async (req, res) => {
    try {
        const { goal, proteinGoal, carbsGoal, fatGoal, calorieGoal, foodPreference } = req.body;
        await User.findByIdAndUpdate(req.userId, {
            dietPlan: { goal, proteinGoal, carbsGoal, fatGoal, calorieGoal, foodPreference }
        });
        return res.status(200).json({ message: "Diet plan saved" });
    } catch (err) {
        return res.status(500).json({ message: "Error saving diet plan" });
    }
});

// ── Get Diet Plan ──
dietRoute.get("/plan", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("dietPlan foodLog");
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching diet plan" });
    }
});

// ── Add to Food Log (scan se) ──
dietRoute.post("/log", isAuth, async (req, res) => {
    try {
        const { foodName, calories, protein, carbs, fat, fiber, sugar, source } = req.body;
        const logEntry = {
            foodName, calories, protein, carbs, fat, fiber, sugar,
            source: source || "scan",
            loggedAt: new Date(),
        };
        await User.findByIdAndUpdate(req.userId, {
            $push: { foodLog: { $each: [logEntry], $position: 0 } }
        });
        return res.status(201).json({ message: "Food logged", logEntry });
    } catch (err) {
        return res.status(500).json({ message: "Error logging food" });
    }
});

// ── NEW: Log nutrition from order (cart items ka nutrition DB se fetch karke log karo) ──
dietRoute.post("/log/order", isAuth, async (req, res) => {
    try {
        const { cartItems } = req.body;
        // cartItems = [{ id, name, quantity }, ...]

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "No cart items" });
        }

        // Fetch all items from DB in one query
        const itemIds = cartItems.map(i => i.id);
        const dbItems = await Item.find({ _id: { $in: itemIds } }).select("name nutrition");

        // Build a map for quick lookup
        const nutritionMap = {};
        dbItems.forEach(item => {
            nutritionMap[item._id.toString()] = item.nutrition || {};
        });

        // Build log entries — only items that have nutrition data
        const logEntries = [];
        for (const cartItem of cartItems) {
            const nutrition = nutritionMap[cartItem.id];
            if (!nutrition || !nutrition.calories) continue; // skip if no nutrition

            const qty = cartItem.quantity || 1;
            logEntries.push({
                foodName: cartItem.name,
                calories: Math.round((nutrition.calories || 0) * qty),
                protein:  Math.round((nutrition.protein  || 0) * qty),
                carbs:    Math.round((nutrition.carbs    || 0) * qty),
                fat:      Math.round((nutrition.fat      || 0) * qty),
                fiber:    Math.round((nutrition.fiber    || 0) * qty),
                sugar:    Math.round((nutrition.sugar    || 0) * qty),
                source:   "order",
                loggedAt: new Date(),
            });
        }

        if (logEntries.length === 0) {
            console.log("⚠️ No nutrition data found for ordered items");
            return res.status(200).json({ message: "No nutrition data to log", logged: 0 });
        }

        // Push all entries at once
        await User.findByIdAndUpdate(req.userId, {
            $push: { foodLog: { $each: logEntries, $position: 0 } }
        });

        console.log(`✅ Logged nutrition for ${logEntries.length} ordered items`);
        return res.status(201).json({ message: "Order nutrition logged", logged: logEntries.length, logEntries });

    } catch (err) {
        console.error("Order nutrition log error:", err);
        return res.status(500).json({ message: "Error logging order nutrition" });
    }
});

// ── Get Today's Food Log ──
dietRoute.get("/log/today", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("foodLog");
        const today = new Date().toDateString();
        const todayLog = (user?.foodLog || []).filter(
            e => new Date(e.loggedAt).toDateString() === today
        );
        return res.status(200).json(todayLog);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching log" });
    }
});

// ── Delete Log Entry ──
dietRoute.delete("/log/:logId", isAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            $pull: { foodLog: { _id: req.params.logId } }
        });
        return res.status(200).json({ message: "Removed" });
    } catch (err) {
        return res.status(500).json({ message: "Error removing log" });
    }
});

// ── Get Meal Suggestions ──
dietRoute.get("/suggestions", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("dietPlan foodLog");
        const plan = user?.dietPlan;

        if (!plan?.goal) return res.status(200).json([]);

        const today = new Date().toDateString();
        const todayLog = (user?.foodLog || []).filter(
            e => new Date(e.loggedAt).toDateString() === today
        );

        const consumed = {
            calories: todayLog.reduce((t, e) => t + (e.calories || 0), 0),
            protein:  todayLog.reduce((t, e) => t + (e.protein  || 0), 0),
            carbs:    todayLog.reduce((t, e) => t + (e.carbs    || 0), 0),
            fat:      todayLog.reduce((t, e) => t + (e.fat      || 0), 0),
        };

        const remaining = {
            calories: Math.max(0, (plan.calorieGoal || 2000) - consumed.calories),
            protein:  Math.max(0, (plan.proteinGoal  || 50)   - consumed.protein),
            carbs:    Math.max(0, (plan.carbsGoal    || 250)  - consumed.carbs),
            fat:      Math.max(0, (plan.fatGoal      || 65)   - consumed.fat),
        };

        const filter = { "nutrition.calories": { $gt: 0 } };

        if (plan.foodPreference === "veg")    filter.foodType = "veg";
        if (plan.foodPreference === "nonveg") filter.foodType = "nonveg";

        if (remaining.calories > 0) {
            filter["nutrition.calories"] = {
                $gt:  0,
                $lte: remaining.calories + 150,
            };
        }

        if (plan.goal === "muscle_gain" && remaining.protein > 0) {
            filter["nutrition.protein"] = { $gte: Math.min(15, remaining.protein * 0.2) };
        }

        const items = await Item.find(filter)
            .populate("shop", "name image city")
            .limit(10);

        return res.status(200).json({
            suggestions: items,
            remaining,
            consumed,
            goal: plan.goal,
        });

    } catch (err) {
        console.error("Suggestions error:", err);
        return res.status(500).json({ message: "Error fetching suggestions" });
    }
});

export default dietRoute;