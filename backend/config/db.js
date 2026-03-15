import mongoose from 'mongoose';                                

const connectDB =async () => {
  // Database connection logic will go here
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.log('MongoDB connection failed:', error)
    
  }                                                                         
}


export default connectDB;