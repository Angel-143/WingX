import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'owner', 'deliveryBoy'],
        required: true
    },

    // ── OTP / Password Reset Fields ──
    resetPassword: {
        type: String,
        default: undefined
    },
    otpExpiry: {
        type: Date,
        default: undefined
    },
    otpverified: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;