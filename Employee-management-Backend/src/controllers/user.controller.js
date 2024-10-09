/**
 * user registation
 * user login
 * logout
 * update details
 * change password
 * update avtar
 * remove avtar
*/

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import EmployeeDetail from "../models/employee.models.js";
import UserDetail from "../models/user.models.js";
import { AccessRefreshTokenGenerator } from "../utils/accessRefreshTokenGenrator.js";
import { DeleteToCloudinary, uploadToCloudnary } from "../utils/cloudnary.js";

// custom methods and constant
import { isSpace } from "../utils/customMethods.js";
import {accessTokenCookieOption, refreshTokenCookieOption} from "../contents.js"

// Controller for register Userdepartment
export const registerUser = asyncHandler(async (req, res) => {
  /**
   * check user login
   * Extract data
   * validate data
   * create new user and employee
   * return responce
   */

  // Check if the user is already authenticated
  if (req.user) {
    throw new ApiError(400, "AuthError : User already logged in, please logout or clear cookies")
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(404, "DataError : Data not received")
  }

  // Extract data from the request body
  const {
    userName,
    fullName,
    email,
    empId,
    password,
    position,
    branch,
  } = req.body;

  // Check if any required fields are empty
  if (
    [userName, fullName, email, empId, password, position, branch].some(
      (field) => field === undefined)
  ) {
    throw new ApiError(404, "DataError : All fields are required")
  }
  if (
    [userName, fullName, email, empId, password, position, branch].some(
      (field) => field?.toString().trim() === "")
  ) {
    throw new ApiError(400, "DataError : No any field is Empty")
  }

  // Check for invalid values (e.g., spaces)
  if (
    [userName, email, empId, password].some((field) => isSpace(field?.trim()))
  ) {
    throw new ApiError(400, "DataError : Invalid fields")
  }

  // Check if userName already exists
  if (await UserDetail.findOne({ userName })) {
    throw new ApiError(409, "DataError : userName already exists")
  }

  // Check if empId already exists
  if (await UserDetail.findOne({ empId })) {
    throw new ApiError(409, "DataError : Employee ID already exists")
  }

  // Check if email already exists
  if (await UserDetail.findOne({ email })) {
    throw new ApiError(409, "DataError : Email already exists")
  }

  // Create a new user
  let newUser
  try {
    newUser = await UserDetail.create({
      userName,
      fullName,
      email,
      empId,
      password,
      position,
      branch,
    });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to create New User"}`)
  }

  if (!newUser) {
    throw new ApiError(500, "DbError : User not created")
  }
  // Verify the newly created user
  let searchNewUser
  try {
    searchNewUser = await UserDetail.findById(newUser?._id).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find User"}`)
  }
  if(!searchNewUser){
    throw new ApiError(500, `DbError : new created user not found`)
  }
  // Save new user data in the employee collection
  let newEmployee
  try {
    newEmployee = await EmployeeDetail.create({
      fullName,
      email,
      empId,
      department: "HR",
      position,
      branch,
    });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to create Employee"}`)
  }
  if (!newEmployee) {
    throw new ApiError(500, "DbError : Employee not created")
  }

  // Verify the newly created employee
  let searchNewEmployee
  try {
    searchNewEmployee = await EmployeeDetail.findById(newEmployee?._id)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Employee"}`)
  }
  if(!searchNewEmployee){
    throw new ApiError(500, "DbError : new cteated Employee not found")
  }
  // Return success message in responce
  return res
    .status(201)
    .json(
      new ApiResponse(201, searchNewUser, "User created successfully")
    )
});

// Controller for login User
export const loginUser = asyncHandler(async (req, res) => {
  /**
   * check user login
   * Extract data from body
   * validate data
   * generate access refresh Token
   * save refresh token in user collection
   * set cookie and return responce
   */

  // Check if the user is already authenticated
  if (req.user) {
    throw new ApiError(400, "AuthError : User already logged in, please logout or clear cookies");
  }
  // Validate request body fields
  if (!req.body) {
    throw new ApiError(404, "DataError : Data not received");
  }

  // Extract data from the request body
  const { userName, password, saveInfo } = req.body;

  // Check if any required fields are empty
  if (
    [userName, password, saveInfo].some((field) => (field === undefined))
  ) {
    throw new ApiError(400, "DataError : All fields is required");
  }
  if (
    [userName, password, saveInfo].some((field) => (field?.toString()).trim() === "")
  ) {
    throw new ApiError(400, "DataError : No any field is empty");
  }

  // Check for invalid values (e.g., spaces)
  if (isSpace(userName?.trim())) {
    throw new ApiError(400, "DataError : Invalid userName field");
  }

  // Look up user data by userName
  let userData
  try {
    userData = await UserDetail.findOne({ userName });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find user"}`)
  }
  if (!userData) {
    throw new ApiError(404, "DataError : Given userName not exists");
  }

  // Check if the user's department not is HR
  if ((await EmployeeDetail.findOne({email : userData.email})).department !== "HR") {
    throw new ApiError(404, "User not Authorize to login");
  }

  // Verify user password
  if (!(await userData.IsPasswordCorrect(password))) {
    throw new ApiError(404, "Incorrect password");
  }

  // Generate tokens and update database if 'saveInfo' is true
  if (saveInfo) {
    let refreshToken, accessToken
    try {
    ({ refreshToken, accessToken } = await AccessRefreshTokenGenerator(userData));
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to generate tokens"}`);
    }
    let updateUser;
    try {
      updateUser = await UserDetail.findByIdAndUpdate(userData._id, {
        $set: {
          refreshToken: refreshToken,
          lastLogin: Date.now(),
        }
      }, { new: true }).select("-password -refreshToken -__v");
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to update user info"}`);
    }

    // Set cookies and respond with user data
    return res
      .status(200)
      .cookie("AccessToken", accessToken, accessTokenCookieOption)
      .cookie("RefreshToken", refreshToken, refreshTokenCookieOption)
      .json(new ApiResponse(200, updateUser, "SuccessMessage : User login successful"));
  } else {
    // Generate an access token without a refresh token
    const accessToken = await userData.GenerateAccessToken();

    let updateUser;
    try {
      updateUser = await UserDetail.findByIdAndUpdate(userData._id, {
        $set: {
          lastLogin: Date.now(),
        }
      }, { new: true }).select("-password -refreshToken -__v");
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to update user info"}`);
    }
    if(!updateUser){
      throw new ApiError(500, "DbError : user not updated")
    }

    // Set a cookie and respond with user data
    return res
      .status(200)
      .cookie("AccessToken", accessToken, accessTokenCookieOption)
      .json(new ApiResponse(200, updateUser, "User login successful"));
  }
});

// Controller for logout user
export const logout = asyncHandler(async (req, res) => {
  // check user authenticated or not by middleware
  // Invalidate the user's refresh token by setting it to undefined

  // Check if user authenticated or not
  if (!req.user) {
    throw new ApiError(400, "User not logged in, please login first");
  }
  try {
    await UserDetail.findByIdAndUpdate(req.user?._id, {
      $set: {
        refreshToken: null,
      },
    });
  } catch (error) {
    throw new ApiError(500, error.message || "User updation failed")
  }

  // Clear cookies for refreshToken and accessToken
  return res
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
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
  if (!req.user) {
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
      req.user?._id,
      { $set: req.body },
      { new: true }
    ).select("-password -refreshToken -__v"); // Exclude sensitive fields from the returned document
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to update user details");
  }

  // Send a success response with the updated user details
  res.status(200).json(
    new ApiResponse(200, updatedUserDetails, "User details updated successfully")
  );
});

// Controller for Set Avatar 
export const setAvatar = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated
   * Get local file path by multer middleware
   * Upload to Cloudinary
   * Return updated avatar URL
   */

  // Check if user is authenticated
  if (!req.user) {
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
  if (req.user.avatar !== process.env.DEFAULT_USER_PIC_CLOUDINARY_URL) {
    const avatarDeleteResponse = await DeleteToCloudinary(req.user.avatar);
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
    req.user._id,
    {
      $set: {
        avatar: avatarUploadResponse.url
      }
    },
    { new: true } // Return the updated document
  ).select("-password -refreshToken"); // Exclude sensitive fields from the returned document


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
  if (!req.user) {
    // If user is not logged in, throw an authentication error
    throw new ApiError(401, "User not logged in, please login first");
  }

  // Attempt to delete the user's avatar from Cloudinary
  const avatarDeleteResponse = await DeleteToCloudinary(req.user.avatar);
 
  if (!avatarDeleteResponse) {
    // If the avatar deletion fails, throw an internal server error
    throw new ApiError(500, "Avatar deletion error");
  }

  let updatedUserData;
  try {
    // Attempt to update the user's avatar to the default picture
    updatedUserData = await UserDetail.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatar: process.env.DEFAULT_USER_PIC_CLOUDINARY_URL
        }
      },
      { new: true }
    ).select("-password -refreshToken"); 
  } catch (error) {
    // If an error occurs during the update, throw an internal server error
    throw new ApiError(500, error.message || "Unable to update user details");
  }

  // Send a success response with the updated user data
  res.status(200).json(
    new ApiResponse(200, updatedUserData, "User avatar removed and default picture restored successfully")
  );
});

