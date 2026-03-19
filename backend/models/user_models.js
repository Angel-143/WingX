import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String },
    phone:    { type: String, required: true },
    role:     { type: String, enum: ["user","owner","deliveryBoy"], required: true },

    // ── Location (delivery boy) ──
    location: {
        latitude:  { type: Number, default: null },
        longitude: { type: Number, default: null },
    },
    isActive: { type: Boolean, default: true },

    // ── OTP / Password Reset ──
    resetPassword: { type: String,  default: undefined },
    otpExpiry:     { type: Date,    default: undefined },
    otpverified:   { type: Boolean, default: false },

    // ── Diet Plan ──
    dietPlan: {
        goal:           { type: String, enum: ["weight_loss","muscle_gain","balanced","custom"], default: "balanced" },
        calorieGoal:    { type: Number, default: 2000 },
        proteinGoal:    { type: Number, default: 50   },
        carbsGoal:      { type: Number, default: 250  },
        fatGoal:        { type: Number, default: 65   },
        foodPreference: { type: String, enum: ["veg","nonveg","mixed"], default: "mixed" },
    },

    // ── Daily Food Log ──
    foodLog: [{
        foodName:  { type: String },
        calories:  { type: Number, default: 0 },
        protein:   { type: Number, default: 0 },
        carbs:     { type: Number, default: 0 },
        fat:       { type: Number, default: 0 },
        fiber:     { type: Number, default: 0 },
        sugar:     { type: Number, default: 0 },
        source:    { type: String, default: "scan" }, // "scan" | "manual" | "order"
        loggedAt:  { type: Date, default: Date.now },
    }],

    // ── Subscriptions ──
    subscriptions: [{
        item:      { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        itemName:  { type: String },
        itemImage: { type: String },
        shop:      { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
        shopName:  { type: String },

        plan:      { type: String, enum: ["weekly", "monthly"], default: "weekly" },
        price:     { type: Number, default: 0 },

        totalMeals: { type: Number, default: 0 },
        mealsUsed:  { type: Number, default: 0 },

        startDate: { type: Date, default: Date.now },
        endDate:   { type: Date },

        // active | paused | cancelled | expired
        status:    { type: String, enum: ["active","paused","cancelled","expired"], default: "active" },

        createdAt: { type: Date, default: Date.now },
    }],

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;