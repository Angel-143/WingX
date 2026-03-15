import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const cloudinaryConfig = async (file) => {

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {

    const result = await cloudinary.uploader.upload(file);

    // SAFE DELETE
    if (file && fs.existsSync(file)) {
      fs.unlinkSync(file);
    }

    return result.secure_url;

  } catch (error) {

    console.log("Cloudinary upload error:", error);

    if (file && fs.existsSync(file)) {
      fs.unlinkSync(file);
    }

    throw error;
  }
};

export default cloudinaryConfig;