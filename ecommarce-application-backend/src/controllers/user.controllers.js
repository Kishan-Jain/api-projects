/**
 * User Controllers
 * - register user@
 * - login user@
 * - login user with Email@
 * - logout user@
 * - update user@
 * - set Avatar@
 * - remove Avatar@
 * - change user Password@
 * - reset user Password@
 * - delete user@
 * - add new Address@
 * - remove Address@
 */

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/users/user.models.js";
import accessAndRefreshTokenGenrator from "../utils/accessRefreshTokenGenrator.js";
import { uploadFileToCloudinary, RemoveFileFromCloudinary } from "../utils/cloudinary.js";
import {AccessTokenCookieOption, RefreshTokenCookieOption} from "../constants.js"
import {isSpace} from "../utils/customMethods.js"

export const userRegister = asyncHandler(async (req, res) => {
  /**
   * validate user not login already
   * varidate received data from body
   * make new user and save in user db collection
   * validate create user
   * return responce with new user
   */

  if(req.userId){
    throw new ApiError(400, "AuthError : user already login, please logout or clear cookies")
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received");
  }

  // Destructure user details from request body
  const { userName, fullName, email, password } = req.body;

  // Check if any field is empty
  if (
    [userName, fullName, email, password].some((field) => field === undefined)
  ) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  
  if (
    [userName, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  if([userName, email].some(field => isSpace(field) === true)){
    throw new ApiError(400, "DataError : Invalid fields")
  }
  // Check if userName already exists
  if (await User.findOne({ userName })) {
    throw new ApiError(409, "DataError : userName already exists");
  }

  // Create new user
  let newUser
  try {
    newUser = await User.create({
      userName,
      fullName,
      email,
      password,
    });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to create new user"}`)
  }

  if(!newUser){
    throw new ApiError(500, "DbError : New user not created")
  }

  // Retrieve newly created user without password and refreshToken
  let newCreatedUser
  try {
    newCreatedUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find new created user"}`)
  }

  // Check if user creation failed
  if (!newCreatedUser) {
    throw new ApiError(500, "DbError : created user not found");
  }

  // Return success response with new user data
  return res
    .status(201)
    .json(new ApiResponse(200, newCreatedUser, "successMessage : User registered successfully"));
});

export const userLogin = asyncHandler(async (req, res) => {
  /**
   * check user already login
   * validate data from body
   * validate data from database
   * genrete access, refreshtoken
   * save refresh token in db
   * store access, refreshtoken in cookie
   * return responce
   */
  if(req.userId){
    throw new ApiError(401, "AuthError : User already login, please logout or clear cookies")
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received");
  }

  // Destructure login details from request body
  const { userName, password, saveInfo } = req.body;

  // Check if any field is empty
  if (
    [userName, password, saveInfo].some(
      (field) => field === undefined
    )
  ) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  if (
    [userName, password, saveInfo].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  if(isSpace(userName)){
    throw new ApiError(400, "DataError : Invalid fields")
  }
  // Find user by userName
  let searchUser
  try {
    searchUser = await User.findOne({ userName });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find user"}`)
  }

  // Check if user does not exist
  if (!searchUser) {
    throw new ApiError(409, "DataError : User not exists");
  }

  // Verify password
  if (!(await searchUser.isPasswordCorrect(password))) {
    throw new ApiError(400, "DataError : Incorrect password");
  }

  if (saveInfo) {
    // Generate refresh and access tokens
    let tokens
    try {
      tokens = await accessAndRefreshTokenGenrator(searchUser);
    } catch (error) {
      throw new ApiError(500, `DbError :${error.message || "Unable to generate user tokens"}`)
    }
    if(!tokens){
      throw new ApiError(500, "DbError : User Token not generated")
    }

    const {accessToken, refreshToken} = tokens
    if([accessToken, refreshToken].some(field => field === undefined)){
      throw new ApiError(500, "DbError : User Token not available")
    }
    if([accessToken, refreshToken].some(field => field?.toString().trim() === "")){
      throw new ApiError(500, "DbError : User Token not available")
    }

    // Update user details with last login time and refresh token
    let updateUser
    try {
      updateUser = await User.findByIdAndUpdate(
        searchUser._id,
        {
          $set: {
            lastLogin: Date.now(),
            refreshToken,
          },
        },
        { new: true }
      ).select("-password");
    } catch (error) {
      throw new ApiError(500, `DbError :${error.message || "unable to update user"}`)
    }
    if(!updateUser){
      throw new ApiError(500, "DbError : User not update")
    }
    // Return success response with cookies and user details
    return res
      .status(200)
      .cookie("accessToken", accessToken, AccessTokenCookieOption)
      .cookie("refreshToken", refreshToken, RefreshTokenCookieOption)
      .json(new ApiResponse(200, updateUser, "successMessage : User Login successfully"));
  } else {
    // Generate access token
    let accessToken
    try {
      accessToken = await searchUser.generateAccessToken();
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to generated User access Token"}`)
    }
    if(!accessToken){
      throw new ApiError(500, "DbError : User Token not generated")
    }
    // Update user details with last login time and remove refresh token
    let updateUser
    try {
      updateUser = await User.findByIdAndUpdate(
        searchUser._id,
        {
          $set: {
            lastLogin: Date.now(),
            refreshToken: undefined,
          },
        },
        { new: true }
      ).select("-password -refreshToken");
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to update user"}`)
    }
    if(!updateUser){
      throw new ApiError(500, "DbError :  User not updated")
    }
    // Return success response with cookie and user details
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, updateUser, "successMessage : User Login successfully"));
  }
});

export const userLoginWithEmail = asyncHandler(async (req, res) => {
  /**
   * check user already login
   * validate data from body
   * validate data from database
   * genrete access, refreshtoken
   * save refresh token in db
   * store access, refreshtoken in cookie
   * return responce
   */
  if(req.userId){
    throw new ApiError(401, "AuthError : User already login, please logout or clear cookies")
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received");
  }

  // Destructure login details from request body
  const { email, fullName, password, saveInfo } = req.body;

  // Check if any field is empty
  if (
    [email, fullName, password, saveInfo].some(
      (field) => field === undefined
    )
  ) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  if (
    [email, fullName, password, saveInfo].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  
  if(isSpace(email)){
    throw new ApiError(400, "DataError : Invalid fields")
  }
  // Find user by email
  let searchUser
  try {
    searchUser = await User.findOne({ email });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find user"}`)
  }

  if (!searchUser) {
    throw new ApiError(409, "DataError : User not exists");
  }

  // Verify password
  if (!(await searchUser.isPasswordCorrect(password))) {
    throw new ApiError(400, "DataError : Incorrect password");
  }

  if (saveInfo) {
    // Generate refresh and access tokens
    let tokens
    try {
      tokens = await accessAndRefreshTokenGenrator(searchUser);
    } catch (error) {
      throw new ApiError(500, `DbError :${error.message || "Unable to generate user tokens"}`)
    }
    if(!tokens){
      throw new ApiError(500, "DbError : User Token not generated")
    }

    const {accessToken, refreshToken} = tokens
    if([accessToken, refreshToken].some(field => field === undefined)){
      throw new ApiError(500, "DbError : User Token not available")
    }
    if([accessToken, refreshToken].some(field => field?.toString().trim() === "")){
      throw new ApiError(500, "DbError : User Token not available")
    }

    // Update user details with last login time and refresh token
    let updateUser
    try {
      updateUser = await User.findByIdAndUpdate(
        searchUser._id,
        {
          $set: {
            lastLogin: Date.now(),
            refreshToken,
          },
        },
        { new: true }
      ).select("-password");
    } catch (error) {
      throw new ApiError(500, `DbError :${error.message || "Unable to update user"}`)
    }
    if(!updateUser){
      throw new ApiError(500, "DbError : User not update")
    }
    // Return success response with cookies and user details
    return res
      .status(200)
      .cookie("accessToken", accessToken, AccessTokenCookieOption)
      .cookie("refreshToken", refreshToken, RefreshTokenCookieOption)
      .json(new ApiResponse(200, updateUser, "successMessage : User Login successfully"));
  } else {
    // Generate access token
    let accessToken
    try {
      accessToken = await searchUser.generateAccessToken();
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to generated User access Token"}`)
    }
    if(!accessToken){
      throw new ApiError(500, "DbError : User Token not generated")
    }
    // Update user details with last login time and remove refresh token
    let updateUser
    try {
      updateUser = await User.findByIdAndUpdate(
        searchUser._id,
        {
          $set: {
            lastLogin: Date.now(),
            refreshToken: undefined,
          },
        },
        { new: true }
      ).select("-password -refreshToken");
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to update user"}`)
    }
    if(!updateUser){
      throw new ApiError(500, "DbError :  User not updated")
    }
    // Return success response with cookie and user details
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, updateUser, "successMessage : User Login successfully"));
  }
});

export const logOutUser = asyncHandler(async (req, res) => {
  /**
   * check user in login
   * match userId from params
   * clear all cookies
   * return responce
   */

  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "LoginError : UserId not available")
  }
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params.userId !== req.userId){
    throw new ApiError(409, "AuthError : Unaurthorize access")
  }
  try {
    // Clear refresh token in database
    await User.findByIdAndUpdate(req.userId, {
      $set: {
        refreshToken: undefined,
      },
    }).select("-password");
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update user"}`)
  }

  // Return success response and clear cookies
  if(cookies["refreshToken"]){
    res.clearCookie("refreshToken", RefreshTokenCookieOption)
  }
  return res
    .status(200)
    .clearCookie("accessToken", AccessTokenCookieOption)
    .json(new ApiResponse(200, {}, "successMessage : User logged out successfully"));
});

export const setAvtar = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check file is locally uploded
   * upload file in cloudinary
   * save cloudinary url in db
   * return responce
   */
  
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "LoginError : UserId not available")
  }
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params.userId !== req.userId){
    throw new ApiError(409, "AuthError : Unaurthorize access")
  }
  if(!req.file){
    throw new ApiError(400, "MulterError : file path not received")
  }
  const localAvatarPath = req.file?.path;

  // Check if file path exists
  if (!localAvatarPath) {
    throw new ApiError(404, "MulterError : File path not available");
  }

  // Upload file to Cloudinary
  let response
  try {
    response = await uploadFileToCloudinary(localAvatarPath);
  } catch (error) {
    throw new ApiError(500, `CloudinaryError :${error.message || "Unable to upload file on cloudinary"}`)
  }

  // Check if file upload was successful
  if (!response) {
    throw new ApiError(500, "CloudinaryError : file not uploaded");
  }
  let searchUser
  try {
    searchUser = await User.findById(req.userId).select("-Password")
  } catch (error) {
    throw new ApiError(500, `DbError :${error.message || "unable to find user"}`)
  }
  if(!searchUser){
    throw new ApiError(500, "DbError : User not found")
  }
  if(searchUser.avatar !== process.env.DEFAULT_USER_AVATAR_CLOUDINARY_URL){
    let removeAvatarResponse
    try {
      removeAvatarResponse = await RemoveFileFromCloudinary(searchUser.avatar)
    } catch (error) {
      throw new ApiError(500, `CloudinaryError :${error.message || "Unable to remove file on cloudinary"}`)
    }
    if(!removeAvatarResponse){
      throw new ApiError(500, "CloudinaryError : file not removed")
    }
  }

  let updateUser
  try {
    // Update user avatar URL in database
    updateUser = await User.findByIdAndUpdate(
      searchUser._id,
      {
        $set: {
          avatar: response.url,
        },
      },
      { new: true }
    ).select("-password");
  } catch (error) {
    throw new ApiError(500, `DbError :${error.message || "unable to update user"}`)
  }
  if(!updateUser){
    throw new ApiError(500, "DbError : User not update")
  }
  // Return success response with updated user avatar
  return res
  .status(200)
  .json(new ApiResponse(200, updateUser, "UserAvatar set successfully"));
});

export const removeAvatar = asyncHandler(async (req, res) => {
  /**
   * check user login
   * check avatar is not default
   * set defalt avatar in User db
   * remove Avatar from cloudinary
   * return responce
   */
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "LoginError : UserId not available")
  }
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params.userId !== req.userId){
    throw new ApiError(409, "AuthError : Unaurthorize access")
  }
  let searchUser
  try {
    searchUser = await User.findById(req.userId).select("-Password")
  } catch (error) {
    throw new ApiError(500, `DbError :${error.message || "unable to find user"}`)
  }
  if(!searchUser){
    throw new ApiError(500, "DbError : User not found")
  }
  if(searchUser.avatar === process.env.DEFAULT_USER_AVATAR_CLOUDINARY_URL){
    throw new ApiError(409, "DataError : Default Avatar not allowed to removed")
  }

  let removeAvatarResponse
  try {
    removeAvatarResponse = await RemoveFileFromCloudinary(searchUser.avatar)
  } catch (error) {
    throw new ApiError(500, `CloudinaryError :${error.message || "Unable to remove file on cloudinary"}`)
  }
  if(!removeAvatarResponse){
    throw new ApiError(500, "CloudinaryError : file not removed")
  }
    
  let updateUser
  try {
    // Update user avatar URL in database
    updateUser = await User.findByIdAndUpdate(
      searchUser._id,
      {
        $set: {
          avatar: process.env.DEFAULT_USER_AVATAR_CLOUDINARY_URL,
        },
      },
      { new: true }
    ).select("-password");
  } catch (error) {
    throw new ApiError(500, `DbError :${error.message || "unable to update user"}`)
  }
  if(!updateUser){
    throw new ApiError(500, "DbError : User not update")
  }
  // Return success response with updated user avatar
  return res
  .status(200)
  .json(new ApiResponse(200, updateUser, "UserAvatar remove successfully"));
})

export const updateUserData = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check userid in params and validate its
   * check data received from body
   * validate data
   * search and update user
   * return responce with new data
   */
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "LoginError : UserId not available")
  }
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params.userId !== req.userId){
    throw new ApiError(409, "AuthError : Unaurthorize access")
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "DataError : No data received");
  }

  // Destructure email and fullName from request body
  const {fullName, email} = req.body;

  // Validate that email and fullName are provided and not empty
  if ([fullName, email].some(field => field === undefined)){
    throw new ApiError(404, "DataError : All fields are required");
  }
  if ([fullName, email].some(field => field?.toString().trim() === "")) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  
  if(isSpace(email)){
    throw new ApiError(400, "DataError : Invalid fields")
  }
  let updateUser
  try {
    // Update user data by ID and return the updated document
    updateUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          fullName, email
        },
      },
      { new: true }
    ).select("-password -refreshToken");
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update user"}`)
  }

  // Check if user data was not updated in the database
  if (!updateUser) {
    throw new ApiError(500, "DbError : User not update")
  }

  // Return success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, updateUser, "User data updated successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check data received from body
   * varify old password and update new password 
   * clear all cookies and return responce
   */

  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "LoginError : UserId not available")
  }
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params.userId !== req.userId){
    throw new ApiError(409, "AuthError : Unaurthorize access")
  }

  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No Data received");
  }
   const {oldPassword, newPassword} = req.body
   if([oldPassword, newPassword].some(field => field === undefined)){
    throw new ApiError(404, "DataError : All fields are required");
   }
   if([oldPassword, newPassword].some(field => field?.toString().trim() === "")){
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  // Find user by ID and exclude password and refreshToken from the result
  let userData
  try {
    userData = await User.findById(req.userId).select(
      "-password -refreshToken"
    );
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find user"}`)
  }

  // Check if user data retrieval failed
  if (!userData) {
    throw new ApiError(409, "DataError : User not exists");
  }

  try {
    // Set new password and save user data
    userData.password = newPassword;
    await userData.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update password"}`);
  }

  // Return success response
  if(cookies["refreshToken"]){
    res.clearCookie("refreshToken", RefreshTokenCookieOption)
  }
  return res
    .status(200)
    .clearCookie("accessToken", AccessTokenCookieOption)
    .json(new ApiResponse(200, {}, "successMessage : Password Change successfully"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  /**
   * check user login
   * match user id from params
   * delete user
   * clear cookies return responce
   */

  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "LoginError : UserId not available")
  }
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params.userId !== req.userId){
    throw new ApiError(409, "AuthError : Unaurthorize access")
  }

  try {
    // Attempt to delete the user by ID
    await User.findByIdAndDelete(req.userId);
  } catch (error) {
    // Handle any errors that occur during deletion
    throw new ApiError(500, `DbError : ${error.message || "Unable to delete user"}`);
  }

  // Check if the user was not deleted from the database
  if (await User.findById(req.userId)){
    throw new ApiError(500, "DbError : User not deleted");
  }

  // Return success response indicating user was deleted
  if(cookies["refreshToken"]){
    res.clearCookie("refreshToken", RefreshTokenCookieOption)
  }
  return res
    .status(200)
    .clearCookie("accessToken", AccessTokenCookieOption)
    .json(new ApiResponse(200, {}, "SuccessMessage : User Deleted successfully"));
});

export const addAddress = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * match userId from params
   * check data received from body
   * make address object and push in user address array
   * return responce
   */

  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "LoginError : UserId not available")
  }
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params.userId !== req.userId){
    throw new ApiError(409, "AuthError : Unaurthorize access")
  }

  if(!req.body){
    throw new ApiError(404, "DataError : No any data received");
  }

  const { name, area, city, state, pincode, conutry } = req.body;

  // Check if any field is empty
  if (
    [name, area, city, state, pincode, conutry ].some(
      (field) => field === undefined )
  ) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  if (
    [name, area, city, state, pincode, conutry ].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  let userData
  try {
    userData = await User.findById(req.userId).select("-password -refreshToken")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find user"}`)
  }
  if(!userData){
    throw new ApiError(409, "DataError : User not exists");
  }
   const addressObject = {
    name, area, city, state, pincode, conutry 
   }
   let updateUser
  try {
    updateUser = await User.findByIdAndUpdate(userData._id, {
      $push : {address : addressObject}
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update user"}`);
  }
  if(!updateUser){
    throw new ApiError(500, "DbError : User not updated")
  }

  // Return success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, updateUser, "successMessage: Address added sussfully"));
});

export const removeAddress = asyncHandler(async (req, res) => {
  /**
     * check user is login
     * check userId and addressId from params
     * serch user
     * search address and remove address
     * return responce
     */

  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "LoginError : UserId not available")
  }
  if(!req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params.userId !== req.userId){
    throw new ApiError(409, "AuthError : Unaurthorize access")
  }
  if(!req.params?.addressId){
    throw new ApiError(404, "DataError : AddressId not received from params")
  }

  let searchUser
  try {
    searchUser = await User.findById(req.userId).select("-password -refreshToken")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find user"}`)
  }
  if(!searchUser){
    throw new ApiError(409, "DataError : User not exists");
  }
  
  if(!(searchUser.address.find(objectId => objectId._id?.toString() === req.params?.addressId))){
    throw new ApiError(404, "DataEror : Address not found")
  }
  try {
    const newAddressArray = searchUser.address.filter(objectId => objectId._id?.toString() !== req.params?.addressId)
    searchUser.address = newAddressArray
    await searchUser.save({validateBeforeSave: false})
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update address array"}`)
  }
  if(searchUser.address.find(objectId => objectId._id?.toString() === req.params?.addressId)){
    throw new ApiError(500, "DbError : address not removed")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, searchUser, "successMessage : address removed successfully"))
})
