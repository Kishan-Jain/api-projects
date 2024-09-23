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
import { RemoveFileToCloudinary, uploadFileToCloudinary, } from "../utils/cloudinary.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Product from "../models/products/product.models.js"
import Category from "../models/products/category.models.js";
import User from "../models/users/user.models.js";
import Seller from "../models/sellers/seller.models.js"

export const addProduct = asyncHandler( async(req, res) => {
  /**
   * check seller is login
   * check data is received from body
   * check product list is
   */
})

export const getAllProductForSeller = asyncHandler(async (req, res) => {
})

export const getProductdetailsForSeller = asyncHandler( async(req, res) => {
})

export const updateProductDetails = asyncHandler( async(req, res) => {
})

export const updateStoke = asyncHandler( async(req, res) => {
})

export const deleteProduct = asyncHandler( async(req, res) => {
})

export const getALlProductByCategoryForUser = asyncHandler(async (req, res) => {

})

export const getProductdetailsForUser = asyncHandler(async (req, res) => {

})

