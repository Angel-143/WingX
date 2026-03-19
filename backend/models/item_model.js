import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    image:       { type: String, required: true },
    description: { type: String, default: "" },
    shop:        { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },

    category: {
        type: String,
        enum: ["starter","maincourse","dessert","beverage","snack","other","breakfast",
               "lunch","dinner","soup","salad","biryani","pizza","burger","sandwich",
               "noodles","pasta","northindian","southindian","chinese"],
        required: true
    },

    foodType: { type: String, enum: ["veg","nonveg"], required: true },

    // ── PRICING ──
    price: { type: Number, min: 0, required: true }, // full plate / normal price

    // ── HALF PLATE ──
    plateOptions: {
        hasHalfPlate: { type: Boolean, default: false },
        halfPrice:    { type: Number, default: 0 },
    },

    // ── SUBSCRIPTION (optional — same item) ──
    subscription: {
        available:    { type: Boolean, default: false },
        weeklyPrice:  { type: Number, default: 0 },
        monthlyPrice: { type: Number, default: 0 },
        mealsPerWeek: { type: Number, default: 0 },
        mealsPerMonth:{ type: Number, default: 0 },
        validityDays: { type: Number, default: 30 },
    },

    // ── NUTRITION ──
    nutrition: {
        calories:        { type: Number, default: 0 },
        protein:         { type: Number, default: 0 },
        carbs:           { type: Number, default: 0 },
        fat:             { type: Number, default: 0 },
        fiber:           { type: Number, default: 0 },
        sugar:           { type: Number, default: 0 },
        isAIGenerated:   { type: Boolean, default: false },
        verifiedByOwner: { type: Boolean, default: false },
    },

    // ── RATINGS ──
    rating: {
        average: { type: Number, default: 0 },
        count:   { type: Number, default: 0 },
    },

}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
export default Item;