// register as admin
// login as admin
// logout admin
// update admin details
// reset admin password
// change admin password
// delete admin
// set admin avatar
// remove admin avatar

// add user
// update user details
// getAll user
// get single user
// update user password
// update user avtar
// remove user avtar

// add employee
// update employee
// delete employee
// getAll employee
// get single employee
// set employee avatar
// remove employee avatar

import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { EmployeeDetail } from "../models/employee.models.js";
import { UserDetail } from "../models/user.models.js";
import { DeleteToCloudinary, uploadToCloudnary } from "../utils/cloudnary.js";

export const registerAdmin = asyncHandler( async(req, res) => {})
export const lastLoginAdmin = asyncHandler( async(req, res) => {})
export const logoutAdmin = asyncHandler( async(req, res) => {})
export const updateAdminDetails = asyncHandler( async(req, res) => {})
export const resetAdminPassword = asyncHandler( async(req, res) => {})
export const changeAdminPassword = asyncHandler( async(req, res) => {})
export const deleteAdmin = asyncHandler( async(req, res) => {})
export const setAdminAvatar = asyncHandler( async(req, res) => {})
export const removeAdminAvatar = asyncHandler( async(req, res) => {})

export const AddUser = asyncHandler( async(req, res) => {})
export const updatedUserDetails = asyncHandler( async(req, res) => {})
export const getAllUser = asyncHandler( async(req, res) => {})
export const getPerticularUser = asyncHandler( async(req, res) => {})
export const UpdateUserPassword = asyncHandler( async(req, res) => {})
export const updateUserAvatar = asyncHandler( async(req, res) => {})
export const removeUserAvatar = asyncHandler( async(req, res) => {})

export const addEmployee = asyncHandler( async(req, res) => {})
export const updatedEmployeeDetails = asyncHandler( async(req, res) => {})
export const getAllEmployees = asyncHandler( async(req, res) => {})
export const getPerticularEmployee = asyncHandler( async(req, res) => {})
export const updateEmployeeAvatar = asyncHandler( async(req, res) => {})
export const removeEmployeeAvatar = asyncHandler( async(req, res) => {})
