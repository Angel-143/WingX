

import express from "express";
import { createShop, editShop, getShops,getMyShop,getShopByCity } from "../controllers/shop_controller.js";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";


const shopRoute = express.Router()
shopRoute.post("/create", isAuth, upload.single("image"), createShop)
shopRoute.put("/edit/:id", isAuth, upload.single("image"), editShop)
shopRoute.get("/all", isAuth, getShops)
shopRoute.get("/my-shop", isAuth, getMyShop);
shopRoute.get("/get-shop-by-city/:city", isAuth, getShopByCity);


export default shopRoute;