import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    category: {
        type: String,
        enum: [
'starter',
'maincourse',
'dessert',
'beverage',
'snack',
'other',
'breakfast',
'lunch',
'dinner',
'soup',
'salad',
'biryani',
'pizza',
'burger',
'sandwich',
'noodles',
'pasta',
'northindian',
'southindian',
'chinese'
],
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    foodType: {
        type: String,
        enum: ['veg', 'nonveg'],
        required: true
    },
    rating:{
        average:{type:Number,default:0},
        count:{type:Number,default:0}

    },
    isSubscription: { type: Boolean, default: false },
    mealsPerWeek: { type: Number, default: 0 },
    mealsPerMonth: { type: Number, default: 0 },
    validityDays: { type: Number, default: 0 }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

export default Item;