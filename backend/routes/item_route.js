import express from "express";
import { addItem, editItem, getItems,deleteItem, getSubscriptionItems,getItemByCity,searchItems } from "../controllers/item_controller.js";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";


const itemRoute = express.Router()

itemRoute.post("/add-item", isAuth, upload.single("image"), addItem)
itemRoute.put("/edit/:id", isAuth, upload.single("image"), editItem)
itemRoute.get("/all", isAuth, getItems)
itemRoute.get("/subscriptions", isAuth, getSubscriptionItems)
itemRoute.delete("/delete/:id", isAuth, deleteItem)
itemRoute.get("/get-item-by-city/:city", isAuth,getItemByCity )
itemRoute.get("/search",isAuth, searchItems);


export default itemRoute;