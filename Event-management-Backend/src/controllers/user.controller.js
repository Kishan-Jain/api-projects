/** 
 * user registation
 * user login
 * logout
 * update details
 * change user password
 * update avtar
 * remove avtar
 * get user all event
 * get all user event
*/
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/event.models.js";
import UserDetail from "../models/user.models.js";
import {accessTokenCookieOption} from "../contents.js"
import { DeleteToCloudinary, uploadToCloudinary } from "../utils/cloudnary.js";

// custom methods
import { isSpace } from "../utils/customMethods.js";

// Controller for register Userdepartment
export const registerUser = asyncHandler(async (req, res) => {

  // Check if the user is already authenticated
  if (req.userId) {
    throw new ApiError(400, "User already logged in, please logout or clear cookies")
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(400, "Data not received")
  }

  // Extract data from the request body
  const {
    userName,
    fullName,
    email,
    password
  } = req.body;

  // Check if any required fields are empty
  if (
    [
      userName,
      fullName,
      email,
      password].some(
      (field) => field === undefined)
  ) {
    throw new ApiError(400, "All fields are required")
  }
  if (
    [
      userName,
      fullName,
      email,
      password].some(
      (field) => field?.toString().trim() === "")
  ) {
    throw new ApiError(400, "No any field is Empty")
  }

  // Check for invalid values (e.g., spaces)
  if (
    [userName, email, password].some((field) => isSpace(field?.trim()))
  ) {
    throw new ApiError(400, "Invalid value in fields")
  }

  // Check if userName already exists
  if (await UserDetail.findOne({ userName })) {
    throw new ApiError(409, "userName already exists")
  }

  // Check if email already exists
  if (await UserDetail.findOne({ email })) {
    throw new ApiError(409, "Email already exists")
  }

  // Create a new user
  let newUser
  try {
    newUser = new UserDetail({
      userName,
      fullName,
      email,
      password });
    await newUser.save({ validateBeforeSave: false });

  } catch (error) {
    throw new ApiError(500, "User creation failed")
  }

  if (!newUser) {
    throw new ApiError(400, "User not created")
  }

  // Verify the newly created user
  const createdUser = await UserDetail.findById(newUser._id).select(" -password   -__v");

  if (!createdUser) {
    throw new ApiError(500, "User not found")
  }

  // Render success message
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdUser, "User created successfully")
    )
});

// Controller for login User
export const loginUser = asyncHandler(async (req, res) => {
  // Check if the user is already authenticated
  if (req.userId) {
    throw new ApiError(400, "User already logged in, please logout or clear cookies");
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(400, "Data not received");
  }

  // Extract data from the request body
  const { userName, password } = req.body;

  // Check if any required fields are empty
  if (
    [userName, password].some(field => (field === undefined))
  ) {
    throw new ApiError(400, "All field is required");
  }
  if (
    [userName, password].some((field) => (field?.toString()).trim() === "")
  ) {
    throw new ApiError(400, "Any field is not empty");
  }

  // Check for invalid values (e.g., spaces)
  if (isSpace(userName?.trim())) {
    throw new ApiError(400, "Invalid value in userName field");
  }

  // Look up user data by userName
  const userData = await UserDetail.findOne({ userName });
  if (!userData) {
    throw new ApiError(404, "Given userName not exists");
  }

  // Verify user password
  if (!(userData.IsPasswordCorrect(password))) {
    throw new ApiError(404, "Incorrect password");
  }

  // Generate an access token 
  const accessToken = userData.generateAccessToken();
  if(!accessToken) {

  }

  let updatedUser;
  try {
    updatedUser = await UserDetail.findByIdAndUpdate(userData._id, {
      $set: {
        lastLogin: Date.now(),
      }
    }, { new: true }).select("-password -__v");
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to update user info");
  }
  if(!updateUser){

  }

  // Set a cookie and respond with User data
  return res
    .status(200)
    .cookie("AccessToken", accessToken, accessTokenCookieOption)
    .json(new ApiResponse(200, updatedUser, "User login successful"));
});

// Controller for logout user
export const logout = asyncHandler(async (req, res) => {
  // check user authenticated or not by middleware
  // Invalidate the user's refresh token by setting it to undefined

  // Check if user authenticated or not
  if (!req.userId) {
    throw new ApiError(400, "User not logged in, please login first");
  }
  try {
    await UserDetail.findById( req.userId);
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to find User")
  }

  // Clear cookies for refreshToken and accessToken
  return res
    .clearCookie("AccessToken", accessTokenCookieOption)
    .json(
      new ApiResponse(200, {}, "User logout successfully")
    )
});

// Controller for Update User details
export const updateUser = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated -> return user by middleware
   * Check if user data is received
   * Update and return updated user data
   */

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "User not logged in, please login first");
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(400, "Data not received");
  }

  let updatedUserDetails;
  try {
    // Attempt to find the user by ID and update their details
    updatedUserDetails = await UserDetail.findByIdAndUpdate(
       req.userId,
      { $set: req.body },
      { new: true }
    ).select("-password   -__v"); // Exclude sensitive fields from the returned document
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to update user details");
  }

  // Send a success response with the updated user details
  res.status(200).json(
    new ApiResponse(200, updatedUserDetails, "User details updated successfully")
  );
});

// Controller for change password by autherize user
export const changeUserPassword = asyncHandler(async (req, res) => {
  /**
   * check user authenticate
   * check old and new password received from body
   * compare old password with database
   * update new password on database
   * clear all cookies and return responce with success message 
   */

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "User not logged in, please login first");
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(400, "Data not received");
  }

  const {oldPassword, newPassword} = req.body

  // Check if any required fields are empty
  if (
    [oldPassword, newPassword].some(field => (field === undefined))
  ) {
    throw new ApiError(400, "All field is required");
  }
  if (
    [oldPassword, newPassword].some((field) => (field?.toString()).trim() === "")
  ) {
    throw new ApiError(400, "Any field is not empty");
  }

  // Look up user data by userName
  let userData;
  try {
    userData = await UserDetail.findById(req.userId);
  } catch (error) {
    throw new ApiError
  }
  if (!userData) {
    throw new ApiError(404, "user not found");
  }

  // Verify old password
  if (!(userData.IsPasswordCorrect(oldPassword))) {
    throw new ApiError(404, "given password is incorrect");
  }

  try {
    userData.password = newPassword
    await userData.save({validateBeforeSave : false})
  } catch (error) {
    throw new ApiError
  }
  if(!userData){

  }
  return res
  .status(200)
  .clearCookie("AccessToken", accessTokenCookieOption)
  .json(
    new ApiResponse()
  )
})

// Controller for Set Avatar 
export const setAvatar = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated
   * Get local file path by multer middleware
   * Upload to Cloudinary
   * Return updated avatar URL
   */

  // Check if user is authenticated
  if (!req.userId) {
    // If user is not logged in, throw an authentication error
    throw new ApiError(401, "User not logged in, please login first");
  }

  // Check if file is received
  if (!req.file) {
    // If no file is received, throw a bad request error
    throw new ApiError(400, "File not received");
  }

  // Get the local file path of the user's avatar
  const userAvatarLocalFilePath = req.file?.path;

  // Upload the avatar to Cloudinary
  const avatarUploadResponse = await uploadToCloudinary(userAvatarLocalFilePath);

  // If the user's current avatar is not the default, delete the old avatar from Cloudinary
  if (req.userId.avatar !== process.env.DEFAULT_USER_PIC_CLOUDINARY_URL) {
    const avatarDeleteResponse = await DeleteToCloudinary(req.userId.avatar);
    if (!avatarDeleteResponse) {
      throw new ApiError(500, "Avatar deletion error");
    }
  }

  // If the avatar upload fails, throw an internal server error
  if (!avatarUploadResponse) {
    throw new ApiError(500, "Avatar upload error");
  }

  // Update the user's avatar URL in the database
  const updatedUserData = await UserDetail.findByIdAndUpdate(
    req.userId._id,
    {
      $set: {
        avatar: avatarUploadResponse.url
      }
    },
    { new: true } // Return the updated document
  ).select("-password  "); // Exclude sensitive fields from the returned document


  // Send a success response with the updated user data
  res.status(200).json(
    new ApiResponse(200, updatedUserData, "User avatar updated successfully")
  );
});

// Controller for remove avatar
export const removeAvatar = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated
   * Remove avatar from Cloudinary
   * Restore default profile picture
   */

  // Check if user is authenticated
  if (!req.userId) {
    // If user is not logged in, throw an authentication error
    throw new ApiError(401, "User not logged in, please login first");
  }

  // Attempt to delete the user's avatar from Cloudinary
  const avatarDeleteResponse = await DeleteToCloudinary(req.userId.avatar);
 
  if (!avatarDeleteResponse) {
    // If the avatar deletion fails, throw an internal server error
    throw new ApiError(500, "Avatar deletion error");
  }

  let updatedUserData;
  try {
    // Attempt to update the user's avatar to the default picture
    updatedUserData = await UserDetail.findByIdAndUpdate(
      req.userId._id,
      {
        $set: {
          avatar: process.env.DEFAULT_USER_PIC_CLOUDINARY_URL
        }
      },
      { new: true }
    ).select("-password  "); 
  } catch (error) {
    // If an error occurs during the update, throw an internal server error
    throw new ApiError(500, error.message || "Unable to update user details");
  }

  // Send a success response with the updated user data
  res.status(200).json(
    new ApiResponse(200, updatedUserData, "User avatar removed and default picture restored successfully")
  );
});

