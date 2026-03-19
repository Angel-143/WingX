// routes/subscription_route.js
import express from "express";
import isAuth from "../middleware/isAuth.js";
import User from "../models/user_models.js";
import Item from "../models/item_model.js";

const subscriptionRoute = express.Router();

// ── Subscribe to an item ──────────────────────────────────────────────────────
subscriptionRoute.post("/subscribe", isAuth, async (req, res) => {
    try {
        const { itemId, plan } = req.body; // plan: "weekly" | "monthly"

        const item = await Item.findById(itemId).populate("shop", "name image");
        if (!item) return res.status(404).json({ message: "Item not found" });
        if (!item.subscription?.available) return res.status(400).json({ message: "Subscription not available for this item" });

        const sub = item.subscription;
        const isWeekly    = plan === "weekly";
        const price       = isWeekly ? sub.weeklyPrice  : sub.monthlyPrice;
        const totalMeals  = isWeekly ? sub.mealsPerWeek : sub.mealsPerMonth;
        const validityDays = isWeekly ? 7 : (sub.validityDays || 30);

        const startDate = new Date();
        const endDate   = new Date(startDate);
        endDate.setDate(endDate.getDate() + validityDays);

        const newSub = {
            item:          item._id,
            itemName:      item.name,
            itemImage:     item.image,
            shop:          item.shop?._id || item.shop,
            shopName:      item.shop?.name || "",
            plan,
            price,
            totalMeals,
            mealsUsed:     0,
            startDate,
            endDate,
            status:        "active",   // active | paused | cancelled
            createdAt:     new Date(),
        };

        await User.findByIdAndUpdate(req.userId, {
            $push: { subscriptions: newSub }
        });

        console.log(`✅ Subscription created: ${item.name} (${plan}) for user ${req.userId}`);
        return res.status(201).json({ message: "Subscribed successfully!", subscription: newSub });

    } catch (err) {
        console.error("Subscribe error:", err);
        return res.status(500).json({ message: "Error creating subscription" });
    }
});

// ── Get all subscriptions for user ───────────────────────────────────────────
subscriptionRoute.get("/my", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("subscriptions");
        const subs = user?.subscriptions || [];

        // Auto-expire check — mark expired ones
        const now = new Date();
        const updated = subs.map(s => {
            if (s.status === "active" && new Date(s.endDate) < now) {
                s.status = "expired";
            }
            return s;
        });

        return res.status(200).json(updated);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching subscriptions" });
    }
});

// ── Pause subscription ────────────────────────────────────────────────────────
subscriptionRoute.patch("/:subId/pause", isAuth, async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.userId, "subscriptions._id": req.params.subId },
            { $set: { "subscriptions.$.status": "paused" } }
        );
        return res.status(200).json({ message: "Subscription paused" });
    } catch (err) {
        return res.status(500).json({ message: "Error pausing subscription" });
    }
});

// ── Resume subscription ───────────────────────────────────────────────────────
subscriptionRoute.patch("/:subId/resume", isAuth, async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.userId, "subscriptions._id": req.params.subId },
            { $set: { "subscriptions.$.status": "active" } }
        );
        return res.status(200).json({ message: "Subscription resumed" });
    } catch (err) {
        return res.status(500).json({ message: "Error resuming subscription" });
    }
});

// ── Cancel subscription ───────────────────────────────────────────────────────
subscriptionRoute.patch("/:subId/cancel", isAuth, async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.userId, "subscriptions._id": req.params.subId },
            { $set: { "subscriptions.$.status": "cancelled" } }
        );
        return res.status(200).json({ message: "Subscription cancelled" });
    } catch (err) {
        return res.status(500).json({ message: "Error cancelling subscription" });
    }
});

// ── Use a meal (called when order is delivered) ───────────────────────────────
subscriptionRoute.patch("/:subId/use-meal", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("subscriptions");
        const sub  = user?.subscriptions?.id(req.params.subId);
        if (!sub) return res.status(404).json({ message: "Subscription not found" });

        if (sub.mealsUsed >= sub.totalMeals) {
            return res.status(400).json({ message: "No meals remaining" });
        }

        sub.mealsUsed += 1;
        if (sub.mealsUsed >= sub.totalMeals) sub.status = "expired";

        await user.save();
        return res.status(200).json({ message: "Meal used", mealsRemaining: sub.totalMeals - sub.mealsUsed });
    } catch (err) {
        return res.status(500).json({ message: "Error using meal" });
    }
});

export default subscriptionRoute;