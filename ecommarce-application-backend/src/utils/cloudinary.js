import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // node.js file system module --> for unlink file
import ApiError from "./apiError.js";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
});

// Upload
export const uploadFileToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary
    let responce;
    try {
      responce = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
    } catch (error) {
      fs.unlinkSync(localFilePath);
      throw new ApiError(
        500,
        `cloudinaryError : ${error.message || "Unable to upload file"}`
      );
    }
    fs.unlinkSync(localFilePath);
    if (!responce) {
      throw new ApiError(500, "cloudinaryError : received responce is blank");
    }
    // file unlink from sever after upload on cloudinary
    return responce; // return responce for uses
  } catch (error) {
    // file unlink from sever if face any error to upload cloudinary
    fs.unlinkSync(localFilePath);
    throw new ApiError(
      500,
      `CloudinaryError : ${error.message || "Unable to upload file on cloudinary"} `
    );
  }
};

// remove file
export const RemoveFileFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new ApiError(404, "DataError : fileUrl not received");
    }
    // upload file on cloudinary
    let responce;
    try {
      responce = await cloudinary.uploader.destroy(fileUrl);
    } catch (error) {
      throw new ApiError(
        500,
        `cloudinaryError : ${error.message || "Unable to remove file from cloudinary"}`
      );
    }
    return responce; // return responce for uses
  } catch (error) {
    // file unlink from sever if face any error to upload cloudinary
    throw new ApiError(
      500,
      `cloudinaryError : ${error.message || "Unable to remove file"}`
    );
  }
};
