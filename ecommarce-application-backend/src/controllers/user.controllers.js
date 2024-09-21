import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/users/user.models.js";
import { accessAndRefreshTokenGenrator } from "../utils/accessRefreshTokenGenrator.js";
import { uploadFileToCloudinary } from "../utils/cloudinary.js";

export const userRegister = asyncHandler(async (req, res) => {
  // Register user:
  // 1. Validate data (check if data is provided and if user already exists)
  // 2. Store data in the server
  // 3. Save data to the database

  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No data received");
  }

  // Destructure user details from request body
  const { username, fullName, email, password } = req.body;

  // Check if any field is empty
  if (
    [username, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if username already exists
  if (await User.findOne({ username })) {
    throw new ApiError(409, "Username already exists");
  }

  // Create new user
  const newUser = await User.create({
    username,
    fullName,
    email,
    password,
  });

  // Retrieve newly created user without password, refreshToken, and __v fields
  const newCreatedUser = await User.findById(newUser._id).select(
    "-password -refreshToken -__v"
  );

  // Check if user creation failed
  if (!newCreatedUser) {
    throw new ApiError(500, "Unfortunately, user not created");
  }

  console.log("statusCode: 201 - user registered successfully");

  // Return success response with new user data
  return res
    .status(201)
    .json(new ApiResponse(200, newCreatedUser, "User registered successfully"));
});

export const userLogin = asyncHandler(async (req, res) => {
  // User login:
  // 1. Validate data from front-end (username, password)
  // 2. Check if username exists
  // 3. Verify password
  // 4. Generate access token and login permission

  // Check if request body is empty
  if (!req.body) {
    throw ApiError(400, "No data received");
  }

  // Destructure login details from request body
  const { username, password, saveInfo } = req.body;

  // Check if any field is empty
  if (
    [username, password, saveInfo].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Find user by username
  const searchUser = await User.findOne({ username });

  // Check if user does not exist
  if (!searchUser) {
    throw new ApiError(409, "User not exists");
  }

  // Verify password
  if (!(await searchUser.isPasswordCorrect(password))) {
    throw new ApiError(400, "Incorrect password");
  }

  if (saveInfo) {
    // Generate refresh and access tokens
    const { refreshToken, accessToken } =
      await accessAndRefreshTokenGenrator(searchUser);

    // Update user details with last login time and refresh token
    const userDetails = await User.findByIdAndUpdate(
      searchUser._id,
      {
        $set: {
          lastLogin: Date.now(),
          refreshToken: refreshToken,
        },
      },
      { new: true }
    ).select("-password");

    const options = {
      httpOnly: true,
      secure: true,
    };

    console.log(`status: 200 - login successfully`);

    // Return success response with cookies and user details
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, userDetails, "Login successfully"));
  } else {
    // Generate access token
    const accessToken = await searchUser.generateAccessToken();

    // Update user details with last login time and remove refresh token
    const userDetails = await User.findByIdAndUpdate(
      searchUser._id,
      {
        $set: {
          lastLogin: Date.now(),
          refreshToken: undefined,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true,
    };

    console.log(`status: 200 - login successfully`);

    // Return success response with cookie and user details
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, userDetails, "Login successfully"));
  }
});

export const logOutUser = asyncHandler(async (req, res) => {
  // User logout:
  // 1. Check if user is logged in using auth middleware
  // 2. Retrieve user ID from middleware and clear refresh token in database
  // 3. Remove all cookies

  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "Seller not Authenticate")
  }

  try {
    // Clear refresh token in database
    await User.findByIdAndUpdate(req.userId, {
      $set: {
        refreshToken: null,
      },
    }).select("-password");
  } catch (error) {
    throw ApiError(500, error?.message || "Server not connected with database");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  // Return success response and clear cookies
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});


export const setAvtar = asyncHandler(async (req, res) => {
  // Retrieve data by req.userId
  // Retrieve file server path by multer middleware
  // Upload the file to Cloudinary and save URL on user

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(400, "User not Authenticate");
  }

  console.log(req.file);
  const localAvatarPath = req.file?.path;

  // Check if file path exists
  if (!localAvatarPath) {
    throw new ApiError(404, "File not exits");
  }

  // Upload file to Cloudinary
  const response = await uploadFileToCloudinary(localAvatarPath);

  // Check if file upload was successful
  if (!response) {
    throw new ApiError(500, "Unfortunately, file not uploaded successfully!!");
  }

  console.log(response);
  try {
    // Update user avatar URL in database
    await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          avatar: response.url,
        },
      },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, error?.message || "Server DB connection error");
  }

  // Retrieve updated user data without password and refreshToken fields
  const userAvatar = await User.findById(req.userId).select(
    "-password -refreshToken"
  );

  // Return success response with updated user avatar
  return res.status(200).json(new ApiResponse(200, { userAvatar }, ""));
});

export const addAddress = asyncHandler(async (req, res) => {
  // Add address

  // Destructure address details from request body
  const { area, city, state, pincode } = req.body;

  // Check if any field is empty
  if (
    [area, city, state, pincode].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    // Retrieve user address from database
    const userAddress = await User.findById(req.userId).select("address");

    // Add new address to user's address array
    userAddress.address.push({ area, city, state, pincode });
    userAddress.save({ validateBeforeSave: false, new: true });
  } catch (error) {
    throw new ApiError(500, error || "Address not set");
  }

  // Retrieve updated user data without password and refreshToken fields
  const searchUser = await User.findById(req.userId).select(
    "-password -refreshToken"
  );

  // Return success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, searchUser, "Message: Address added sussfully"));
});


export const addProductOnCart = asyncHandler(async (req, res) => {
  // Add product to cart

  // Destructure address details from request body
  const { area, city, state, pincode } = req.body;

  // Check if any field is empty
  if (
    [area, city, state, pincode].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    // Retrieve user address from database
    const userAddress = await User.findById(req.userId).select("address");

    // Add new address to user's address array
    userAddress.address.push({ area, city, state, pincode });
    userAddress.save({ validateBeforeSave: false, new: true });
  } catch (error) {
    throw new ApiError(500, error || "Address not set");
  }

  // Retrieve updated user data without password and refreshToken fields
  const searchUser = await User.findById(req.userId).select(
    "-password -refreshToken"
  );

  // Return success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, searchUser, "Message: done"));
});


export const addProductOnWiselist = asyncHandler(async (req, res) => {
  // Add product to wishlist

  // Destructure address details from request body
  const { area, city, state, pincode } = req.body;

  // Check if any field is empty
  if (
    [area, city, state, pincode].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    // Retrieve user address from database
    const userAddress = await User.findById(req.userId).select("address");

    // Add new address to user's address array
    userAddress.address.push({ area, city, state, pincode });
    userAddress.save({ validateBeforeSave: false, new: true });
  } catch (error) {
    throw new ApiError(500, error || "Address not set");
  }

  // Retrieve updated user data without password and refreshToken fields
  const searchUser = await User.findById(req.userId).select(
    "-password -refreshToken"
  );

  // Return success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, searchUser, "Message: done"));
});


export const updateUserData = asyncHandler(async (req, res) => {
  // user Id
  // user new data -> email, fullName
  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(400, "User not Authenticate");
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
    // Update user data by ID and return the updated document
    const updatedUser = await User.findByIdAndUpdate(
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
    throw new ApiError(500, "User data not updated");
  }

  // Check if user data was not updated in the database
  if (!updatedUser) {
    throw new ApiError(500, "User data not updated in Database");
  }

  // Return success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User data updated successfully"));
});

export const updatePassword = asyncHandler(async (req, res) => {
  // user, userId (authentication not required)
  // match user details
  // old password
  // match password
  // set new password
  // return data

  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No any Data received");
  }

  // Destructure userId, oldPassword, and newPassword from request body
  const [userId, oldPassword, newPassword] = req.body;

  // Validate that all fields are provided and not empty
  if (
    [userId, oldPassword, newPassword].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields is required");
  }

  // Find user by ID and exclude refreshToken from the result
  const userData = await User.findById({ _id: userId }).select("-refreshToken");

  // Check if user data exists
  if (!userData) {
    throw new ApiError(409, "Invalid userId Or UserId Not Exits");
  }

  try {
    // Check if the old password is correct
    const checkOldPassword = await userData.isPasswordCorrect(oldPassword);
  } catch (error) {
    throw new ApiError(500, "Password checking failed");
  }
  if (!checkOldPassword) {
    throw new ApiError(409, "Incorrect Old password");
  }

  try {
    // Set new password and save user data
    userData.password = newPassword;
    userData.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to Update new password");
  }

  // Return success response
  return res.status(200).json(200, {}, "Password updated successfully");
});

export const changePassword = asyncHandler(async (req, res) => {
  // user login required
  // user id
  // body - newPassword
  // set password

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(400, "User not Authenticate");
  }

  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No Data received");
  }

  // Find user by ID and exclude password and refreshToken from the result
  const userData = await User.findById(req.userId).select(
    "-password -refreshToken"
  );

  // Check if user data retrieval failed
  if (!userData) {
    throw new ApiError(500, "User Data retrieved failed");
  }

  try {
    // Set new password and save user data
    userData.password = newPassword;
    userData.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, error.message || "User password not change");
  }

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Change successfully"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  // user id
  // delete
  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(400, "User not Authenticate");
  }
  try {
    // Attempt to delete the user by ID
    const deletedUser = await User.findByIdAndDelete(req.userId);
  } catch (error) {
    // Handle any errors that occur during deletion
    throw new ApiError(500, error.message || "Failed to delete user");
  }

  // Check if the user was not deleted from the database
  if (!deletedUser) {
    throw new ApiError(500, "Failed to delete user from Database");
  }

  // Return success response indicating user was deleted
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User Successfully Deleted"));
});
