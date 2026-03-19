import Shop from "../models/shop_model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import Item from "../models/item_model.js";

// ── Add Item ──
export const addItem = async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    try {
        const {
            name, category, foodType, price, description,
            // half plate
            hasHalfPlate, halfPrice,
            // subscription
            subscriptionAvailable, weeklyPrice, monthlyPrice,
            mealsPerWeek, mealsPerMonth, validityDays,
            // nutrition
            nutrition,
        } = req.body;

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        if (!image) return res.status(400).json({ message: "Image is required" });

        const shop = await Shop.findOne({ owner: req.userId });
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        // Parse nutrition JSON string
        let parsedNutrition = {};
        if (nutrition) {
            try { parsedNutrition = JSON.parse(nutrition); } catch {}
        }

        const item = await Item.create({
            name,
            category,
            foodType,
            price:       Number(price),
            description: description || "",
            image,
            shop:        shop._id,

            plateOptions: {
                hasHalfPlate: hasHalfPlate === "true",
                halfPrice:    Number(halfPrice) || 0,
            },

            subscription: {
                available:    subscriptionAvailable === "true",
                weeklyPrice:  Number(weeklyPrice)  || 0,
                monthlyPrice: Number(monthlyPrice) || 0,
                mealsPerWeek: Number(mealsPerWeek) || 0,
                mealsPerMonth:Number(mealsPerMonth)|| 0,
                validityDays: Number(validityDays) || 30,
            },

            nutrition: {
                calories:        Number(parsedNutrition.calories) || 0,
                protein:         Number(parsedNutrition.protein)  || 0,
                carbs:           Number(parsedNutrition.carbs)    || 0,
                fat:             Number(parsedNutrition.fat)      || 0,
                fiber:           Number(parsedNutrition.fiber)    || 0,
                sugar:           Number(parsedNutrition.sugar)    || 0,
                isAIGenerated:   parsedNutrition.isAIGenerated   || false,
                verifiedByOwner: true,
            },
        });

        shop.items.push(item._id);
        await shop.save();
        await shop.populate("items owner");

        return res.status(201).json({ message: "Item added successfully", item });

    } catch (error) {
        console.error("Add Item error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── Edit Item ──
export const editItem = async (req, res) => {
    try {
        const {
            name, category, foodType, price, description,
            hasHalfPlate, halfPrice,
            subscriptionAvailable, weeklyPrice, monthlyPrice,
            mealsPerWeek, mealsPerMonth, validityDays,
            nutrition,
        } = req.body;

        const itemId = req.params.id;

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        const item = await Item.findById(itemId).populate("shop");
        if (!item) return res.status(404).json({ message: "Item not found" });
        if (item.shop.owner.toString() !== req.userId)
            return res.status(403).json({ message: "Forbidden" });

        // Basic fields
        item.name        = name        ?? item.name;
        item.category    = category    ?? item.category;
        item.foodType    = foodType    ?? item.foodType;
        item.price       = price       ? Number(price) : item.price;
        item.description = description ?? item.description;
        item.image       = image       ?? item.image;

        // Plate options
        if (hasHalfPlate !== undefined) {
            item.plateOptions.hasHalfPlate = hasHalfPlate === "true";
            item.plateOptions.halfPrice    = Number(halfPrice) || 0;
        }

        // Subscription
        if (subscriptionAvailable !== undefined) {
            item.subscription.available    = subscriptionAvailable === "true";
            item.subscription.weeklyPrice  = Number(weeklyPrice)  || item.subscription.weeklyPrice;
            item.subscription.monthlyPrice = Number(monthlyPrice) || item.subscription.monthlyPrice;
            item.subscription.mealsPerWeek = Number(mealsPerWeek) || item.subscription.mealsPerWeek;
            item.subscription.mealsPerMonth= Number(mealsPerMonth)|| item.subscription.mealsPerMonth;
            item.subscription.validityDays = Number(validityDays) || item.subscription.validityDays;
        }

        // Nutrition
        if (nutrition) {
            try {
                const n = JSON.parse(nutrition);
                item.nutrition.calories        = Number(n.calories) || item.nutrition.calories;
                item.nutrition.protein         = Number(n.protein)  || item.nutrition.protein;
                item.nutrition.carbs           = Number(n.carbs)    || item.nutrition.carbs;
                item.nutrition.fat             = Number(n.fat)      || item.nutrition.fat;
                item.nutrition.fiber           = Number(n.fiber)    || item.nutrition.fiber;
                item.nutrition.sugar           = Number(n.sugar)    || item.nutrition.sugar;
                item.nutrition.isAIGenerated   = n.isAIGenerated   ?? item.nutrition.isAIGenerated;
                item.nutrition.verifiedByOwner = true;
            } catch {}
        }

        await item.save();
        await item.populate("shop");

        return res.status(200).json({ item });

    } catch (error) {
        console.error("Edit Item error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── Get Items ──
export const getItems = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId });
        if (!shop) return res.status(404).json({ message: "Shop not found" });
        const items = await Item.find({ shop: shop._id });
        return res.status(200).json({ items });
    } catch (error) {
        console.error("Get Items error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── Get Subscription Items (backward compat) ──
export const getSubscriptionItems = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId });
        if (!shop) return res.status(404).json({ message: "Shop not found" });
        const items = await Item.find({ shop: shop._id, "subscription.available": true });
        return res.status(200).json({ items });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

// ── Delete Item ──
export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId).populate("shop");
        if (!item) return res.status(404).json({ message: "Item not found" });
        if (item.shop.owner.toString() !== req.userId)
            return res.status(403).json({ message: "Forbidden" });

        await Shop.findByIdAndUpdate(item.shop._id, { $pull: { items: itemId } });
        await Item.findByIdAndDelete(itemId);

        return res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Delete Item error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── Get Items By City ──
export const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items");

        if (!shops || shops.length === 0)
            return res.status(404).json({ message: "No shops found in this city" });

        return res.status(200).json({ shops });
    } catch (error) {
        console.error("Get Items By City error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};




// Search item

export const searchItems = async (req, res) => {
    try {
        const { q, city, foodType, category, maxCal, maxPrice, minProtein } = req.query;

        // ── Build filter ──
        const filter = {};

        if (foodType && foodType !== "all") filter.foodType = foodType;
        if (category && category !== "all") filter.category = category;
        if (maxCal)     filter["nutrition.calories"] = { $lte: Number(maxCal), $gt: 0 };
        if (minProtein) filter["nutrition.protein"]  = { $gte: Number(minProtein) };
        if (maxPrice)   filter.price = { $lte: Number(maxPrice) };

        // ── Smart text search ──
        if (q && q.trim()) {
            const query = q.trim();

            // Split into words — "butter chick" → ["butter", "chick"]
            const words = query.split(/\s+/).filter(w => w.length > 0);

            // Each word ko partial match karo
            const wordPatterns = words.map(w => ({
                $or: [
                    { name:        { $regex: w, $options: "i" } },
                    { description: { $regex: w, $options: "i" } },
                    { category:    { $regex: w, $options: "i" } },
                ]
            }));

            // Full query bhi try karo
            const fullPattern = { $regex: query, $options: "i" };

            filter.$or = [
                // Exact full match (highest priority)
                { name: fullPattern },
                { description: fullPattern },
                // All words match (AND)
                { $and: wordPatterns },
                // Category match
                { category: fullPattern },
            ];
        }

        // ── City filter ──
        if (city) {
            const shops = await Shop.find({
                city: { $regex: new RegExp(city, "i") }
            }).select("_id");
            filter.shop = { $in: shops.map(s => s._id) };
        }

        let items = await Item.find(filter)
            .populate("shop", "name image city")
            .sort({ createdAt: -1 })
            .limit(30);

        // ── Score based sort ──
        // Exact name match pehle aaye
        if (q && q.trim()) {
            const query = q.trim().toLowerCase();
            items = items.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const aExact = aName.startsWith(query) ? 3 : aName.includes(query) ? 2 : 1;
                const bExact = bName.startsWith(query) ? 3 : bName.includes(query) ? 2 : 1;
                return bExact - aExact;
            });
        }

        return res.status(200).json(items);

    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ message: "Search failed" });
    }
};