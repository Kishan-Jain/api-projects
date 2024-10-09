/**
 * # user
 * give A single product order
 * give full cart product order
 * get order details for user
 * get all orders details
 * get all replase order details
 * get all return order details
 * get preticuler order details
 * write review on order and product
 * 
 * get all payment details
 * 
 * # seller
 * check order on product
 * manage order 
 */


import asyncHandler from "../utils/asyncHandler.js";
import { RemoveFileFromCloudinary, uploadFileToCloudinary, } from "../utils/cloudinary.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Product from "../models/products/product.models.js"
import Category from "../models/products/category.models.js";
import Seller from "../models/sellers/seller.models.js"
import User from "../models/users/user.models.js"


export const giveSigleProductOrder = asyncHandler(async (req, res) => {
  /**
   * check user is authenticate
   * varify userId 
   * varify product id
   * destract data from body
   * make order object and save
   * return responce
   */
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "User"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(400, "AuthError : Unaurthorize access");
}
if(req.params.productId){
  throw new ApiError(404, "DataError : productId not received from params")
}
// search user, product and seller
let searchUser, searchSeller, searchProduct
try {
  searchUser = await User.findById(req.userId)
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to find user"}`)
}
if(!searchUser){
  throw new ApiError(500, "DbError : user not found")
}
try {
  searchProduct = await Product.findById(req.params?.productId)
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to find product"}`)
}
if(!searchProduct){
  throw new ApiError(500, "DbError : product not found")
}
try {
  searchSeller = await Seller.findById(searchProduct?.sellerId)
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to find seller"}`)
}
if(!searchSeller){
  throw new ApiError(500, "DbError : seller not found")
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const getOrderDetails = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const getAllOrdersList = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const reviewOrderedProduct = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const returnOrder = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const replaseOrder = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const getReturnOrderDetails = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const getReplaceOrderDetails = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const getAllTypeOrdersList = asyncHandler(async (req, res) => {
 // Check if seller is authenticated
 if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
} 
})
export const getAllOrdersOfProduct = asyncHandler(async (req, res) => {
 // Check if seller is authenticated
 if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
} 
})
export const getOrderDetailsOfProduct = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const checkOrderStatus = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
export const changeOrderStatus = asyncHandler(async (req, res) => {
// Check if seller is authenticated
if (!req.userId) {
  throw new ApiError(400, "LoginError : UserId not available");
}
if(req.userType !== "Seller"){
  throw new ApiError(400, "LoginError : unaurthorize access")
}
if (!req.params?.userId) {
  throw new ApiError(404, "DataError : UserId not received from params");
}
if (req.params.userId !== req.userId) {
  throw new ApiError(409, "AuthError : Unaurthorize access");
}

// Check if request body is empty
if (!req.body) {
  throw new ApiError(400, "DataError : No Data received");
}
})
