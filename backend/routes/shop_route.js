import express from "express";
import { createShop, editShop, getShops, getMyShop, getShopByCity } from "../controllers/shop_controller.js";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";
import Shop from "../models/shop_model.js";

const shopRoute = express.Router();

shopRoute.post("/create",                    isAuth, upload.single("image"), createShop);
shopRoute.put("/edit/:id",                   isAuth, upload.single("image"), editShop);
shopRoute.get("/all",                        isAuth, getShops);
shopRoute.get("/my-shop",                    isAuth, getMyShop);
shopRoute.get("/get-shop-by-city/:city",     isAuth, getShopByCity);

// ✅ Single shop by ID — items populate ke saath
// ⚠️ Yeh NICHE hona chahiye — warna "my-shop" bhi match ho jaata
shopRoute.get("/:shopId", isAuth, async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.shopId).populate("items");
        if (!shop) return res.status(404).json({ message: "Shop not found" });
        return res.status(200).json(shop);
    } catch (err) {
        console.error("Get shop error:", err);
        return res.status(500).json({ message: "Error fetching shop" });
    }
});

export default shopRoute;