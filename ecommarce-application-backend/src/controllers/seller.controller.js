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
import accessAndRefreshTokenGenerator from "../utils/accessRefreshTokenGenerator.js";
import {
  uploadFileToCloudinary,
  RemoveFileFromCloudinary,
} from "../utils/cloudinary.js";
import {
  AccessTokenCookieOption,
  RefreshTokenCookieOption,
} from "../constants.js";
import { isSpace } from "../utils/customMethods.js";

export const sellerRegister = asyncHandler(async (req, res) => {
  /**
   * validate seller not login already
   * varidate received data from body
   * make new seller and save in seller db collection
   * validate create seller
   * return responce with new seller
   */

  if (req.userId) {
    throw new ApiError(
      400,
      "AuthError : seller already login, please logout or clear cookies"
    );
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received");
  }

  // Destructure seller details from request body
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
  if ([userName, email].some((field) => isSpace(field) === true)) {
    throw new ApiError(400, "DataError : Invalid fields");
  }
  // Check if userName already exists
  if (await Seller.findOne({ userName })) {
    throw new ApiError(409, "DataError : userName already exists");
  }

  // Create new seller
  let newSeller;
  try {
    newSeller = await Seller.create({
      userName,
      fullName,
      email,
      password,
    });
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to create new seller"}`
    );
  }

  if (!newSeller) {
    throw new ApiError(500, "DbError : New seller not created");
  }

  // Retrieve newly created seller without password and refreshToken
  let newCreatedSeller;
  try {
    newCreatedSeller = await Seller.findById(newSeller._id).select(
      "-password -refreshToken"
    );
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to find new created seller"}`
    );
  }

  // Check if seller creation failed
  if (!newCreatedSeller) {
    throw new ApiError(500, "DbError : created seller not found");
  }

  // Return success response with new seller data
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        newCreatedSeller,
        "successMessage : Seller registered successfully"
      )
    );
});

export const sellerLogin = asyncHandler(async (req, res) => {
  /**
   * check seller already login
   * validate data from body
   * validate data from database
   * genrete access, refreshtoken
   * save refresh token in db
   * store access, refreshtoken in cookie
   * return responce
   */
  if (req.userId) {
    throw new ApiError(
      401,
      "AuthError : Seller already login, please logout or clear cookies"
    );
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received");
  }

  // Destructure login details from request body
  const { userName, password, saveInfo } = req.body;

  // Check if any field is empty
  if ([userName, password].some((field) => field === undefined)) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  if (
    [userName, password].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  if (isSpace(userName)) {
    throw new ApiError(400, "DataError : Invalid fields");
  }
  // Find seller by userName
  let searchSeller;
  try {
    searchSeller = await Seller.findOne({ userName });
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "unable to find seller"}`
    );
  }

  // Check if seller does not exist
  if (!searchSeller) {
    throw new ApiError(409, "DataError : Seller not exists");
  }

  // Verify password
  if (!(await searchSeller.isPasswordCorrect(password))) {
    throw new ApiError(400, "DataError : Incorrect password");
  }

  if (saveInfo) {
    // Generate refresh and access tokens
    let tokens;
    try {
      tokens = await accessAndRefreshTokenGenerator(searchSeller);
    } catch (error) {
      throw new ApiError(
        500,
        `DbError :${error.message || "Unable to generate seller tokens"}`
      );
    }
    if (!tokens) {
      throw new ApiError(500, "DbError : Seller Token not generated");
    }

    const { accessToken, refreshToken } = tokens;
    if ([accessToken, refreshToken].some((field) => field === undefined)) {
      throw new ApiError(500, "DbError : Seller Token not available");
    }
    if (
      [accessToken, refreshToken].some(
        (field) => field?.toString().trim() === ""
      )
    ) {
      throw new ApiError(500, "DbError : Seller Token not available");
    }

    // Update seller details with last login time and refresh token
    let updateSeller;
    try {
      updateSeller = await Seller.findByIdAndUpdate(
        searchSeller._id,
        {
          $set: {
            lastLogin: Date.now(),
            refreshToken,
          },
        },
        { new: true }
      ).select("-password");
    } catch (error) {
      throw new ApiError(
        500,
        `DbError :${error.message || "unable to update seller"}`
      );
    }
    if (!updateSeller) {
      throw new ApiError(500, "DbError : Seller not update");
    }
    // Return success response with cookies and seller details
    return res
      .status(200)
      .cookie("accessToken", accessToken, AccessTokenCookieOption)
      .cookie("refreshToken", refreshToken, RefreshTokenCookieOption)
      .json(
        new ApiResponse(
          200,
          updateSeller,
          "successMessage : Seller Login successfully"
        )
      );
  } else {
    // Generate access token
    let accessToken;
    try {
      accessToken = await searchSeller.generateAccessToken();
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to generated Seller access Token"}`
      );
    }
    if (!accessToken) {
      throw new ApiError(500, "DbError : Seller Token not generated");
    }
    // Update seller details with last login time and remove refresh token
    let updateSeller;
    try {
      updateSeller = await Seller.findByIdAndUpdate(
        searchSeller._id,
        {
          $set: {
            lastLogin: Date.now(),
            refreshToken: undefined,
          },
        },
        { new: true }
      ).select("-password -refreshToken");
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to update seller"}`
      );
    }
    if (!updateSeller) {
      throw new ApiError(500, "DbError :  Seller not updated");
    }
    // Return success response with cookie and seller details
    return res
      .status(200)
      .cookie("accessToken", accessToken, AccessTokenCookieOption)
      .json(
        new ApiResponse(
          200,
          updateSeller,
          "successMessage : Seller Login successfully"
        )
      );
  }
});

export const sellerLoginWithEmail = asyncHandler(async (req, res) => {
  /**
   * check seller already login
   * validate data from body
   * validate data from database
   * genrete access, refreshtoken
   * save refresh token in db
   * store access, refreshtoken in cookie
   * return responce
   */
  if (req.userId) {
    throw new ApiError(
      401,
      "AuthError : Seller already login, please logout or clear cookies"
    );
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received");
  }

  // Destructure login details from request body
  const { email, fullName, password, saveInfo } = req.body;

  // Check if any field is empty
  if (
    [email, fullName, password].some((field) => field === undefined)
  ) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  if (
    [email, fullName, password].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }

  if (isSpace(email)) {
    throw new ApiError(400, "DataError : Invalid fields");
  }
  // Find seller by email
  let searchSeller;
  try {
    searchSeller = await Seller.findOne({ email });
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "unable to find seller"}`
    );
  }

  if (!searchSeller) {
    throw new ApiError(409, "DataError : Seller not exists");
  }
  if(searchSeller.fullName !== fullName){
    throw new ApiError(400, "DataError : Data not correct")
  }
  // Verify password
  if (!(await searchSeller.isPasswordCorrect(password))) {
    throw new ApiError(400, "DataError : Incorrect password");
  }

  if (saveInfo) {
    // Generate refresh and access tokens
    let tokens;
    try {
      tokens = await accessAndRefreshTokenGenerator(searchSeller);
    } catch (error) {
      throw new ApiError(
        500,
        `DbError :${error.message || "Unable to generate seller tokens"}`
      );
    }
    if (!tokens) {
      throw new ApiError(500, "DbError : Seller Token not generated");
    }

    const { accessToken, refreshToken } = tokens;
    if ([accessToken, refreshToken].some((field) => field === undefined)) {
      throw new ApiError(500, "DbError : Seller Token not available");
    }
    if (
      [accessToken, refreshToken].some(
        (field) => field?.toString().trim() === ""
      )
    ) {
      throw new ApiError(500, "DbError : Seller Token not available");
    }

    // Update seller details with last login time and refresh token
    let updateSeller;
    try {
      updateSeller = await Seller.findByIdAndUpdate(
        searchSeller._id,
        {
          $set: {
            lastLogin: Date.now(),
            refreshToken,
          },
        },
        { new: true }
      ).select("-password");
    } catch (error) {
      throw new ApiError(
        500,
        `DbError :${error.message || "Unable to update seller"}`
      );
    }
    if (!updateSeller) {
      throw new ApiError(500, "DbError : Seller not update");
    }
    // Return success response with cookies and seller details
    return res
      .status(200)
      .cookie("accessToken", accessToken, AccessTokenCookieOption)
      .cookie("refreshToken", refreshToken, RefreshTokenCookieOption)
      .json(
        new ApiResponse(
          200,
          updateSeller,
          "successMessage : Seller Login successfully"
        )
      );
  } else {
    // Generate access token
    let accessToken;
    try {
      accessToken = await searchSeller.generateAccessToken();
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to generated Seller access Token"}`
      );
    }
    if (!accessToken) {
      throw new ApiError(500, "DbError : Seller Token not generated");
    }
    // Update seller details with last login time and remove refresh token
    let updateSeller;
    try {
      updateSeller = await Seller.findByIdAndUpdate(
        searchSeller._id,
        {
          $set: {
            lastLogin: Date.now(),
            refreshToken: undefined,
          },
        },
        { new: true }
      ).select("-password -refreshToken");
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to update seller"}`
      );
    }
    if (!updateSeller) {
      throw new ApiError(500, "DbError :  Seller not updated");
    }
    // Return success response with cookie and seller details
    return res
      .status(200)
      .cookie("accessToken", accessToken, AccessTokenCookieOption)
      .json(
        new ApiResponse(
          200,
          updateSeller,
          "successMessage : Seller Login successfully"
        )
      );
  }
});

export const logOutUser = asyncHandler(async (req, res) => {
  /**
   * check seller in login
   * match userId from params
   * clear all cookies
   * return responce
   */

  // Check if seller is authenticated
  if (!req.userId) {
    throw new ApiError(400, "LoginError : UserId not available");
  }
  if (!req.params?.userId) {
    throw new ApiError(404, "DataError : UserId not received from params");
  }
  if (req.params.userId !== req.userId) {
    throw new ApiError(409, "AuthError : Unaurthorize access");
  }
  try {
    // Clear refresh token in database
    await Seller.findByIdAndUpdate(req.userId, {
      $set: {
        refreshToken: undefined,
      },
    }).select("-password");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "unable to update seller"}`
    );
  }

  // Return success response and clear cookies
  if(req.cookies["refreshToken"]) {
    res.clearCookie("refreshToken", RefreshTokenCookieOption);
  }
  return res
    .status(200)
    .clearCookie("accessToken", AccessTokenCookieOption)
    .json(
      new ApiResponse(
        200,
        {},
        "successMessage : Seller logged out successfully"
      )
    );
});

export const setAvtar = asyncHandler(async (req, res) => {
  /**
   * check seller is login
   * check file is locally uploded
   * upload file in cloudinary
   * save cloudinary url in db
   * return responce
   */
  // Check if seller is authenticated
  if (!req.userId) {
    throw new ApiError(400, "LoginError : UserId not available");
  }
  if (!req.params?.userId) {
    throw new ApiError(404, "DataError : UserId not received from params");
  }
  if (req.params.userId !== req.userId) {
    throw new ApiError(409, "AuthError : Unaurthorize access");
  }
  if (!req.file) {
    throw new ApiError(400, "MulterError : file path not received");
  }
  const localAvatarPath = req.file?.path;

  // Check if file path exists
  if (!localAvatarPath) {
    throw new ApiError(404, "MulterError : File path not available");
  }

  // Upload file to Cloudinary
  let response;
  try {
    response = await uploadFileToCloudinary(localAvatarPath);
  } catch (error) {
    throw new ApiError(
      500,
      `CloudinaryError : ${error.message || "Unable to upload file on cloudinary"}`
    );
  }

  // Check if file upload was successful
  if (!response) {
    throw new ApiError(500, "CloudinaryError : file not uploaded");
  }
  let searchSeller;
  try {
    searchSeller = await Seller.findById(req.userId).select("-Password");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError :${error.message || "unable to find seller"}`
    );
  }
  if (!searchSeller) {
    throw new ApiError(500, "DbError : Seller not found");
  }
  if (searchSeller.avatar !== process.env.DEFAULT_USER_AVATAR_CLOUDINARY_URL) {
    let removeAvatarResponse;
    try {
      removeAvatarResponse = await RemoveFileFromCloudinary(
        searchSeller.avatar
      );
    } catch (error) {
      throw new ApiError(
        500,
        `CloudinaryError :${error.message || "Unable to remove file on cloudinary"}`
      );
    }
    if (!removeAvatarResponse) {
      throw new ApiError(500, "CloudinaryError : file not removed");
    }
  }

  let updateSeller;
  try {
    // Update seller avatar URL in database
    updateSeller = await Seller.findByIdAndUpdate(
      searchSeller._id,
      {
        $set: {
          avatar: response.url,
        },
      },
      { new: true }
    ).select("-password");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError :${error.message || "unable to update seller"}`
    );
  }
  if (!updateSeller) {
    throw new ApiError(500, "DbError : Seller not update");
  }
  // Return success response with updated seller avatar
  return res
    .status(200)
    .json(new ApiResponse(200, updateSeller, "UserAvatar set successfully"));
});

export const removeAvatar = asyncHandler(async (req, res) => {
  /**
   * check seller login
   * check avatar is not default
   * set defalt avatar in Seller db
   * remove Avatar from cloudinary
   * return responce
   */
  // Check if seller is authenticated
  if (!req.userId) {
    throw new ApiError(400, "LoginError : UserId not available");
  }
  if (!req.params?.userId) {
    throw new ApiError(404, "DataError : UserId not received from params");
  }
  if (req.params.userId !== req.userId) {
    throw new ApiError(409, "AuthError : Unaurthorize access");
  }
  let searchSeller;
  try {
    searchSeller = await Seller.findById(req.userId).select("-Password");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError :${error.message || "unable to find seller"}`
    );
  }
  if (!searchSeller) {
    throw new ApiError(500, "DbError : Seller not found");
  }
  if (searchSeller.avatar === process.env.DEFAULT_USER_AVATAR_CLOUDINARY_URL) {
    throw new ApiError(
      409,
      "DataError : Default Avatar not allowed to removed"
    );
  }

  let removeAvatarResponse;
  try {
    removeAvatarResponse = await RemoveFileFromCloudinary(searchSeller.avatar);
  } catch (error) {
    throw new ApiError(
      500,
      `CloudinaryError :${error.message || "Unable to remove file on cloudinary"}`
    );
  }
  if (!removeAvatarResponse) {
    throw new ApiError(500, "CloudinaryError : file not removed");
  }

  let updateSeller;
  try {
    // Update seller avatar URL in database
    updateSeller = await Seller.findByIdAndUpdate(
      searchSeller._id,
      {
        $set: {
          avatar: process.env.DEFAULT_USER_AVATAR_CLOUDINARY_URL,
        },
      },
      { new: true }
    ).select("-password");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError :${error.message || "unable to update seller"}`
    );
  }
  if (!updateSeller) {
    throw new ApiError(500, "DbError : Seller not update");
  }
  // Return success response with updated seller avatar
  return res
    .status(200)
    .json(new ApiResponse(200, updateSeller, "UserAvatar remove successfully"));
});

export const updateSellerData = asyncHandler(async (req, res) => {
  /**
   * check seller is login
   * check userid in params and validate its
   * check data received from body
   * validate data
   * search and update seller
   * return responce with new data
   */
  // Check if seller is authenticated
  if (!req.userId) {
    throw new ApiError(400, "LoginError : UserId not available");
  }
  if (!req.params?.userId) {
    throw new ApiError(404, "DataError : UserId not received from params");
  }
  if (req.params.userId !== req.userId) {
    throw new ApiError(409, "AuthError : Unaurthorize access");
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "DataError : No data received");
  }

  // Destructure email and fullName from request body
  const { fullName, email } = req.body;

  // Validate that email and fullName are provided and not empty
  if ([fullName, email].some((field) => field === undefined)) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  if ([fullName, email].some((field) => field?.toString().trim() === "")) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }

  if (isSpace(email)) {
    throw new ApiError(400, "DataError : Invalid fields");
  }
  let updateSeller;
  try {
    // Update seller data by ID and return the updated document
    updateSeller = await Seller.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          fullName,
          email,
        },
      },
      { new: true }
    ).select("-password -refreshToken");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "unable to update seller"}`
    );
  }

  // Check if seller data was not updated in the database
  if (!updateSeller) {
    throw new ApiError(500, "DbError : Seller not update");
  }

  // Return success response with updated seller data
  return res
    .status(200)
    .json(
      new ApiResponse(200, updateSeller, "Seller data updated successfully")
    );
});

export const changePassword = asyncHandler(async (req, res) => {
  /**
   * check seller is login
   * check data received from body
   * varify old password and update new password
   * clear all cookies and return responce
   */

  // Check if seller is authenticated
  if (!req.userId) {
    throw new ApiError(400, "LoginError : UserId not available");
  }
  if (!req.params?.userId) {
    throw new ApiError(404, "DataError : UserId not received from params");
  }
  if (req.params.userId !== req.userId) {
    throw new ApiError(409, "AuthError : Unaurthorize access");
  }

  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No Data received");
  }
  const { oldPassword, newPassword } = req.body;
  if ([oldPassword, newPassword].some((field) => field === undefined)) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  if (
    [oldPassword, newPassword].some((field) => field?.toString().trim() === "")
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  // Find seller by ID and exclude password and refreshToken from the result
  let userData;
  try {
    userData = await Seller.findById(req.userId).select(
      "-password -refreshToken"
    );
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "unable to find seller"}`
    );
  }

  // Check if seller data retrieval failed
  if (!userData) {
    throw new ApiError(409, "DataError : Seller not exists");
  }

  try {
    // Set new password and save seller data
    userData.password = newPassword;
    await userData.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to update password"}`
    );
  }

  // Return success response
  if(req.cookies["refreshToken"]) {
    res.clearCookie("refreshToken", RefreshTokenCookieOption);
  }
  return res
    .status(200)
    .clearCookie("accessToken", AccessTokenCookieOption)
    .json(
      new ApiResponse(200, {}, "successMessage : Password Change successfully")
    );
});

export const deleteUser = asyncHandler(async (req, res) => {
  /**
   * check seller login
   * match seller id from params
   * delete seller
   * clear cookies return responce
   */

  // Check if seller is authenticated
  if (!req.userId) {
    throw new ApiError(400, "LoginError : UserId not available");
  }
  if (!req.params?.userId) {
    throw new ApiError(404, "DataError : UserId not received from params");
  }
  if (req.params.userId !== req.userId) {
    throw new ApiError(409, "AuthError : Unaurthorize access");
  }

  try {
    // Attempt to delete the seller by ID
    await Seller.findByIdAndDelete(req.userId);
  } catch (error) {
    // Handle any errors that occur during deletion
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to delete seller"}`
    );
  }

  // Check if the seller was not deleted from the database
  if (await Seller.findById(req.userId)) {
    throw new ApiError(500, "DbError : Seller not deleted");
  }

  // Return success response indicating seller was deleted
  if(req.cookies["refreshToken"]) {
    res.clearCookie("refreshToken", RefreshTokenCookieOption);
  }
  return res
    .status(200)
    .clearCookie("accessToken", AccessTokenCookieOption)
    .json(
      new ApiResponse(200, {}, "SuccessMessage : Seller Deleted successfully")
    );
});

export const addAddress = asyncHandler(async (req, res) => {
  /**
   * check seller is login
   * match userId from params
   * check data received from body
   * make address object and push in seller address array
   * return responce
   */

  // Check if seller is authenticated
  if (!req.userId) {
    throw new ApiError(400, "LoginError : UserId not available");
  }
  if (!req.params?.userId) {
    throw new ApiError(404, "DataError : UserId not received from params");
  }
  if (req.params.userId !== req.userId) {
    throw new ApiError(409, "AuthError : Unaurthorize access");
  }

  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received");
  }

  const { name, area, city, state, pincode, country } = req.body;

  // Check if any field is empty
  if (
    [name, area, city, state, pincode, country].some(
      (field) => field === undefined
    )
  ) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  if (
    [name, area, city, state, pincode, country].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  let userData;
  try {
    userData = await Seller.findById(req.userId).select(
      "-password -refreshToken"
    );
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "unable to find seller"}`
    );
  }
  if (!userData) {
    throw new ApiError(409, "DataError : Seller not exists");
  }
  const addressObject = {
    name,
    area,
    city,
    state,
    pincode,
    country,
  };
  let updateSeller;
  try {
    updateSeller = await Seller.findByIdAndUpdate(userData._id, {
      $push: { address: addressObject },
    },{new : true}).select("-password -refreshToken");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to update seller"}`
    );
  }
  if (!updateSeller) {
    throw new ApiError(500, "DbError : Seller not updated");
  }

  // Return success response with updated seller data
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateSeller,
        "successMessage: Address added sussfully"
      )
    );
});

export const removeAddress = asyncHandler(async (req, res) => {
  /**
   * check seller is login
   * check userId and addressId from params
   * serch seller
   * search address and remove address
   * return responce
   */

  // Check if seller is authenticated
  if (!req.userId) {
    throw new ApiError(400, "LoginError : UserId not available");
  }
  if (!req.params?.userId) {
    throw new ApiError(404, "DataError : UserId not received from params");
  }
  if (req.params.userId !== req.userId) {
    throw new ApiError(409, "AuthError : Unaurthorize access");
  }
  if (!req.params?.addressId) {
    throw new ApiError(404, "DataError : AddressId not received from params");
  }

  let searchSeller;
  try {
    searchSeller = await Seller.findById(req.userId).select(
      "-password -refreshToken"
    );
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "unable to find seller"}`
    );
  }
  if (!searchSeller) {
    throw new ApiError(409, "DataError : Seller not exists");
  }

  if (
    !searchSeller.address.find(
      (objectId) => objectId._id?.toString() === req.params?.addressId
    )
  ) {
    throw new ApiError(404, "DataEror : Address not found");
  }
  try {
    const newAddressArray = searchSeller.address.filter(
      (objectId) => objectId._id?.toString() !== req.params?.addressId
    );
    searchSeller.address = newAddressArray;
    await searchSeller.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to update address array"}`
    );
  }
  if (
    searchSeller.address.find(
      (objectId) => objectId._id?.toString() === req.params?.addressId
    )
  ) {
    throw new ApiError(500, "DbError : address not removed");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        searchSeller,
        "successMessage : address removed successfully"
      )
    );
});
