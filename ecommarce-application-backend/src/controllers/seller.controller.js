/**
 * Seller Controllers
 * - register Seller
 * - login Seller
 * - login seller with email
 * - logout Seller
 * - update Seller
 * - set Avatar
 * - remove Avatar
 * - change Seller Password
 * - reset Seller Password
 * - delete Seller
 * - Add new Address
 * - remove address
 */

import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Seller from "../models/sellers/seller.models.js";
import accessAndRefreshTokenGenrator from "../utils/accessRefreshTokenGenrator.js";
import { uploadFileToCloudinary, RemoveFileFromCloudinary } from "../utils/cloudinary.js";
import {AccessTokenCookieOption, RefreshTokenCookieOption} from "../constants.js"
import {isSpace} from "../utils/customMethods.js"


export const sellerRegister = asyncHandler(async (req, res) => {
  // Validate data: Check if all required fields are provided
  const { username, fullName, email, password } = req.body;
  if (
    [username, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are necessary");
  }

  // Check if the user already exists
  if (await Seller.findOne({ username })) {
    throw new ApiError(400, "User already exists");
  }

  // Create a new seller
  const newSeller = await Seller.create({
    username,
    fullName,
    email,
    password,
  });

  // Retrieve the newly created seller (excluding sensitive fields)
  const newCreatedSeller = await Seller.findById(newSeller._id).select(
    "-password -_id -__v"
  );

  // Handle errors if seller creation fails
  if (!newCreatedSeller) {
    throw new ApiError(500, "Unfortunately, seller was not created");
  }

  // Return success response
  return res
    .status(201)
    .json(
      new ApiResponse(200, newCreatedSeller, "Seller created successfully")
    );
});

export const sellerLogin = asyncHandler(async (req, res) => {
  // Retrieve data from the request body
  const { username, password, saveInfo } = req.body;

  // Check if any required fields are empty
  if (
    [username, password, saveInfo].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Find the seller by username
  const searchSeller = await Seller.findOne({ username });

  if (!searchSeller) {
    throw new ApiError(409, "Seller does not exist");
  }

  // Verify the password
  if (!(await searchSeller.isPasswordCorrect(password))) {
    throw new ApiError(400, "Incorrect password");
  }

  if (saveInfo) {
    // Generate access and refresh tokens
    const { refreshToken, accessToken } =
      await accessAndRefreshTokenGenerator(searchSeller);

    // Update seller details (last login and refresh token)
    const sellerDetails = await Seller.findByIdAndUpdate(
      searchSeller._id,
      {
        $set: {
          lastLogin: Date.now(),
          refreshToken: refreshToken,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    // Configure options for cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    console.log("Status: 200 - Login successful");

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, sellerDetails, "Login successful"));
  } else {
    // Generate an access token (without saving refresh token)
    const accessToken = await searchSeller.generateAccessToken();

    // Update seller details (last login and clear refresh token)
    const sellerDetails = await Seller.findByIdAndUpdate(
      searchSeller._id,
      {
        $set: {
          lastLogin: Date.now(),
          refreshToken: null,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    // Configure options for cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    console.log("Status: 200 - Login successful");

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, sellerDetails, "Login successful"));
  }
});

export const logOutUser = asyncHandler(async (req, res) => {
  // Check if the user is logged in (verified by auth middleware)
  // Retrieve the user ID from the middleware
  // Invalidate the user's refresh token in the database
  // Remove all cookies related to authentication

  // Check if req.userId is available (user is authenticated)
  if (!req.userId) {
    throw new ApiError(500, "Authentication middleware did not work properly");
  }

  try {
    // Invalidate the user's refresh token by setting it to null
    await User.findByIdAndUpdate(req.userId, {
      $set: {
        refreshToken: null,
      },
    }).select("-password"); // Exclude the password field from the response
  } catch (error) {
    throw ApiError(
      500,
      error?.message || "Server failed to connect to the database"
    );
  }

  // Configure options for clearing cookies
  const options = {
    httpOnly: true,
    secure: true, // Set to true if using HTTPS
  };

  // Clear the access token and refresh token cookies
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const setAvtar = asyncHandler(async (req, res) => {
  // Retrieve user data using req.userId
  // Retrieve file server path using multer middleware
  // Upload the file to Cloudinary and save the URL on the user's profile

  // Check if req.userId is available
  if (!req.userId) {
    throw new ApiError(500, "Seller ID not received");
  }

  // Check if a file was received
  if (!req.file) {
    throw new ApiError(400, "File not received");
  }

  // Get the local path of the uploaded avatar
  const localAvatarPath = req.file?.path;

  if (!localAvatarPath) {
    throw new ApiError(404, "File path not found");
  }

  // Upload the avatar to Cloudinary
  const response = await uploadFileToCloudinary(localAvatarPath);

  if (!response) {
    throw new ApiError(500, "Unfortunately, file upload failed");
  }

  // Retrieve seller data (excluding password and refreshToken)
  const sellerData = await Seller.findById(req.userId).select(
    "-password -refreshToken"
  );

  if (!sellerData) {
    throw new ApiError(409, "Invalid seller ID");
  }

  // If the seller already has an avatar, delete the old one from Cloudinary
  if (sellerData.avatar) {
    try {
      await RemoveFileToCloudinary(sellerData.avatar);
    } catch (error) {
      throw new ApiError(500, "Failed to delete seller avatar");
    }
  }

  // Update the seller's avatar URL in the database
  try {
    await Seller.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          avatar: response.url,
        },
      },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, error?.message || "Avatar update failed");
  }

  // Retrieve the updated user avatar
  const userAvatar = await Seller.findById(req.userId).select(
    "-password -refreshToken"
  );

  return res.status(200).json(new ApiResponse(200, { userAvatar }, ""));
});

export const updateSellerData = asyncHandler(async (req, res) => {
  // seller Id
  // seller new data -> email, fullName
  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(400, "Seller not Authenticate");
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No data received");
  }

  // Destructure email and fullName from request body
  const [email, fullName] = req.body;

  // Validate that email and fullName are provided and not empty
  if ([email, fullName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "These fields are required");
  }

  try {
    // Update seller data by ID and return the updated document
    const updatedSeller = await Seller.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          email,
          fullName,
        },
      },
      { new: true }
    ).select("-password -refreshToken");
  } catch (error) {
    throw new ApiError(500, "Seller data not updated");
  }

  // Check if seller data was not updated in the database
  if (!updatedSeller) {
    throw new ApiError(500, "Seller data not updated in Database");
  }

  // Return success response with updated seller data
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedSeller, "Seller data updated successfully")
    );
});

export const updateSellerPassword = asyncHandler(async (req, res) => {
  // seller, sellerId (authentication not required)
  // match seller details
  // old password
  // match password
  // set new password
  // return data

  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No any Data received");
  }

  // Destructure sellerId, oldPassword, and newPassword from request body
  const [sellerId, oldPassword, newPassword] = req.body;

  // Validate that all fields are provided and not empty
  if (
    [sellerId, oldPassword, newPassword].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields is required");
  }

  // Find seller by ID and exclude refreshToken from the result
  const sellerData = await Seller.findById({ _id: sellerId }).select(
    "-refreshToken"
  );

  // Check if seller data exists
  if (!sellerData) {
    throw new ApiError(409, "Invalid sellerId Or SellerId Not Exits");
  }

  try {
    // Check if the old password is correct
    const checkOldPassword = await sellerData.isPasswordCorrect(oldPassword);
  } catch (error) {
    throw new ApiError(500, "Password checking failed");
  }
  if (!checkOldPassword) {
    throw new ApiError(409, "Incorrect Old password");
  }

  try {
    // Set new password and save seller data
    sellerData.password = newPassword;
    sellerData.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to Update new password");
  }

  // Return success response
  return res.status(200).json(200, {}, "Password updated successfully");
});

export const changePassword = asyncHandler(async (req, res) => {
  // seller login required
  // seller id
  // body - newPassword
  // set password

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(400, "Seller not Authenticate");
  }

  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No Data received");
  }

  // Find seller by ID and exclude password and refreshToken from the result
  const sellerData = await Seller.findById(req.userId).select(
    "-password -refreshToken"
  );

  // Check if seller data retrieval failed
  if (!sellerData) {
    throw new ApiError(500, "Seller Data retrieved failed");
  }

  try {
    // Set new password and save seller data
    sellerData.password = newPassword;
    sellerData.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, error.message || "Seller password not change");
  }

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Change successfully"));
});

export const deleteSeller = asyncHandler(async (req, res) => {
  // seller id
  // delete
  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(400, "Seller not Authenticate");
  }
  try {
    // Attempt to delete the seller by ID
    const deletedSeller = await Seller.findByIdAndDelete(req.userId);
  } catch (error) {
    // Handle any errors that occur during deletion
    throw new ApiError(500, error.message || "Failed to delete seller");
  }

  // Check if the seller was not deleted from the database
  if (!deletedSeller) {
    throw new ApiError(500, "Failed to delete seller from Database");
  }

  // Return success response indicating seller was deleted
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Seller Successfully Deleted"));
});
