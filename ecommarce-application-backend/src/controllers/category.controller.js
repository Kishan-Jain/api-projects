import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "../models/products/category.models.js";
import {
  RemoveFileToCloudinary,
  uploadFileToCloudinary,
} from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


export const addCategory = asyncHandler(async (req, res) => {
  
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "Not Authenticate")
  }
  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No data received in the request body");
  }

  const { title } = req.body; // Extract the category title from the request body

  // Check if a title is blank
  if (title.trim() === "") {
    throw new ApiError(400, "Category Title is required");
  }

  // Check if a file was uploaded
  if (!req.file) {
    throw new ApiError(400, "No file received");
  }

  const categoryPicLocalPath = req.file?.path; // Get the local path of the uploaded file

  if (!categoryPicLocalPath) {
    throw new ApiError(500, "File path not found");
  }

  let categoryPicCloudinary;
  try {
    // Upload the file to Cloudinary and get the Cloudinary URL
    categoryPicCloudinary = await uploadFileToCloudinary(categoryPicLocalPath);
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to upload file to Cloudinary"
    );
  }

  if (!categoryPicCloudinary) {
    throw new ApiError(500, "Failed to receive file data from Cloudinary");
  }

  let newCategory;
  try {
    // Create a new category in the database
    newCategory = await Category.create({
      title: title,
      pic: categoryPicCloudinary.url,
    });
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to add category to the database"
    );
  }

  // Retrieve the newly added category
  newCategory = await Category.findById(newCategory._id);

  if (!newCategory) {
    throw new ApiError(500, "Category data not found");
  }

  // Return a success response with the new category data
  return res
    .status(201)
    .json(new ApiResponse(201, newCategory, "Category added successfully"));
});

export const viewAllCategories = asyncHandler(async (req, res) => {
  
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "Not Authenticate")
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


export const updateCategoryData = asyncHandler(async (req, res) => {
  // Check if user is authenticated
  if(!req.userId){
    throw new ApiError(400, "Not Authenticate")
  }

  if (!req.body) {
    throw new ApiError(400, "No data received");
  }
  const [_id, title] = req.body;

  if ([_id, title].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Category ID and title are required");
  }

  // Find the existing category by ID
  const searchCategory = await Category.findById(_id);

  if (!searchCategory) {
    throw new ApiError(400, "Given _id does not exist");
  }

  // Check if a file was uploaded
  if (!req.file) {
    throw new ApiError(400, "No file received");
  }

  const categoryPicNewPath = req.file?.path;

  if (!categoryPicNewPath) {
    throw new ApiError(500, "File path not found");
  }

  try {
    // Upload the new picture to Cloudinary
    const newPicCloudinaryResponse =
      await uploadFileToCloudinary(categoryPicNewPath);
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to upload picture to Cloudinary"
    );
  }

  try {
    // Delete the old picture from Cloudinary
    const deletedPicResponse = await RemoveFileToCloudinary(searchCategory.pic);
    console.log(deletedPicResponse);
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to delete picture from Cloudinary"
    );
  }

  try {
    // Update category data in the database
    const updatedCategory = await Category.findByIdAndUpdate(
      _id,
      {
        $set: {
          title: title,
          pic: newPicCloudinaryResponse.url,
        },
      },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to update category data");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        updatedCategory,
        "Category data updated successfully"
      )
    );
});

export const updateCategoryPic = asyncHandler(async (req, res) => {
  // Update category picture:
  // 1. Check if user is authenticated
  // 2. Check if request body is empty
  // 3. Retrieve category data by ID
  // 4. Upload new picture and store response
  // 5. Find old picture public ID and remove it from Cloudinary
  // 6. Set category picture URL by response
  // 7. Return result

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(400, "Not Authenticate");
  }

  // Check if request body is empty
  if (!req.body) {
    throw new ApiError(400, "No data received");
  }

  // Destructure categoryId from request body
  const [categoryId] = req.body;

  // Check if categoryId is empty
  if (categoryId.trim() === "") {
    throw new ApiError(400, "Category Id is required");
  }

  // Retrieve category data by ID
  const categoryData = await Category.findById({ _id: categoryId });

  // Check if category data exists
  if (!categoryData) {
    throw new ApiError(400, "Category Id is invalid or does not exist");
  }

  // Check if file is received
  if (!req.file) {
    throw new ApiError(400, "File not received or file upload failed");
  }

  const categoryNewPicLocalPath = req.file?.path;

  // Check if file path exists
  if (!categoryNewPicLocalPath) {
    throw new ApiError(500, "File upload failed");
  }

  try {
    // Upload new picture to Cloudinary
    const uploadNewPicResponse = await uploadFileToCloudinary(categoryNewPicLocalPath);
  } catch (error) {
    throw new ApiError(500, "File upload on Cloudinary failed");
  }

  // Check if file upload was successful
  if (!uploadNewPicResponse) {
    throw new ApiError(500, "File not uploaded successfully");
  }

  try {
    // Remove old picture from Cloudinary
    const deleteOldPicResponse = await RemoveFileToCloudinary(categoryData.pic);
  } catch (error) {
    throw new ApiError(500, "File deletion on Cloudinary failed");
  }

  // Check if file deletion was successful
  if (!deleteOldPicResponse) {
    throw new ApiError(500, "File not deleted successfully");
  }

  try {
    // Update category picture URL in database
    categoryData = await Category.findByIdAndUpdate(
      { _id: categoryId },
      {
        $set: {
          pic: uploadNewPicResponse.url,
        },
      },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, "Database Error - Category picture not saved");
  }

  // Check if category data was updated in the database
  if (!categoryData) {
    throw new ApiError(500, "Category picture not updated in database");
  }

  // Return success response with updated category data
  return res
    .status(200)
    .json(
      new ApiResponse(200, categoryData, "Category picture updated successfully")
    );
});


export const deleteCategory = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError(400, "Category ID not received");
  }
  const [_id] = req.body;

  if (_id.trim() === "") {
    throw new ApiError(400, "Category ID is required");
  }

  // Check if the category exists
  if (!(await Category.findById(_id))) {
    throw new ApiError(400, "Invalid category ID");
  }

  try {
    // Delete the category from the database
    const categoryDeleteResponse = await Category.findByIdAndDelete(_id);
  } catch (error) {
    throw new ApiError(500, error.message || "Category not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});
