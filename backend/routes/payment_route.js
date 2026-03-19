// routes/payment_route.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import isAuth from "../middleware/isAuth.js";

const paymentRoute = express.Router();

// ── 👇 APNI KEYS YAHAN DAALO (.env mein rakho) ──
// .env mein:
//   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
//   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX

const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Step 1: Create Razorpay Order ─────────────────────────────────────────────
// Frontend calls this → gets orderId → opens Razorpay checkout
paymentRoute.post("/create-order", isAuth, async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        if (!amount || amount <= 0)
            return res.status(400).json({ message: "Invalid amount" });

        const options = {
            amount:   Math.round(amount * 100), // Razorpay uses paise
            currency,
            receipt:  receipt || `receipt_${Date.now()}`,
            notes: {
                userId: req.userId,
            },
        };

        const order = await razorpay.orders.create(options);
        console.log(`💳 Razorpay order created: ${order.id} ₹${amount}`);

        return res.status(200).json({
            orderId:  order.id,
            amount:   order.amount,
            currency: order.currency,
            keyId:    process.env.RAZORPAY_KEY_ID, // send to frontend
        });

    } catch (err) {
        console.error("Razorpay create-order error:", err);
        return res.status(500).json({ message: "Payment order creation failed" });
    }
});

// ── Step 2: Verify Payment Signature ─────────────────────────────────────────
// After user pays, frontend sends payment details here to verify
paymentRoute.post("/verify", isAuth, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
            return res.status(400).json({ message: "Missing payment details" });

        // Verify signature — HMAC SHA256
        const body      = razorpay_order_id + "|" + razorpay_payment_id;
        const expected  = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expected !== razorpay_signature) {
            console.error("❌ Payment signature mismatch");
            return res.status(400).json({ message: "Payment verification failed", success: false });
        }

        console.log(`✅ Payment verified: ${razorpay_payment_id}`);
        return res.status(200).json({
            success:   true,
            paymentId: razorpay_payment_id,
            orderId:   razorpay_order_id,
            message:   "Payment verified successfully",
        });

    } catch (err) {
        console.error("Razorpay verify error:", err);
        return res.status(500).json({ message: "Payment verification error" });
    }
});

export default paymentRoute;