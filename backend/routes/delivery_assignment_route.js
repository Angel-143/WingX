// routes/delivery_assignment_route.js
import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
    getMyAssignments,
    getUnreadCount,
    markNotificationRead,
    acceptAssignment,
    rejectAssignment,
    updateDeliveryStatus,
    manualAssign,
} from "../controllers/delivery_assignment_controller.js";

const deliveryRoute = express.Router();

// ── Delivery Boy ──
deliveryRoute.get("/my-assignments",          isAuth, getMyAssignments);
deliveryRoute.get("/unread-count",             isAuth, getUnreadCount);
deliveryRoute.put("/read/:assignmentId",       isAuth, markNotificationRead);
deliveryRoute.put("/accept/:assignmentId",     isAuth, acceptAssignment);    // ✅ first wins
deliveryRoute.put("/reject/:assignmentId",     isAuth, rejectAssignment);
deliveryRoute.put("/status/:assignmentId",     isAuth, updateDeliveryStatus);

// ── Owner (manual assign) ──
deliveryRoute.post("/manual-assign",           isAuth, manualAssign);

export default deliveryRoute;