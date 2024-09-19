/** 
 * user registation
 * user login
 * logout
 * update details
 * change user password
 * delete user
 * update avtar
 * remove avtar
 * get all event
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
import sendAMail from "../utils/email.configration.js";

// Controller for register Userdepartment
export const registerUser = asyncHandler(async (req, res) => {

  // Check if the user is already authenticated
  if (req.userId) {
    throw new ApiError(400, "LoginError : User already logged in, please logout or clear cookies")
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(400, "DataError : Data not received")
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
    throw new ApiError(400, "DataError : All fields are required")
  }
  if (
    [
      userName,
      fullName,
      email,
      password].some(
      (field) => field?.toString().trim() === "")
  ) {
    throw new ApiError(400, "DataError : No any field is Empty")
  }

  // Check for invalid values (e.g., spaces)
  if (
    [userName, email, password].some((field) => isSpace(field?.trim()))
  ) {
    throw new ApiError(400, "DataError : Invalid value in fields")
  }

  // Check if userName already exists
  if (await UserDetail.findOne({ userName })) {
    throw new ApiError(409, "DataError : userName already exists")
  }

  // Check if email already exists
  if (await UserDetail.findOne({ email })) {
    throw new ApiError(409, "DataError : Email already exists")
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
    throw new ApiError(500, "DbError : User creation failed")
  }

  if (!newUser) {
    throw new ApiError(400, "DbError : User not created")
  }

  // Verify the newly created user
  const createdUser = await UserDetail.findById(newUser._id).select(" -password   -__v");

  if (!createdUser) {
    throw new ApiError(500, "DbError : User not found")
  }
  console.log(sendAMail(email, "User register successfully", `user register successfully`))
  // Render success message
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdUser, "SuccessMessage : User created successfully")
    )
});

// Controller for login User
export const loginUser = asyncHandler(async (req, res) => {
  // Check if the user is already authenticated
  if (req.userId) {
    throw new ApiError(400, "LoginError : User already logged in, please logout or clear cookies");
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(400, "DataError : Data not received");
  }
  // Extract data from the request body
  const { userName, password } = req.body;

  // Check if any required fields are empty
  if (
    [userName, password].some(field => (field === undefined))
  ) {
    throw new ApiError(400, "DataError : All field is required");
  }
  if (
    [userName, password].some((field) => (field?.toString()).trim() === "")
  ) {
    throw new ApiError(400, "DataError : Any field is not empty");
  }

  // Check for invalid values (e.g., spaces)
  if (isSpace(userName?.trim())) {
    throw new ApiError(400, "DataError : Invalid value in userName field");
  }

  // Look up user data by userName
  const userData = await UserDetail.findOne({ userName });
  if (!userData) {
    throw new ApiError(404, "DataError : Given userName not exists");
  }

  // Verify user password
  if (!(await userData.IsPasswordCorrect(password))) {
    throw new ApiError(404, "DataError : Incorrect password");
  }

  // Generate an access token 
  let accessToken
  try {
    accessToken = userData.GenerateAccessToken();
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to generate access token"}`)
  }
  if(!accessToken) {
    throw new ApiError(500, "DbError : AccessToken not generated")
  }
  let updatedUser;
  try {
    updatedUser = await UserDetail.findByIdAndUpdate(userData._id, {
      $set: {
        lastLogin: Date.now(),
      }
    }, { new: true }).select("-password -__v");
  } catch (error) {
    throw new ApiError(500, error.message || "DbError : Unable to update user info");
  }
  if(!updateUser){
    throw new ApiError(500, "DbError : user not updated")
  }

  // Set a cookie and respond with User data
  return res
    .status(200)
    .cookie("AccessToken", accessToken, accessTokenCookieOption)
    .json(new ApiResponse(200, updatedUser, "SuccessMessage : User login successful"));
});

// Controller for logout user
export const logoutUser = asyncHandler(async (req, res) => {
  // check user authenticated or not by middleware
  // Invalidate the user's refresh token by setting it to undefined

  // Check if user authenticated or not
  if (!req.userId) {
    throw new ApiError(400, "LoginError : User not logged in, please login first");
  }
  // check userId from params
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }
  try {
    await UserDetail.findById( req.userId);
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find User"}`)
  }

  // Clear cookies for refreshToken and accessToken
  return res
    .clearCookie("AccessToken", accessTokenCookieOption)
    .json(
      new ApiResponse(200, {}, "SuccessMessage : User logout successfully")
    )
});

// Controller for get user details
export const getUserDetails = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check user id is received from params
   * reteived and return user details
   */

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // check userId from params
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // search User by userId
  let searchUserDetails
  try {
    searchUserDetails = await UserDetail.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find user"}`)
  } 
  if(!searchUserDetails){
    throw new ApiError(500, "DbError : user not found")
  }

  // return responce with userData
  return res
  .status(200)
  .json(new ApiResponse(
    200, searchUserDetails, "SuccessMessage : user details reteived successfully"
  ))
})

// Controller for Update User details
export const updateUser = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated -> return user by middleware
   * Check if user data is received
   * Update and return updated user data
   */

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // check userId from params
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(400, "DataError : Data not received");
  }
  
  const {_id, userName, email, password, avatar, eventsArray} = req.body
  // check some field not updated here
  if ([_id, userName, email, password, avatar, eventsArray].some(field => field !== undefined)){
    throw new ApiError(400, "DataError : field not allow to update")
  }

  let updatedUserDetails;
  try {
    updatedUserDetails = await UserDetail.findByIdAndUpdate(
       req.userId,
      { $set: req.body },
      { new: true }
    ).select("-password   -__v"); 
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update user details"}`);
  }

  // Send a success response with the updated user details
  res.status(200).json(
    new ApiResponse(200, updatedUserDetails, "SuccessMessage : User details updated successfully")
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
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // Check userId from params
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(400, "DataError : Data not received");
  }

  const {oldPassword, newPassword} = req.body

  // Check if any required fields are empty
  if (
    [oldPassword, newPassword].some(field => (field === undefined))
  ) {
    throw new ApiError(400, "DataError : All field is required");
  }
  if (
    [oldPassword, newPassword].some((field) => (field?.toString()).trim() === "")
  ) {
    throw new ApiError(400, "DataError : Any field is not empty");
  }

  // Look up user data by userName
  let userData;
  try {
    userData = await UserDetail.findById(req.userId);
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find user"}`)
  }
  if (!userData) {
    throw new ApiError(404, "DbError : user not found");
  }

  // Verify old password
  if (!(await userData.IsPasswordCorrect(oldPassword))) {
    throw new ApiError(404, "DateError : old password is incorrect");
  }

  try {
    userData.password = newPassword
    await userData.save({validateBeforeSave : false})
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update password"}`)
  }
  // Verify updated password
  if (!(await userData.IsPasswordCorrect(newPassword))) {
    throw new ApiError(404, "DbError : password not updated");
  }
  return res
  .status(200)
  .clearCookie("AccessToken", accessTokenCookieOption)
  .json(
    new ApiResponse(
      200, {}, "User password updated successfully"
    )
  )
})

// Controller for delete user
export const deleteUser = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check user id received from params
   * serch user and delete after search
   * return responce with success message
   */

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // check userId from params
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // search User by userId
  let searchUserDetails
  try {
    searchUserDetails = await UserDetail.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find user"}`)
  } 
  if(!searchUserDetails){
    throw new ApiError(500, "DbError : user not found")
  }

  // delete user by Id
  try {
    await UserDetail.findByIdAndDelete(searchUserDetails._id)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to delete user"}`)
  }
  if(await UserDetail.findById(searchUserDetails._id)){
    throw new ApiError(500, "DbError : User not deleted")
  }

  // return responce with userData
  return res
  .status(200)
  .clearCookie("AccessToken", accessTokenCookieOption)
  .json(new ApiResponse(
    200, {}, "SuccessMessage : user deleted successfully"
  ))
})

// Controller for Set Avatar 
export const setUserAvatar = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated
   * Get local file path by multer middleware
   * Upload to Cloudinary
   * Return updated avatar URL
   */

  // Check if user is authenticated
  if (!req.userId) {
    // If user is not logged in, throw an authentication error
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }
  console.log(req.body)
  // Check if file is received
  if (!req.file) {
    // If no file is received, throw a bad request error
    throw new ApiError(400, "DataError : File not received");
  }

  // Get the local file path of the user's avatar
  const userAvatarLocalFilePath = req.file?.path;

  // serch user
  let searchUserDetails
  try {
    searchUserDetails = await UserDetail.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find user"}`)
  }
  if(!searchUserDetails){
    throw new ApiError(500, "DbError : User not found")
  }
  // Upload the avatar to Cloudinary
  let avatarUploadResponse
  try {
    avatarUploadResponse = await uploadToCloudinary(userAvatarLocalFilePath);
  } catch (error) {
    throw new ApiError(500, `CloudinaryError : ${error.message || "unable to upload file"}`)
  }
  if(!avatarUploadResponse){
    throw new ApiError(500, "CloudinaryError : file not uploaded")
  }
  // If the user's current avatar is not the default, delete the old avatar from Cloudinary
  if (searchUserDetails.avatar !== process.env.DEFAULT_USER_PIC_CLOUDINARY_URL) {
    let avatarDeleteResponse
    try {
      avatarDeleteResponse = await DeleteToCloudinary(req.userId.avatar);
    } catch (error) {
      throw new ApiError(500, `CloudinaryError : ${error.message || "Unable to remove old avatar"}`)
    }
    if (!avatarDeleteResponse) {
      throw new ApiError(500, "CloudinaryError : Avatar deletion error");
    }
  }

  // Update the user's avatar URL in the database
  let updatedUserData
  try {
    updatedUserData = await UserDetail.findByIdAndUpdate(
      req.userId._id,
      {
        $set: {
          avatar: avatarUploadResponse.url
        }
      },
    { new: true }).select("-password"); 
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update user"}`)
  }
  if(!updatedUserData){
    throw new ApiError(500, "DbError : User not updated")
  }
  // Send a success response with the updated user data
  res.status(200).json(
    new ApiResponse(200, updatedUserData, "SuccessMessage : User avatar updated successfully")
  );
});

// Controller for remove avatar
export const removeUserAvatar = asyncHandler(async (req, res) => {
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
  // check userId from params
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // search user
  let searchUserDetails
  try {
    searchUserDetails = await UserDetail.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find user"}`)
  }
  if(!searchUserDetails){
    throw new ApiError(500, "DbError : user not found")
  }

  // check avatar not defualt
  if(searchUserDetails.avatar === process.env.DEFAULT_USER_PIC_CLOUDINARY_URL){
    throw new ApiError(400, "DataError : Default avatar not allow to remove")
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
    ).select("-password"); 
  } catch (error) {
    // If an error occurs during the update, throw an internal server error
    throw new ApiError(500, error.message || "Unable to update user details");
  }

  // Attempt to delete the user's avatar from Cloudinary
  let avatarDeleteResponse
  try {
    avatarDeleteResponse = await DeleteToCloudinary(updatedUserData.avatar);
  } catch (error) {
    throw new ApiError(500, `CloudinaryError : ${error.message || "Unsble to remove file"}`)
  }
 
  if (!avatarDeleteResponse) {
    // If the avatar deletion fails, throw an internal server error
    throw new ApiError(500, "CloudinaryError : Avatar deletion error");
  }

  // Send a success response with the updated user data
  res.status(200).json(
    new ApiResponse(200, updatedUserData, "SuccessMessage : User avatar removed and default picture restored successfully")
  );
});

// Controller for get all Event list
export const getAllEventList = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check user id from params
   * reteive user all event 
   * get event details and push event array
   * return responce
   */
  
  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // check userId from params
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // search User by userId
  let searchUserDetails
  try {
    searchUserDetails = await UserDetail.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find user"}`)
  } 
  if(!searchUserDetails){
    throw new ApiError(500, "DbError : user not found")
  }

  const userEventArray = searchUserDetails.eventsArray

  let AllEventList = new Array()
  for (let event of userEventArray){
    let serchEventDetails
    try {
      serchEventDetails = await Event.findById(event.EventId).select("-userId -description")
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find event"}`)
    }
    if(!serchEventDetails){
      throw new ApiError(500, "DbError : Event not found")
    }
    AllEventList.push(serchEventDetails)
  }

  // return responce with userData
  return res
  .status(200)
  .json(new ApiResponse(
    200, AllEventList, "SuccessMessage : user event list reteived successfully"
  ))
})