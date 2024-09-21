import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js"

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file
export const uploadToCloudinary = async function (fileLocationPath) {
  if (!fileLocationPath) return null;
  let uploadResponce;

  try {
    uploadResponce = await cloudinary.uploader.upload(fileLocationPath, {
      resource_type: "auto",
    });
  } catch (error) {
    throw new ApiError(500, `CloudinaryServerError : ${error.message || "unable to upload file in cloudinary"}`)
  }
  return uploadResultUrl;
};

// Remove files
export const removeToCloudinary = async function (fileUrl) {
  if(!fileUrl) return null
  try {
    return await cloudinary.uploader.destroy(fileUrl)
  } catch (error) {
    throw new ApiError(500, `CloudinaryServerError : ${error.message || "unable to remove file on cloudinary"}`)
  }
}
