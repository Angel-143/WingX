// services/deliveryBroadcastService.js
import { v4 as uuidv4 } from "uuid";
import User from "../models/user_models.js";
import Shop from "../models/shop_model.js";
import DeliveryAssignment from "../models/delivery_assignmnet_order_model.js";
import { isWithin3Km } from "../utils/distanceUtil.js";

export async function broadcastToNearbyRiders(orderId, shopId, deliveryAddress) {
    try {
        console.log("📡 BROADCAST STARTED — orderId:", orderId, "shopId:", shopId);
 
        // ✅ Sabhi delivery boys lo — temporarily 3km check nahi
        const allRiders = await User.find({ role: "deliveryBoy" });
        console.log("🛵 DeliveryBoy users in DB:", allRiders.length);
 
        if (allRiders.length === 0) {
            console.log("❌ No delivery boys found in DB — check role field");
            return;
        }
 
        allRiders.forEach(r => {
            console.log(`   → ${r.fullname || r.email} | role: ${r.role}`);
        });
 
        const broadcastId = uuidv4();
 
        const assignments = allRiders.map(rider => ({
            order:       orderId,
            shop:        shopId,
            deliveryBoy: rider._id,
            broadcastId,
            status:      "pending",
            deliveryAddress,
            notification: {
                sent:    true,
                sentAt:  new Date(),
                message: `🛵 New delivery! Order #${String(orderId).slice(-6).toUpperCase()}`,
                read:    false,
            }
        }));
 
        const created = await DeliveryAssignment.insertMany(assignments);
        console.log(`✅ ${created.length} assignments created!`);
 
        return { broadcastId, riderCount: allRiders.length };
 
    } catch (error) {
        console.error("❌ Broadcast ERROR:", error.message);
        throw error;
    }
}
 
 
export default broadcastToNearbyRiders;