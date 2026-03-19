import DeliveryAssignment from "../models/delivery_assignmnet_order_model.js"; // ✅ typo fix
import Order from "../models/order_model.js";
import Shop from "../models/shop_model.js";

// ── DeliveryBoy: Apne assignments dekho ──
export const getMyAssignments = async (req, res) => {
    try {
        const assignments = await DeliveryAssignment.find({
            deliveryBoy: req.userId,
            status: { $nin: ["expired"] }
        })
        .populate({
            path: "order",
            select: "totalAmount paymentMethod deliveryAddress createdAt shopOrders",
            populate: {
                path: "shopOrders.shop",
                select: "name image city"
            }
        })
        .populate("shop", "name image city address location")
        .populate("assignedBy", "fullname phone")
        .sort({ createdAt: -1 });
 
        console.log("📦 Assignments fetched:", assignments.length);
        assignments.forEach(a => {
            console.log(`  → status: ${a.status} | order: ${a.order?._id} | shop: ${a.shop?.name}`);
        });
 
        return res.status(200).json(assignments);
    } catch (error) {
        console.error("getMyAssignments error:", error);
        return res.status(500).json({ message: "Error fetching assignments" });
    }
};
 
// ── DeliveryBoy: Unread count ──
export const getUnreadCount = async (req, res) => {
    try {
        const count = await DeliveryAssignment.countDocuments({
            deliveryBoy: req.userId,
            "notification.read": false,
            status: "pending"
        });
        return res.status(200).json({ count });
    } catch {
        return res.status(500).json({ message: "Error" });
    }
};
 
// ── DeliveryBoy: Read mark karo ──
export const markNotificationRead = async (req, res) => {
    try {
        await DeliveryAssignment.findOneAndUpdate(
            { _id: req.params.assignmentId, deliveryBoy: req.userId },
            { "notification.read": true, "notification.readAt": new Date() },
            { new: true }
        );
        return res.status(200).json({ success: true });
    } catch {
        return res.status(500).json({ message: "Error" });
    }
};
 
// ── DeliveryBoy: Accept — First wins ──
export const acceptAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        console.log("✅ Accept request — assignmentId:", assignmentId, "userId:", req.userId);
 
        const assignment = await DeliveryAssignment.findOne({
            _id: assignmentId,
            deliveryBoy: req.userId,
            status: "pending"
        });
 
        console.log("📦 Assignment found:", assignment ? assignment._id : "NOT FOUND");
 
        if (!assignment) {
            return res.status(400).json({ message: "Order already taken or not found" });
        }
 
        assignment.status              = "accepted";
        assignment.acceptedAt          = new Date();
        assignment.notification.read   = true;
        assignment.notification.readAt = new Date();
        await assignment.save();
 
        console.log("✅ Assignment accepted:", assignment._id);
 
        // Same broadcastId ke baaki expire karo
        if (assignment.broadcastId) {
            await DeliveryAssignment.updateMany(
                {
                    broadcastId: assignment.broadcastId,
                    _id: { $ne: assignmentId },
                    status: "pending"
                },
                { status: "expired", "notification.read": true }
            );
        }
 
        // ✅ Populated data ke saath return karo
        const populated = await DeliveryAssignment.findById(assignment._id)
            .populate("order", "totalAmount paymentMethod deliveryAddress createdAt")
            .populate("shop", "name image city address");
 
        return res.status(200).json({ message: "Order accepted!", assignment: populated });
 
    } catch (error) {
        console.error("acceptAssignment error:", error);
        return res.status(500).json({ message: "Error accepting assignment" });
    }
};
 
// ── DeliveryBoy: Reject ──
export const rejectAssignment = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOneAndUpdate(
            { _id: req.params.assignmentId, deliveryBoy: req.userId, status: "pending" },
            { status: "rejected", "notification.read": true },
            { new: true }
        );
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });
        return res.status(200).json({ message: "Rejected", assignment });
    } catch {
        return res.status(500).json({ message: "Error" });
    }
};
 
// ── DeliveryBoy: Status update ──
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updateData = { status };
        if (status === "picked_up") updateData.pickedUpAt  = new Date();
        if (status === "delivered") updateData.deliveredAt = new Date();
 
        const assignment = await DeliveryAssignment.findOneAndUpdate(
            { _id: req.params.assignmentId, deliveryBoy: req.userId },
            updateData,
            { new: true }
        );
        if (!assignment) return res.status(404).json({ message: "Not found" });
 
        if (status === "delivered") {
            await Order.findOneAndUpdate(
                { _id: assignment.order, "shopOrders.shop": assignment.shop },
                { $set: { "shopOrders.$.status": "delivered" } }
            );
        }
        return res.status(200).json(assignment);
    } catch {
        return res.status(500).json({ message: "Error updating status" });
    }
};
 
// ── Owner: Manual assign ──
export const manualAssign = async (req, res) => {
    try {
        const { orderId, shopId, deliveryBoyId, note } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
 
        const assignment = await DeliveryAssignment.create({
            order: orderId, shop: shopId,
            deliveryBoy: deliveryBoyId, assignedBy: req.userId,
            status: "pending",
            deliveryAddress: order.deliveryAddress,
            note: note || "",
            notification: {
                sent: true, sentAt: new Date(),
                message: `New delivery assigned! Order #${orderId.slice(-6).toUpperCase()}`,
                read: false,
            }
        });
        return res.status(201).json({ message: "Assigned", assignment });
    } catch {
        return res.status(500).json({ message: "Error assigning" });
    }
};