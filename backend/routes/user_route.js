import express from 'express';
import { getCurrentUser } from '../controllers/user_controller.js';
import isAuth from '../middleware/isAuth.js';
import User from '../models/user_models.js'; // ✅ yeh missing tha

const userRoute = express.Router();

userRoute.get('/current', isAuth, getCurrentUser);

// ✅ Delivery boy location update
userRoute.put("/update-location", isAuth, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        await User.findByIdAndUpdate(req.userId, {
            location: { latitude, longitude },
            isActive: true
        });
        res.json({ success: true });
    } catch (err) {
        console.error("Location update error:", err);
        res.status(500).json({ message: "Error updating location" });
    }
});

export default userRoute;