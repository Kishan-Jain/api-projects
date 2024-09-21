// add employee
// update employee
// delete employee
// getAll employee
// get single employee
// set avatar
// remove avatar

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import EmployeeDetail from "../models/employee.models.js";
import { DeleteToCloudinary, uploadToCloudnary } from "../utils/cloudnary.js";


// Controller for add new Employee
export const addNewEmployee = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated
   * Check if data is received
   * Create new employee
   * Return employee
   */

  // Check if user is authenticated
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  // Check if request body is received
  if (!req.body) {
    throw new ApiError(400, "Data not received");
  }

  // Destructure the required fields from the request body
  const {
    fullName, email, empId, department, position, branch, salaryInfo, joiningDate,
  } = req.body;

  // Check if any required field is missing or empty
  if (
    [
      fullName, email, empId, department, position, branch, salaryInfo, joiningDate
    ].some(field => (field?.toString()).trim() === "")
  ) {
    throw new ApiError(400, "All fields are necessary");
  }

  let newEmployee;
  try {
    // Create a new employee document
    newEmployee = new EmployeeDetail({
      fullName, email, empId, department, position, branch, salaryInfo, joiningDate,
      created_By: req.user?._id,
    });
    // Save the new employee document to the database
    await newEmployee.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, error.message || "Employee creation failed");
  }

  // Check if the new employee was created successfully
  if (!newEmployee) {
    throw new ApiError(500, "Employee not created");
  }

  // Send a success response with the new employee data
  return res
    .status(201)
    .json(
      new ApiResponse(201, newEmployee, "Employee created successfully")
    );
});

// contoller for update Employee Details
export const updateEmployeeDetails = asyncHandler(async (req, res) => {
  /**
     * Check if user is authenticated
     * Check if data is received
     * Get employee ID from params
     * Update employee data
     * Return updated employee
     */

  // Check if user is authenticated
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  // Check if request body is received
  if (!req.body) {
    throw new ApiError(400, "Data not received");
  }

  // Check if employee ID is received in params
  if (!req.params?.empId) {
    throw new ApiError(400, "Employee ID not received");
  }

  let searchEmployee;
  try {
    // Find the employee by empId
    searchEmployee = await EmployeeDetail.findOne({ empId: req.params.empId });
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to find employee");
  }

  // Check if employee is found
  if (!searchEmployee) {
    throw new ApiError(404, "Employee not found");
  }

  // check if use authorize to update 
  if (searchEmployee.created_By !== req.user?._id) {
    throw new ApiError(401, "User not Authorize to update Employee")
  }

  let updatedEmployee;
  try {
    // Update the employee details
    updatedEmployee = await EmployeeDetail.findByIdAndUpdate(
      { _id: searchEmployee._id },
      { $set: req.body },
      { new: true } // Return the updated document
    );
  } catch (error) {
    throw new ApiError(500, "Employee update failed");
  }

  // Check if employee is updated
  if (!updatedEmployee) {
    throw new ApiError(500, "Employee not updated");
  }

  // Send a success response with the updated employee data
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedEmployee, "Employee updated successfully")
    );
});

// controller for delete Employee Details
export const deleteEmployee = asyncHandler(async (req, res) => {
  /**
     * Check if user is authenticated
     * Get employee ID from params
     * Delete employee
     * Return responce
     */

  // Check if user is authenticated
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  // Check if employee ID is received in params
  if (!req.params?.empId) {
    throw new ApiError(400, "Employee ID not received");
  }

  let searchEmployee;
  try {
    // Find the employee by empId
    searchEmployee = await EmployeeDetail.findOne({ empId: req.params.empId });
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to find employee");
  }

  // Check if employee is found
  if (!searchEmployee) {
    throw new ApiError(404, "Employee not found");
  }

  // check if use authorize to update 
  if (searchEmployee.created_By !== req.user?._id) {
    throw new ApiError(401, "User not Authorize to update Employee")
  }

  try {
    await EmployeeDetail.findByIdAndDelete(searchEmployee._id)
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to delete Employee")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Employee deleted successfully")
    )
});

// controller for get all employees data
export const allEmployeesDetails = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated
   * Find all employees data
   * Return response
   */

  // Check if user is authenticated
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  let getAllEmployees;
  try {
    // Find all employees created by the authenticated user
    getAllEmployees = await EmployeeDetail.find({ created_By: req.user?._id });
  } catch (error) {
    throw new ApiError(500, "Unable to find employees");
  }

  // Check if employees are found
  if (!getAllEmployees) {
    throw new ApiError(404, "Employees not found");
  }

  // Send a success response with all employees data
  return res
    .status(200)
    .json(
      new ApiResponse(200, getAllEmployees, "All employees retrieved successfully")
    );
});

// controller for get perticular employee
export const particularEmployeeDetails = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated
   * Get employee ID from params
   * Search employee details
   * Return response
   */

  // Check if user is authenticated
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  // Check if employee ID is received in params
  if (!req.params?.empId) {
    throw new ApiError(400, "Employee ID not received");
  }

  let getEmployee;
  try {
    // Find the employee by empId and created_By
    getEmployee = await EmployeeDetail.findOne({ empId: req.params.empId, created_By: req.user?._id });
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to find employee");
  }

  // Check if employee is found
  if (!getEmployee) {
    throw new ApiError(404, "Employee not found");
  }

  // Send a success response with the employee data
  return res
    .status(200)
    .json(
      new ApiResponse(200, getEmployee, "Employee data retrieved successfully")
    );
});

// controller for set/update employee avatar
export const setEmployeeAvatar = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated
   * Retrieve employee ID from params
   * Get local file path by multer middleware
   * Upload to Cloudinary
   * Store updated avatar URL
   */

  // Check if user is authenticated
  if (!req.user) {
    // If user is not logged in, throw an authentication error
    throw new ApiError(401, "User not logged in, please login first");
  }

  // Check if employee ID is received in params
  if (!req.params?.empId) {
    throw new ApiError(400, "Employee ID not received");
  }

  let getEmployee;
  try {
    // Find the employee by empId and created_By
    getEmployee = await EmployeeDetail.findOne({ empId: req.params.empId, created_By: req.user?._id });
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to find employee");
  }

  // Check if employee is found
  if (!getEmployee) {
    throw new ApiError(404, "Employee not found");
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
  if (getEmployee.avatar !== process.env.DEFAULT_USER_PIC_CLOUDINARY_URL) {
    const avatarDeleteResponse = await DeleteToCloudinary(getEmployee.avatar);
    if (!avatarDeleteResponse) {
      throw new ApiError(500, "Avatar deletion error");
    }
  }

  // If the avatar upload fails, throw an internal server error
  if (!avatarUploadResponse) {
    throw new ApiError(500, "Avatar upload error");
  }

  // Update the employee's avatar URL in the database
  let updatedEmployeeDetails;
  try {
    updatedEmployeeDetails = await EmployeeDetail.findByIdAndUpdate(
      getEmployee._id,
      {
        $set: {
          avatar: avatarUploadResponse.url
        }
      },
      { new: true } // Return the updated document
    );
  } catch (error) {
    throw new ApiError(500, error.message || "Employee update failed");
  }

  // Send a success response with the updated employee data
  res.status(200).json(
    new ApiResponse(200, updatedEmployeeDetails, "Employee avatar updated successfully")
  );
});

// Controller for remove Employee avatar
export const removeAvatar = asyncHandler(async (req, res) => {
  /**
   * Check if user is authenticated
   * Retrieve employee ID from params
   * Remove avatar from Cloudinary
   * Restore default profile picture
   */

  // Check if user is authenticated
  if (!req.user) {
    // If user is not logged in, throw an authentication error
    throw new ApiError(401, "User not logged in, please login first");
  }

  // Check if employee ID is received in params
  if (!req.params?.empId) {
    throw new ApiError(400, "Employee ID not received");
  }

  let getEmployee;
  try {
    // Find the employee by empId and created_By
    getEmployee = await EmployeeDetail.findOne({ empId: req.params.empId, created_By: req.user?._id });
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to find employee");
  }

  // Check if employee is found
  if (!getEmployee) {
    throw new ApiError(404, "Employee not found");
  }


  // Attempt to delete the user's avatar from Cloudinary
  const avatarDeleteResponse = await DeleteToCloudinary(getEmployee.avatar);

  if (!avatarDeleteResponse) {
    // If the avatar deletion fails, throw an internal server error
    throw new ApiError(500, "Avatar deletion error");
  }

  let updatedEmployeeDetails;
  try {
    // Attempt to update the user's avatar to the default picture
    updatedEmployeeDetails = await EmployeeDetail.findByIdAndUpdate(
      getEmployee._id,
      {
        $set: {
          avatar: process.env.DEFAULT_USER_PIC_CLOUDINARY_URL
        }
      },
      { new: true }
    )
  } catch (error) {
    // If an error occurs during the update, throw an internal server error
    throw new ApiError(500, error.message || "Unable to update user details");
  }

  // Send a success response with the updated user data
  res.status(200).json(
    new ApiResponse(200, updatedEmployeeDetails, "Employee avatar removed and default picture restored successfully")
  );
});