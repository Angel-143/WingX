import express from 'express';

import dotenv from 'dotenv';
dotenv.config()
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoute from './routes/auth_route.js';
import userRoute from './routes/user_route.js';
import shopRoute from './routes/shop_route.js';
import itemRoute from './routes/item_route.js';
import orderRoute from './routes/order_route.js';
import deliveryRoute from './routes/delivery_assignment_route.js';
import nutritionRoute from "./routes/nutrition_route.js";
import dietRoute from "./routes/diet_route.js";
import subscriptionRoute from "./routes/subscription_route.js";
import paymentRoute from "./routes/payment_route.js";




import cors from 'cors';


const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
    'http://localhost:5173',  // Development
    'http://localhost:3000',  // Alternative dev port
    process.env.FRONTEND_URL || 'https://wingx-ufzv.onrender.com'  // Production
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("WingX Backend Running 🚀");
});



app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/shop', shopRoute)
app.use('/api/item', itemRoute)
app.use('/api/order', orderRoute)
app.use('/api/delivery', deliveryRoute);
app.use("/api/nutrition", nutritionRoute);
app.use("/api/diet", dietRoute);
app.use("/api/subscription", subscriptionRoute);
app.use("/api/payment", paymentRoute);



app.listen(PORT, () => {
  // Connect to the database
  connectDB()
  console.log(`Server is running on port ${PORT}`);
});


 

