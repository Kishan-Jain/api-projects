/**
 * Product Controller
 * - Add new Product
 * - get seller All product
 * - get perticuler product details for seller
 * - update product details by seller
 * - update stoke by seller and auto update when order
 * - remove product 
 * - get all product list for user by category
 * - get product details for user
 * - 
 * 
 */

import asyncHandler from "../utils/asyncHandler.js";
import { RemoveFileFromCloudinary, uploadFileToCloudinary, } from "../utils/cloudinary.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Product from "../models/products/product.models.js"
import Category from "../models/products/category.models.js";
import Seller from "../models/sellers/seller.models.js"

export const addNewProduct = asyncHandler( async(req, res) => {
  /**
   * check seller is login
   * check data is received from body
   * destruct data 
   * search seller
   * check category id and retreibe categoryName
   * check pics 
   */
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
  if(!req.file){
    throw new ApiError(400, "FileError : No file path received from multer")
  }
  const {title, description, categoryId, price, discount, stock} = req.body

  if ([title, description, categoryId, price, discount, stock].some((field) => field === undefined)) {
    throw new ApiError(404, "DataError : All fields are required");
  }
  if (
    [title, description, categoryId, price, discount, stock].some((field) => field?.toString().trim() === "")
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  const fileLocalPath = req.file?.path
  if(!fileLocalPath){
    throw new ApiError(404, "FileError : file path not received")
  }
  let cloudinaryResponce
  try {
    cloudinaryResponce = uploadFileToCloudinary(fileLocalPath)
  } catch (error) {
    throw new ApiError(500, `cloudinaryError : ${error.message || "unable to upload file in cloudinary"}`)
  }
  if(!cloudinaryResponce){
    throw new ApiError(500, "cloudinaryError : file not uploaded in cloudinary")
  }
  // make new product 
  let newProduct
  try {
    newProduct = await Product.create({
      title, description, categoryId, price, discount, stock,
      pic : cloudinaryResponce?.url,
      sellerId : req.userId
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message ||"unable to create new product"}`)    
  }
  if(!newProduct){
    throw new ApiError(500, "DbError : product not created")
  }
  // varify new created product
  let searchNewCreatedProduct 
  try {
    searchNewCreatedProduct = await Product.findById(newProduct._id)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find new created product"}`)
  }
  if(!searchNewCreatedProduct){
    throw new ApiError(500, "DbError : new product not found")
  }

  // push productId in seller collection
  let updateSeller
  try {
    updateSeller = await Seller.findByIdAndUpdate(req.userId, {
      $push : {
        productList : searchNewCreatedProduct._id
      }
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update seller"}`)
  }
  if(!updateSeller){
    throw new ApiError(500, "DbError : seller not updated")
  }
  return res
  .status(201)
  .json(new ApiResponse(200, searchNewCreatedProduct, "successMessage : product add successfully"))
})

export const getProductDetailsForSeller = asyncHandler(async (req, res) => {
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
  if(req.params?.productId){
    throw new ApiError(404, "DataError : productId not received from params")
  }
  let searchSeller
  try {
    searchSeller = await Seller.findById(req.userId).select("productList")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find seller"}`)
  }
  if(!searchSeller){
    throw new ApiError(500, "Dberror : seller not found")
  }
  if(!(searchSeller.productList.find(objectId =>objectId._id.toString() === req.params?.productId))){
    throw new ApiError(500, "DataError : Product Id not exits in seller product list")
  }
  // search product
  let searchProduct
  try {
    searchProduct = await Product.findById(req.params?.productId)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find product"}`)
  }
  if(!searchProduct){
    throw new ApiError(500, "DbError : productId not correct")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, searchProduct, "successMessage : Product Details reteived"))
})

export const getAllProductsForSeller = asyncHandler( async(req, res) => {
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
  // search seller
  let searchSeller
  try {
    searchSeller = await Seller.findById(req.userId).select("productList")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to search seller"}`)
  }
  if(!searchSeller){
    throw new ApiError(500, "DbError : seller not find")
  }
  let productListObJect
  try {
    productListObJect = await Product.find({sellerId : searchSeller._id}).select("-description -sellerId -reviewList")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find products"}`)
  }
  if(!productListObJect){
    throw new ApiError(500, "DbError : no any Product found")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, productListObJect, "successMessage : Seller All project received"))
})

export const updateProductDetails = asyncHandler( async(req, res) => {
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

  if(req.params?.productId){
    throw new ApiError(404, "DataError : product id not received from params")
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "DataError : No Data received");
  }
  if([req.body.pic, req.body.sellerId, req.body.reviewList].some(field = field !== undefined)){
    throw new ApiError(400, "DataError : field not allowed to make change")
  }
  let searchSeller
  try {
    searchSeller = await Seller.findById(req.userId).select("productList")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find seller"}`)
  }
  if(!searchSeller){
    throw new ApiError(500, "DbError : seller not find")
  }
  if(!(searchSeller.productList.find(objectId => objectId.id.toString() !== req.params?.productId))){
    throw new ApiError(500, "DataError : Product Id not exits in seller product list")
  }
  let updateProduct
  try {
    updateProduct = await Product.findByIdAndUpdate(req.params?.productId, {
      $set : req.body
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update product"}`)
  }
  if(!updateProduct){
    throw new ApiError(500, "DbError : product not updated")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, updateProduct, "successMessage : product details updated successfully"))
})

export const changeProductPic = asyncHandler(async (req, res) => {
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

if(req.params?.productId){
  throw new ApiError(404, "DataError : product id not received from params")
}
if(!req.file){
  throw new ApiError(404, "FileError : File not found")
}
const fileLocalPath = req.file?.path
if(!fileLocalPath){
  throw new ApiError(404, "FileError : file path not received")
}
let searchSeller
  try {
    searchSeller = await Seller.findById(req.userId).select("productList")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find seller"}`)
  }
  if(!searchSeller){
    throw new ApiError(500, "DbError : seller not find")
  }
  if(!(searchSeller.productList.find(objectId => objectId.id.toString() !== req.params?.productId))){
    throw new ApiError(500, "DataError : Product Id not exits in seller product list")
  }
  let searchProduct
  try {
    searchProduct = await Product.findById(req.params?.productId)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find product"}`)
  }
  if(!searchProduct){
    throw new ApiError(500, "DbError : product not found")
  }
  let cloudinaryResponce
  try {
    cloudinaryResponce = uploadFileToCloudinary(fileLocalPath)
  } catch (error) {
    throw new ApiError(500, `CloudinaryError : ${error.message || "Unable to upload file on cloudinary"}`)
  }
  if(!cloudinaryResponce){
    throw new ApiError(500, "CloudinaryError : file not upload on cloudinary")
  }
  let removeFileResponce
  try {
    removeFileResponce = RemoveFileFromCloudinary(searchProduct.pic)
  } catch (error) {
    throw new ApiError(500, `CloudinaryError : ${error.message || "unable to remove file from cloudinary"}`)
  }
  if(!removeFileResponce){
    throw new ApiError(500, "CloudinaryError : file not remove from cloudinary")
  }
  let updateProduct
  try {
    updateProduct = await Product.findByIdAndUpdate(req.params?.productId, {
      $set : {pic : cloudinaryResponce?.url}
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update product"}`)
  }
  if(!updateProduct){
    throw new ApiError(500, "DbError : product not updated")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, updateProduct, "successMessage : product pic changes successfully"))
})

export const updateStoke = asyncHandler( async(req, res) => {
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
  if(req.params?.productId){
    throw new ApiError(404, "DataError : product id not received from params")
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No Data received");
  }
  const {stock} = req.body
  if(!(stock && stock.toString().trim() !== "")){
    throw new ApiError(400, "DataError : field is required")
  }
  let searchSeller
  try {
    searchSeller = await Seller.findById(req.userId).select("productList")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find seller"}`)
  }
  if(!searchSeller){
    throw new ApiError(500, "DbError : seller not find")
  }
  if(!(searchSeller.productList.find(objectId => objectId.id.toString() !== req.params?.productId))){
    throw new ApiError(500, "DataError : Product Id not exits in seller product list")
  }
  
  let updateProduct
  try {
    updateProduct = await Product.findByIdAndUpdate(req.params?.productId, {
      $set : { stock }
    },{new:true})
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update product"}`)
  }
  if(!updateProduct){
    throw new ApiError(500, "DbError : Product not updated")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, updateProduct, "successMessage : product stock updated successfully"))
})

export const deleteProduct = asyncHandler( async(req, res) => {
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
  
  if(req.params?.productId){
    throw new ApiError(404, "DataError : product id not received from params")
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No Data received");
  }
  let searchSeller
  try {
    searchSeller = await Seller.findById(req.userId).select("productList")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find seller"}`)
  }
  if(!searchSeller){
    throw new ApiError(500, "DbError : seller not find")
  }
  if(!(searchSeller.productList.find(objectId => objectId.id.toString() !== req.params?.productId))){
    throw new ApiError(500, "DataError : Product Id not exits in seller product list")
  }
  let searchProduct
  try {
    searchProduct = await Product.findById(req.params?.productId)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find product"}`)
  }
  if(!searchProduct){
    throw new ApiError(500, "DbError : product Id not correct")
  }
  try {
    await Product.findByIdAndDelete(searchProduct._id)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to delete product"}`)
  }
  if(await Product.findById(searchProduct._id)){
    throw new ApiError(500, "DbError : Product not deleted")
  }
  try {
    const newProductList = searchSeller.productList.filter(objectId => objectId._id.toString() !== searchProduct._id.toString())
    searchSeller.productList = newProductList
    await searchSeller.save({validateBeforeSave:false})
  } catch (error) {
    throw new ApiError(500, `DbError : unable to update seller product list`)
  }
  if(searchSeller.productList.find(objectId => objectId.id.toString() !== req.params?.productId)){
    throw new ApiError(500, "DbError : Product Id not removed from seller product list")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "successMessage : product deletded successfully"))
})

export const getProductDetailsForUser = asyncHandler(async (req, res) => {

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
    throw new ApiError(409, "AuthError : Unaurthorize access");
  }
  if(req.params?.productId){
    throw new ApiError(404, "DataError : productId not received from params")
  }
  // search product
  let searchProduct
  try {
    searchProduct = await Product.findById(req.params?.productId).select("-stock")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find product"}`)
  }
  if(!searchProduct){
    throw new ApiError(500, "DbError : productId not correct")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, searchProduct, "successMessage : ProductDetails reteived successfully"))
})

export const getAllProductsListByCategoryForUser = asyncHandler(async (req, res) => {

// Check if user is authenticated
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
// search category
let searchCategory
try {
  searchCategory = await Category.findById(req.query?.categoryId).select("productList")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to search category"}`)
}
if(!searchCategory){
  throw new ApiError(500, "DbError : category id not coorect")
}
let productListObJect
try {
  productListObJect = await Product.find({categoryId : req.query?.categoryId}).select("title pic price discount")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to find products"}`)
}
if(!productListObJect){
  throw new ApiError(500, "DbError : No any product found")
}
return res
.status(200)
.json(new ApiResponse(200, productListObJect, "successMessage : All product received"))
})

