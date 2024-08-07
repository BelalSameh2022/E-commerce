import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dzmzbdrnl",
  api_key: "462131333776329",
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});

export default cloudinary;
