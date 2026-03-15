import bcrypt from 'bcryptjs'
import User from '../models/user_models.js'
import genToken from '../utils/token.js'
import { sendMail } from '../utils/mail.js'


// ─────────────────────────────────────────
//  SIGN UP
// ─────────────────────────────────────────
export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, phone, role } = req.body

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' })
        }

        // Validate phone number
        if (phone.length < 10) {
            return res.status(400).json({ message: 'Invalid phone number' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const newUser = await User.create({
            fullname: fullName,
            email,
            password: hashedPassword,
            phone,
            role
        })

        // Generate token
        const token = await genToken(newUser._id)

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                role: newUser.role
            }
        })
    } catch (error) {
        console.error('SignUp error:', error)
        res.status(500).json({ message: 'SignUp error', error: error.message })
    }
}


// ─────────────────────────────────────────
//  SIGN IN
// ─────────────────────────────────────────
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Wrong password' })
        }

        // Generate token
        const token = await genToken(user._id)

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error('SignIn error:', error)
        res.status(500).json({ message: 'SignIn error', error: error.message })
    }
}


// ─────────────────────────────────────────
//  SIGN OUT
// ─────────────────────────────────────────
export const signOut = async (req, res) => {
    try {
        res.clearCookie('token')
        res.status(200).json({ message: 'User signed out successfully' })
    } catch (error) {
        console.error('SignOut error:', error)
        res.status(500).json({ message: 'SignOut error', error: error.message })
    }
}


// ─────────────────────────────────────────
//  FORGOT PASSWORD  →  Send OTP
// ─────────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // FIX: Save OTP and expiry directly on user (not as local variable)
        user.resetPassword = otp
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        user.otpverified = false

        await user.save()
        await sendMail(email, otp)

        res.status(200).json({ message: 'OTP sent to email' })
    } catch (error) {
        console.error('ForgotPassword error:', error)
        res.status(500).json({ message: 'ForgotPassword error', error: error.message })
    }
}


// ─────────────────────────────────────────
//  VERIFY OTP
// ─────────────────────────────────────────
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' })
        }

        // Check OTP match
        if (user.resetPassword !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' })
        }

        // FIX: consistent field name otpExpiry (capital E)
        if (!user.otpExpiry || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' })
        }

        // Mark OTP as verified and clear OTP fields
        user.otpverified = true
        user.resetPassword = undefined
        user.otpExpiry = undefined   // FIX: was otpexpiry (lowercase)

        await user.save()

        return res.status(200).json({ message: 'OTP verified successfully' })
    } catch (error) {
        console.error('VerifyOtp error:', error)
        res.status(500).json({ message: 'VerifyOtp error', error: error.message })
    }
}


// ─────────────────────────────────────────
//  RESET PASSWORD
// ─────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' })
        }

        // Must have verified OTP first
        if (!user.otpverified) {
            return res.status(400).json({ message: 'OTP not verified' })
        }

        // Validate new password
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' })
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.otpverified = false

        await user.save()

        return res.status(200).json({ message: 'Password reset successfully' })
    } catch (error) {
        console.error('ResetPassword error:', error)
        res.status(500).json({ message: 'ResetPassword error', error: error.message })
    }
}





// ─────────────────────────────────────────
//  GOOGLE AUTH  (Sign Up + Sign In combined)
//  POST /api/auth/google
// ─────────────────────────────────────────
export const googleAuth = async (req, res) => {
    try {
        const { name, email, phone, role } = req.body  // ✅ phone add kiya

        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }

        let user = await User.findOne({ email })

        if (user) {
            // ── Existing user → just sign in ──
            const token = await genToken(user._id)
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    role: user.role,
                }
            })
        }

        // ── New user → create account ──
        if (!role) {
            return res.status(400).json({ message: 'Role is required for new users' })
        }
        
        // ✅ Phone validation for new users
        if (!phone || phone.length < 10) {
            return res.status(400).json({ message: 'Valid phone number is required' })
        }

        user = await User.create({
            fullname: name || 'Google User',
            email,
            phone: phone,  // ✅ Frontend se aaya hua phone number
            role,
        })

        const token = await genToken(user._id)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
            }
        })
    } catch (error) {
        console.error('Google Auth error:', error)
        res.status(500).json({ message: 'Google Auth error', error: error.message })
    }
}


// ─────────────────────────────────────────
//  CHECK IF GOOGLE USER EXISTS
//  POST /api/auth/google/check
// ─────────────────────────────────────────
export const checkGoogleUser = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        res.status(200).json({ exists: !!user })
    } catch (error) {
        console.error('CheckGoogleUser error:', error)
        res.status(500).json({ message: 'Check error', error: error.message })
    }
}