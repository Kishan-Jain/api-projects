/**
 * Add category
 * get all category
 * update Category
 * change CategoryPic
 * remove category
 */

import asyncHandler from "../utils/asyncHandler.js";
import  ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Category from "../models/products/category.models.js";
import {
  uploadFileToCloudinary,
  RemoveFileFromCloudinary,
} from "../utils/cloudinary.js";


export const addNewCategory = asyncHandler(async (req, res) => {
  
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "authError : User not authenticate")
  }
  if(req.userType !== "Seller"){
    throw new ApiError(400, "authError : User not authenticate")
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(404, "DataError : No data received in the request body");
  }
  if (!req.file){
    throw new ApiError(404, "multerError : file not received")
  }
  const { title } = req.body; // Extract the category title from the request body

  // Check if a title is blank
  if (title.trim() === "") {
    throw new ApiError(400, "dataError : Category Title is required");
  }
  const categoryPicLocalPath = req.file?.path; // Get the local path of the uploaded file

  if (!categoryPicLocalPath) {
    throw new ApiError(500, "multerEror : File path not found");
  }
  let categoryPicCloudinary;
  try {
    // Upload the file to Cloudinary and get the Cloudinary URL
    categoryPicCloudinary = await uploadFileToCloudinary(categoryPicLocalPath);
  } catch (error) {
    throw new ApiError(
      500,
      `cloudinaryError : ${error.message || "Failed to upload file to Cloudinary"}`
    );
  }

  if (!categoryPicCloudinary) {
    throw new ApiError(500, "CloudinaryError : Failed to receive file data from Cloudinary");
  }

  let newCategory;
  try {
    // Create a new category in the database
    newCategory = await Category.create({
      title: title,
      pic: categoryPicCloudinary?.url,
    });
  } catch (error) {
    throw new ApiError(
      500,
      `dbError : ${error.message || "Failed to add category to the database"}`
    );
  }

  // Retrieve the newly added category
  let searchNewCategory
  try {
    searchNewCategory = await Category.findById(newCategory._id);
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find category"}`)
  }

  if (!searchNewCategory) {
    throw new ApiError(500, "DbError : Category data not found");
  }

  // Return a success response with the new category data
  return res
    .status(201)
    .json(new ApiResponse(201, searchNewCategory, "successMessage : Category added successfully"));
});

export const getCategoryDetails = asyncHandler(async (req, res) => {
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "AuthError : Not Authenticate")
  }
  if(req.userType !== "Seller"){
    throw new ApiError(400, "authError : User not authenticate")
  }
  if(!req.params?.categoryId){
    throw new ApiError(400, "DataError : Category id not received");
  }
  // Find the existing category by ID
  let searchCategory
  try {
    searchCategory = await Category.findById(req.params?.categoryId);
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Category"}`)
  }

  if (!searchCategory) {
    throw new ApiError(400, "DataError : Category id not correct");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        searchCategory,
        "SuccessMessage : Category data updated successfully"
      )
    );
});

export const getAllCategories = asyncHandler(async (req, res) => {
  
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(401, "authError : Not Authenticate")
  }
  if(req.userType !== "Seller"){
    throw new ApiError(401, "authError : User not authenticate")
  }
  
  // Retrieve all categories from the database
  const allCategories = await Category.find();

  // Check if any categories were found
  if (!allCategories) {
    throw new ApiError(500, "No data found for categories");
  }

  // Return a success response with the retrieved categories
  return res
    .status(200)
    .json(new ApiResponse(200, allCategories, "All categories data received"));
});


export const updateCategoryTitle = asyncHandler(async (req, res) => {
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "AuthError : Not Authenticate")
  }
  if(req.userType !== "Seller"){
    throw new ApiError(400, "authError : User not authenticate")
  }

  if (!req.body) {
    throw new ApiError(400, "DataError : No data received");
  }
  if(!req.params?.categoryId){
    throw new ApiError(400, "DataError : Category id not received");
  }
  const {title} = req.body;
  if (!(title && title.trim() === "")) {
    throw new ApiError(400, "DataError : Title is required");
  }
  const {categoryId} = req.params;
  if (!(categoryId && categoryId.trim() === "")) {
    throw new ApiError(400, "DataError : categoryId is required");
  }
  // Find the existing category by ID
  let searchCategory
  try {
    searchCategory = await Category.findById(categoryId);
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Category"}`)
  }

  if (!searchCategory) {
    throw new ApiError(400, "DataError : Category id not correct");
  }
  let updateCategory
  try {
    // Update category data in the database
    updateCategory = await Category.findByIdAndUpdate(
      searchCategory._id,
      {
        $set: {title},
      },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, `dbError : ${error.message || "Failed to update category data"}`);
  }
  if(updateCategory){
    throw new ApiError(500, "DbError : Category not updated")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateCategory,
        "SuccessMessage : Category data updated successfully"
      )
    );
});

export const updateCategoryPic = asyncHandler(async (req, res) => {
  /**
   * Update category picture:
   * 1. Check if user is authenticated
   * 2. Check if file received and category id received from params
   * 3. Retrieve category data by ID
   * 4. Upload new picture and store response
   * 5. Find old picture public ID and remove it from Cloudinary
   * 6. Set category picture URL by response
   * 7. Return result
   */

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "AuthError : Not Authenticate");
  }
  if(req.userType !== "Seller"){
    throw new ApiError(401, "AuthError : User not authenticate")
  }

  // Check if request body is empty
  if (!req.file) {
    throw new ApiError(404, "DataError : File not received");
  }
  if(!req.params?.categoryId){
    throw new ApiError(404, "DataError : category id not found")
  }
  // Retrieve category data by ID
  let categoryData
  try {
    categoryData = await Category.findById(req.params?.categoryId);
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find category"}`)
  }

  // Check if category data exists
  if (!categoryData) {
    throw new ApiError(404, "DbError : Category id not correct");
  }

  const categoryNewPicLocalPath = req.file?.path;

  // Check if file path exists
  if (!categoryNewPicLocalPath) {
    throw new ApiError(500, "DataEror : File path not received");
  }

  let uploadNewPicResponse
  try {
    // Upload new picture to Cloudinary
    uploadNewPicResponse = await uploadFileToCloudinary(categoryNewPicLocalPath);
  } catch (error) {
    throw new ApiError(500, `CloudinaryError : ${error.message || "File upload on Cloudinary failed"}`);
  }

  // Check if file upload was successful
  if (!uploadNewPicResponse) {
    throw new ApiError(500, "CloudinaryError : File not uploaded successfully");
  }
  let deleteOldPicResponse
  try {
    // Remove old picture from Cloudinary
    deleteOldPicResponse = await RemoveFileFromCloudinary(categoryData?.pic);
  } catch (error) {
    throw new ApiError(500, `CloudinaryError : ${error.message || "File deletion on Cloudinary failed"}`);
  }

  // Check if file deletion was successful
  if (!deleteOldPicResponse) {
    throw new ApiError(500, "CloudiNaryError : File not deleted successfully");
  }
  let updateCategory
  try {
    // Update category picture URL in database
    updateCategory = await Category.findByIdAndUpdate(
      categoryData._id,
      {
        $set: {
          pic: uploadNewPicResponse.url,
        },
      },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, "DbError : Category picture not saved");
  }

  // Check if category data was updated in the database
  if (!updateCategory) {
    throw new ApiError(500, "DbError : Category picture not updated in database");
  }

  // Return success response with updated category data
  return res
    .status(200)
    .json(
      new ApiResponse(200, updateCategory, "SuccessMessage : Category picture updated successfully")
    );
});


export const deleteCategory = asyncHandler(async (req, res) => {
  
  if(!req.userId){
    throw new ApiError(401, "AuthError : User not Authenticate")
  }
  if(req.userType !== "Seller"){
    throw new ApiError(401, "AuthError : User not Authenticate")
  }
  if(!req.params?.categoryId){
    throw new ApiError(404, "DataError : Category id not received")
  }

  // Check if the category exists
  if (!(await Category.findById(req.params?.categoryId))) {
    throw new ApiError(400, "DbError : categoryId not correct");
  }

  try {
    // Delete the category from the database
    await Category.findByIdAndDelete(req.params?.categoryId);
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Category not deleted"}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});
