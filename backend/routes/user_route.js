import express from 'express';
import { getCurrentUser } from '../controllers/user_controller.js';
import  isAuth  from '../middleware/isAuth.js';

const userRoute = express.Router()

userRoute.get('/current',isAuth, getCurrentUser)

export default userRoute;