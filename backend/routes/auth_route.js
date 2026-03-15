import express from 'express';

import { signUp, signIn, signOut, forgotPassword, verifyOtp, resetPassword, googleAuth, checkGoogleUser } from '../controllers/auth_controller.js';
// import { verify } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
const { verify }=jwt;




const authRoute = express.Router()

authRoute.post('/signup', signUp)
authRoute.post('/signin', signIn)
authRoute.get('/signout', signOut)
authRoute.post('/forgot-password', forgotPassword)
authRoute.post('/verify-otp', verifyOtp)
authRoute.post('/reset-password', resetPassword)
authRoute.post('/google-auth', googleAuth)
authRoute.post('/check-google-user', checkGoogleUser)
authRoute.post('/google/check', checkGoogleUser);


 

export default authRoute;