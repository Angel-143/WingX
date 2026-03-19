import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
    placeOrder,
    getMyOrders,
    getOwnerOrders,
    updateOrderStatus
} from "../controllers/order_controller.js";

const orderRoute = express.Router();

orderRoute.post("/place-order", isAuth, placeOrder);       // ✅ user order place karo
orderRoute.get("/my-orders", isAuth, getMyOrders);         // ✅ user ke orders
orderRoute.get("/owner-orders", isAuth, getOwnerOrders);   // ✅ owner ke incoming orders
orderRoute.put("/status/:orderId", isAuth, updateOrderStatus); // ✅ status update

export default orderRoute;