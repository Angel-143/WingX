import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    },
});

export const sendMail = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: to,
        subject: 'Password Reset OTP',
        html: `<p>Your OTP for password reset is: <b>${otp}</b></p><p>This OTP is valid for 10 minutes.</p>`
    });
}