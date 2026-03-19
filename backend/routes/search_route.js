// routes/search_route.js
import express from "express";
import isAuth from "../middleware/isAuth.js";
import Item from "../models/item_model.js";
import Shop from "../models/shop_model.js";
import User from "../models/user_models.js";

const searchRoute = express.Router();

// GET /api/search?q=biryani&city=...&foodType=veg&category=biryani&minCal=0&maxCal=500&minPrice=0&maxPrice=500&goalMatch=true
searchRoute.get("/", isAuth, async (req, res) => {
    try {
        const { q, city, foodType, category, minCal, maxCal, minPrice, maxPrice, goalMatch } = req.query;

        const itemFilter = {};

        if (q) {
            itemFilter.$or = [
                { name:        { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
            ];
        }

        if (foodType && foodType !== "all") itemFilter.foodType = foodType;
        if (category  && category  !== "all") itemFilter.category = category;

        if (minCal || maxCal) {
            itemFilter["nutrition.calories"] = {};
            if (minCal) itemFilter["nutrition.calories"].$gte = Number(minCal);
            if (maxCal) itemFilter["nutrition.calories"].$lte = Number(maxCal);
        }

        if (minPrice || maxPrice) {
            itemFilter.price = {};
            if (minPrice) itemFilter.price.$gte = Number(minPrice);
            if (maxPrice) itemFilter.price.$lte = Number(maxPrice);
        }

        if (city) {
            const shops = await Shop.find({ city: { $regex: city, $options: "i" } }).select("_id");
            itemFilter.shop = { $in: shops.map(s => s._id) };
        }

        const items = await Item.find(itemFilter)
            .populate("shop", "name image city address")
            .limit(30)
            .sort({ "rating.average": -1 });

        // Goal match
        let userGoals = null;
        if (goalMatch === "true") {
            const user = await User.findById(req.userId).select("dietPlan foodLog");
            const plan = user?.dietPlan;
            if (plan) {
                const today    = new Date().toDateString();
                const todayLog = (user?.foodLog || []).filter(e => new Date(e.loggedAt).toDateString() === today);
                const consumed = {
                    calories: todayLog.reduce((t, e) => t + (e.calories || 0), 0),
                    protein:  todayLog.reduce((t, e) => t + (e.protein  || 0), 0),
                    carbs:    todayLog.reduce((t, e) => t + (e.carbs    || 0), 0),
                    fat:      todayLog.reduce((t, e) => t + (e.fat      || 0), 0),
                };
                userGoals = {
                    remainingCal:     Math.max(0, (plan.calorieGoal || 2000) - consumed.calories),
                    remainingProtein: Math.max(0, (plan.proteinGoal || 50)   - consumed.protein),
                    remainingCarbs:   Math.max(0, (plan.carbsGoal   || 250)  - consumed.carbs),
                    remainingFat:     Math.max(0, (plan.fatGoal     || 65)   - consumed.fat),
                    foodPreference:   plan.foodPreference,
                };
            }
        }

        const itemsWithMatch = items.map(item => {
            const obj = item.toObject();
            if (userGoals) {
                const cal  = item.nutrition?.calories || 0;
                const prot = item.nutrition?.protein  || 0;
                const fits = cal > 0 && cal <= userGoals.remainingCal;
                const highProt = prot >= 15 && prot <= userGoals.remainingProtein + 20;
                obj.goalMatch = fits ? (highProt ? "perfect" : "fits") : cal === 0 ? null : "over";
            }
            return obj;
        });

        // Shop search
        let shops = [];
        if (q) {
            shops = await Shop.find({
                name: { $regex: q, $options: "i" },
                ...(city ? { city: { $regex: city, $options: "i" } } : {}),
            }).limit(5);
        }

        return res.status(200).json({ items: itemsWithMatch, shops, userGoals, total: itemsWithMatch.length });

    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ message: "Search failed" });
    }
});

export default searchRoute;