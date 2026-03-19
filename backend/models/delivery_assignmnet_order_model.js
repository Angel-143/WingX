// models/delivery_assignment_model.js
import mongoose from "mongoose";

const deliveryAssignmentSchema = new mongoose.Schema({

    order:      { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    shop:       { type: mongoose.Schema.Types.ObjectId, ref: "Shop",  required: true },
    deliveryBoy:{ type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"  }, // null = auto-assigned

    // ── Broadcast group ID — ek hi order ke liye sabko ek groupId ──
    broadcastId: { type: String, default: null },

    status: {
        type: String,
        enum: ["pending","accepted","rejected","expired","picked_up","delivered","cancelled"],
        default: "pending"
    },

    deliveryAddress: { text: String, latitude: Number, longitude: Number },

    notification: {
        sent:    { type: Boolean, default: false },
        sentAt:  Date,
        message: { type: String, default: "" },
        read:    { type: Boolean, default: false },
        readAt:  Date,
    },

    note:        String,
    assignedAt:  { type: Date, default: Date.now },
    acceptedAt:  Date,
    pickedUpAt:  Date,
    deliveredAt: Date,

}, { timestamps: true });

const DeliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);
export default DeliveryAssignment;