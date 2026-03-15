import express from 'express';

import dotenv from 'dotenv';
dotenv.config()
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoute from './routes/auth_route.js';
import userRoute from './routes/user_route.js';
import shopRoute from './routes/shop_route.js';
import itemRoute from './routes/item_route.js';

import cors from 'cors';


const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, 
}))
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/shop', shopRoute)
app.use('/api/item', itemRoute)




app.listen(PORT, () => {
  // Connect to the database
  connectDB()
  console.log(`Server is running on port ${PORT}`);
});


 

