/**
 * register Employee
 * login
 * logout
 * update details : fullName, company details
 * change password
 * reset password
 * delete
 * get perticuler Employee details
 * setAvatar
 * remove avatar
 *
 * reteive all jobs
 * reteive all previous joobs
*
*/

import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import Employee from "../models/empoleeyes.models.js";
import { GenrateAccessRefreshToken} from "../utils/GenrateAccessRefreshToken.js";
import {accessTokenCookieOption, refreshTokenCookieOption} from "../constants.js"
import {uploadToCloudinary, removeToCloudinary} from "../utils/CloudinaryServices.js"
import Candidate from "../models/candidates.models.js";
import sendEmail from "../utils/manageMail.js";

export const registerEmployee = AsyncHandler(async (req, res) => {
  /**
   * check Employee not login : check accessToken in cookies
   * check necessary data is received from body
   * validate all data - data validity, email exitance
   * create new Employee object and save to database
   * varify saved Employee
   * return with responce
   */

  // check user login
  if(req.cookies["refreshToken"]){
    throw new ApiError(409, "loginError : Employee ALready Login, please  logout or clear cookies")
  }
  // check data received from body 
  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received")
  }

  // destruct data from body
  const {
    emailId,
    fullName,
    password,
    companyName,
    department,
    position,
    joinDate,
  } = req.body;
  
  // validate data 
  if (
    [
      emailId,
      fullName,
      password,
      companyName,
      department,
      position,
      joinDate,
    ].some((field) => field === undefined)
  ) {
    throw new ApiError(404, "DataError : All field is required")
  }
  if (
    [
      emailId,
      fullName,
      password,
      companyName,
      department,
      position,
      joinDate,
    ].some((field) => field?.toString().trim() === "")
  ) {
    throw new ApiError(400, "DataError : No any field is empty")
  }
  // check Employee Email exitstance
  try {
    if (await Employee.findOne({ emailId })) {
    throw new ApiError(400, "DataError : Employee emails already exits")
  }
  } catch (error) {
    throw new ApiError(500, `DBError : ${error.message || "Unable to find Employee data"} `)
  }
  // create company details object
  const companyDetails = {
    name: companyName,
    department,
    position,
    joinDate, // mm/dd/yyyy formet
  };
  // create and save new Employee
  let newCreatedEmployee;
  try {
    newCreatedEmployee = await Employee.create({
      emailId,
      password,
      fullName,
      companyDetails,
    });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to create New Employee"}`)
  }
  // varify new created employee
  if (!newCreatedEmployee) {
    throw new ApiError(500, "DbError : New employee not created")
  }
  // find new created employee from database
  let findNewCreatedEmployee;
  try {
    findNewCreatedEmployee = await Employee.findById(
      newCreatedEmployee._id
    ).select("-password -__v");
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find New Employee"}`)
  }
  // check finded employee
  if (!findNewCreatedEmployee) {
    throw new ApiError(500, `DbError : new created employee not found`)
  }
  // send Email
  sendEmail(emailId, "Employee registed successFully", `Employee registed successfull \n EmailId : ${emailId} \n Password : ${password}`)
  // return responce with new create Employee
  return res
    .status(201)
    .json(
      new ApiResponce(
        201,
        findNewCreatedEmployee,
        "successMessage : Employee register successfully "
      )
    );
});

export const loginEmployee = AsyncHandler(async (req, res) => {
  /**
   * check Employee not login : check accessToken in cookies
   * check necessary data is received from body
   * validate and varify data - data validity, email exitance, password varification
   * generate access and refresh tokens
   * save refresh token in database and update Employee
   * set access token and Refresh Token flag in cookie
   * return EmployeeData and responce
   */

  // check Employee login
  if (req.cookies["refreshToken"]) {
    throw new ApiError(409, "LoginError : user already login, please logout or clear cookies")
  }
  // check data from body
  if (!req.body) {
    throw new ApiError(404, "dataError : No any data received")
  }
  // destruct data from body
  const { emailId, password } = req.body;

  // validate data  
  if ([emailId, password].some((field) => field === undefined)) {
    throw new ApiError(404, "dataError : All field is required")
  }
  if ([emailId, password].some((field) => field?.toString().trim() === "")) {
    throw new ApiError(400, "dataError : No any field is Empty")
  }
  // check Employee EmailId Exitstance
  let searchEmployee;
  try {
    searchEmployee = await Employee.findOne({ emailId });
  } catch (error) {
    throw new ApiError(500, `DBError : ${error.message || "unable to find Employee"}"`)
  }
  if (!searchEmployee) {
    throw new ApiError(400, "DataError : Employee Email is not exitstance")
  }
  // check password validation
  if (!(await searchEmployee.checkPasswordCorrect(password))) {
    throw new ApiError(400, "DataError : Employee Password is not valid")
  }
  // generate Tokens 
  const {accessToken, refreshToken} = await GenrateAccessRefreshToken(searchEmployee)

  // check tokens
  if([accessToken, refreshToken].some(field => field  === undefined)){
    throw new ApiError(500, "DbError : Token not available")
  }
  if([accessToken, refreshToken].some(field => field.toString().trim() === "")){
    throw new ApiError(500, "DBError : No any token generated")
  }
  // updated field in Employee database
  let updateSearchEmployee
  try {
    updateSearchEmployee = await Employee.findByIdAndUpdate(searchEmployee._id, {
      $set : {
        lastLogin : Date.now()
      }
    }, {new:true}).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update Employee"}`)
  }
  // check employee update
  if(!updateSearchEmployee){
    throw new ApiError(500, "DBError : Employee not updated")
  }
  // send Email
  sendEmail(updateSearchEmployee.emailId, "Employee login", `Employee login on time : ${new Date}`)
  // set cookies and return responce with new updated data
  return res 
  .status(200)
  .cookie("accessToken", accessToken, accessTokenCookieOption)
  .cookie("refreshToken", refreshToken, refreshTokenCookieOption)
  .json(new ApiResponce(200, updateSearchEmployee, "successMessage : Employee login successfully"))
});

export const logoutEmployee = AsyncHandler(async (req, res) => {
  /**
   * check Employee already login : check access token in cookies
   * update some Employee data field in database and clear accessToken and refreshToken flag in cookie
   * return message and responce
   */

  // check Employee login
  if(!req.userId){
    throw new ApiError(400, "Employee not login, please login first")
  }
  if(req.userType !== "Employee"){
    throw new ApiError(409, "LoginError : Unaurtorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unaurtorize Access")
  }

  // update Employee field
  let updateEmployee
  try {
    updateEmployee = await Employee.findByIdAndUpdate(req.userId,
      {
        $set : {
          lastLogout : Date.now()
        }
      }, {new:true}
    ).select("_id emailId")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update Employee Data"}`)
  }
  // check employee updated
  if(!updateEmployee){
    throw new ApiError(500, "DbError : Employee data not update")
  }
  // send Email
  sendEmail(updateEmployee.emailId, "Employee Logout", `Employee logout \nTime : ${new Date}`)
  // clear cookies and return responce 
  return res
  .status(200)
  .clearCookie("accessToken", accessTokenCookieOption)
  .clearCookie("refreshToken", refreshTokenCookieOption)
  .json(new ApiResponce(200, {}, "successMessage : Employee logout successFully"))
});

export const updateEmployeeFullName = AsyncHandler(async (req, res) => {
  /**
   * check Employee already login : check accessToken in cookies
   * check necessary data is received from body
   * updated data in Employee database
   * return result and responce
   */

  // check Employee login
  if(!req.userId){
    throw new ApiError(400, "Employee not login, please login first")
  }
  if(req.userType !== "Employee"){
    throw new ApiError(409, "LoginError : Unaurtorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unaurtorize Access")
  }

  // check data received from body
  if(!req.body){
    throw new ApiError(404, "DataError : No any data received from body")
  }
  // extract data from body
  const {fullName} = req.body
  // search Employee by userId
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find Employee"}`)
  }
  if(!searchEmployee){
    throw new ApiError(400, "DbError : Employee not Found")
  }
  // update Employee
  let updateEmployee
  try {
    updateEmployee = await Employee.findByIdAndUpdate(searchEmployee._id, {
      $set : {fullName}
    },{new:true}).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to updated Employee"}`)
  }
  if(!updateEmployee){
    throw new ApiError(500, "DbError : Employee not updated")
  }
  // send Email
  sendEmail(updateEmployee.emailId, "Your Employee details Updated", `new Employee name : ${fullName}`)
  // return responce with updated Employee data
  return res 
  .status(200)
  .json(new ApiResponce(200, updateEmployee, "successMessage : Employee updated successfully"))
});

export const updateEmployeeCompanyDetails = AsyncHandler(async (req, res) => {
  /**
   * check Employee already login : check accessToken in cookies
   * check necessary data is received from body
   * updated data in Employee database
   * return result and responce
   */

  // check Employee login
  if(!req.userId){
    throw new ApiError(400, "Employee not login, please login first")
  }
  if(req.userType !== "Employee"){
    throw new ApiError(409, "LoginError : Unaurtorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unaurtorize Access")
  }
  // check data received from body
  if(!req.body){
    throw new ApiError(404, "DataError : No any Data received from body")
  }
  // destract data
  const {companyName, department, position, joinDate} = req.body
  // validate data
  if(![companyName, department, position, joinDate].some(field => field)){
    throw new ApiError(404, "DataError : All field is required")
  }
  if([companyName, department, position, joinDate].some(field => field.toString().trim() === "")){
    throw new ApiError(400, "DataError : No any field is Empty")
  }
  // search employee by userId 
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Employee"}`)
  }
  if(!searchEmployee){
    throw new ApiError(400,"DbError : Employee not founded" )
  }
  // create company details object
  const companyDetails ={
    name : companyName, department, position, joinDate 
  }
  // update Employee 
  let updateEmployee
  try {
    updateEmployee = await Employee.findByIdAndUpdate(searchEmployee._id, {
      $set : {companyDetails}
    },{new:true}).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to updated employee"}`)
  }
  if(!updateEmployee){
    throw new ApiError(500, "Employee not updated")
  }
  // send Email
  sendEmail(updateEmployee.emailId, "Your Employee Account Details updated", `New company details : 
    \ncompanyName : ${companyName}
    \ndepartment : ${department}
    \nposition : ${position}
    \njoinDate : ${new Date(joinDate)}
    `)
  // return responce with updated Employee
  return res 
  .status(200)
  .json(new ApiResponce(200, updateEmployee, "successMessage : Employee company datails updated successfully"))
});

export const changeEmployeePassword = AsyncHandler(async (req, res) => {
  /**
   * check Employee already login : check accessToken in cookies
   * chack passwords received from body
   * varify password and update its
   * return result and responce
   */
  // check Employee login
  if(!req.userId){
    throw new ApiError(400, "Employee not login, please login first")
  }
  if(req.userType !== "Employee"){
    throw new ApiError(409, "LoginError : Unaurtorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unaurtorize Access")
  }

  // check data received from body
  if(!req.body){
    throw new ApiError(404, "Not any data received")
  }
  // destruct data and validate
  const {oldPassword, newPassword} = req.body
  if(![oldPassword, newPassword].some(field => field)){
    throw new ApiError(404, "All field is required")
  }
  if([oldPassword, newPassword].some(field => field?.toString().trim() === "")){
    throw new ApiError(400, "any field is not empty")
  }
  // search Employee by userId
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(req.userId).select("-__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to search Employee"}`)
  }
  if(!searchEmployee){
    throw new ApiError(500, "DbError : Employee not find")
  }
  // check password validation
  if(!await searchEmployee.checkPasswordCorrect(oldPassword)){
    throw new ApiError(400, "DataError : given old password is not correct")
  }
  // set new password
  try {
    searchEmployee.password = newPassword
    await searchEmployee.save({validateBeforeSave:false})
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update update password"}`)
  }
  // check password setted
  if(!searchEmployee.checkPasswordCorrect(newPassword)){
    throw new ApiError(500, "DbError : Password not chenged")
  }
  // send Email
  sendEmail(searchEmployee.emailId, "Employee Password Changes", `Your Employee Account ${emailId} password chenges successfully! \n Nwe Password : ${newPassword}`)
  // clear all cookie and return responce with success message
  return res
  .status(200)
  .clearCookie("accessToken", accessTokenCookieOption)
  .clearCookie("refreshToken", refreshTokenCookieOption)
  .json(new ApiResponce(200, {}, "successMessage : Employee Password changes successfully"))
});

export const resetEmployeePassword = AsyncHandler(async (req, res) => {
  /**
   * check Employee not login : check accessToken in cookies
   * check Employee datails received from body
   * varify Employee details and set password
   * return result and responce
   */
});

export const deleteEmployee = AsyncHandler(async (req, res) => {
  /**
   * check Employee already login : check accessToken in cookies
   * delete Employee and clear cookies
   * return result and responce
   */
  // check Employee login
  if(!req.userId){
    throw new ApiError(400, "Employee not login, please login first")
  }
  if(req.userType !== "Employee"){
    throw new ApiError(409, "LoginError : Unaurtorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unaurtorize Access")
  }
  // serch Employee by user id
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(ueq.userId).select("_id emailId")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to search employee"}`)
  }
  if(!searchEmployee){
    throw new ApiError(500, "DbError : Employee not found")
  }
  // Delete Employee
  try {
    await Employee.findByIdAndDelete(searchEmployee._id)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to delete Employee"}`)
  }
    // send Email
    sendEmail(searchEmployee.emailId, "Employee Account Deleted", `Your Job-Board account Delete on ${Date.now()}`)
  // clear all cookie and return responce with successMessage
  return res
  .status(200)
  .clearCookie("accessToken", accessTokenCookieOption)
  .clearCookie("refreshToken", refreshTokenCookieOption)
  .json(new ApiResponce(200, {}, "successMessage : Employee Deleted successFully"))
});

export const getEmployeeDetails = AsyncHandler(async (req, res) => {
  /**
   * check Employee already login
   * serch Employee and return datails in responce
   */
// check Employee login
if(!req.userId){
  throw new ApiError(400, "Employee not login, please login first")
}
if(req.userType !== "Employee"){
  throw new ApiError(409, "LoginError : Unaurtorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unaurtorize Access")
}
// search Employee
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(req.userId).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to search Employee"}`)
  }
  if(!searchEmployee){
    throw new ApiError(500, "DbError : Employee not find")
  }
  // return responce with full Employee data
  return res
  .status(200)
  .json(new ApiResponce(200, searchEmployee, "seccessMessage : Employee Data returned"))
});

export const setEmployeeAvatar = AsyncHandler(async (req, res) => {
  /**
   * check Employee already login : check accessToken in cookies
   * reteive file localPath and upload in cloudinary
   * check previous Avatar url is not default url, then delete pic by url in cloudinary
   * set cloudinary url in Employee database
   * return responce
   */
// check Employee login
if(!req.userId){
  throw new ApiError(400, "Employee not login, please login first")
}
if(req.userType !== "Employee"){
  throw new ApiError(409, "LoginError : Unaurtorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unaurtorize Access")
}

// check file is upload by multer 
  if(!req.file){
    throw new ApiError(404, "File not received")
  }
// reteive file path
  const localFilePath = req.file?.path
  if(localFilePath?.toString().trim() === ""){
    throw new ApiError(400, "File path not received")
  }
  // serch Employee data
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(req.userId).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Employee Data"}`)
  }
  if(!searchEmployee){
    throw new ApiError(500, "DbError : Employee not find")
  }
// upload file on cloudinary
  let cloudibaryResponce
  try {
    cloudibaryResponce =  await uploadToCloudinary(localFilePath)
  } catch (error) {
    throw new ApiError(500, `Error : ${error.message || "Unable to upload file on cloudinary"}`)
  }
  if(!cloudibaryResponce){
    throw new ApiError(500, "Error : File not uploded on cloudinary")
  }
  // check old avatar is default
  if(searchEmployee.avatar !== process.env.DEFAULT_USER_AVATAR){
    try {
      // remove file on cloudinary
      await removeToCloudinary(searchEmployee.avatar)
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "unable to remove file on cloudinary"}`)
    }
  }
  // update atavar in Employee Database
  let updateEmployee
  try {
    updateEmployee = await Employee.findByIdAndUpdate(
      searchEmployee._id,
      {
        $set : {avatar : cloudibaryResponce?.url}
      }, {new : true}
    ).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update Employee"}`)
  }
  if(!updateEmployee){
    throw new ApiError(500, "DbError : Employee not updated")
  }
  // return responce with updated Employee Data
  return res
  .status(200)
  .json(200, updateEmployee, "successMessage : Employee Avatar set successfully")
});

export const removeEmployeeAvatar = AsyncHandler(async (req, res) => {
  /**
   * check Employee already login : check accessToken in cookies
   * check Employee Avatar is default
   * remove Avatar by Url in cloudinary
   * set Avatar to defalt
   * return responce
   */
  // check Employee login
  if(!req.userId){
    throw new ApiError(400, "Employee not login, please login first")
  }
  if(req.userType !== "Employee"){
    throw new ApiError(409, "LoginError : Unaurtorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unaurtorize Access")
  }
// search Employee data by userId
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Employee"}`)
  }
  if(!searchEmployee){
    throw new ApiError(500, "DbError : Employee not finded")
  }
  // check avatar is defalt avatar
  if(searchEmployee.avatar === process.env.DEFAULT_USER_AVATAR){
    throw new ApiError(400, "Error : default avatar, not allow to remove")
  }
  // remove avatar from cloudinary
  try {
    await removeToCloudinary(searchEmployee.avatar)
  } catch (error) {
    throw new ApiError(500, `Error : ${error.message || "Unable to remove file from cloudinary"}`)
  }
  // updated Employee Database
  let updateEmployee
  try {
    updateEmployee = await Employee.findByIdAndUpdate(searchEmployee._id, {
      $set : {avatar : process.env.DEFAULT_USER_AVATAR}
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update Employee"}`)
  }
  if(!updateEmployee){
    throw new ApiError(500, "DbError : Employee not updated")
  }
  // return response with updated Employee
  return res
  .status(200)
  .json(200, updateEmployee, "successMessage : Employee Avatar removed")
});

export const getAllJobs = AsyncHandler(async (req, res) => {
/**
 * check employee login
 * retuevied all jobs info
 * return responce 
 */
  // check Employee login
  if(!req.userId){
    throw new ApiError(400, "Employee not login, please login first")
  }
  if(req.userType !== "Employee"){
    throw new ApiError(409, "LoginError : Unaurtorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unaurtorize Access")
  }
  let allJobInfo
  try {
    allJobInfo = await Employee.findById(req.params?.userId).select("jobsArray")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find job array"}`)
  }
  if(!allJobInfo){
    throw new ApiError(500, "Job array not finded")
  }
  return res
  .status(200)
  .json(new ApiResponce(200, allJobInfo, "successMessage : all jobs received"))
})

export const getAllPreviousJobs = AsyncHandler(async (req, res) => {

/**
 * check employee login
 * retuevied all jobs info
 * return responce 
 */
  // check Employee login
  if(!req.userId){
    throw new ApiError(400, "Employee not login, please login first")
  }
  if(req.userType !== "Employee"){
    throw new ApiError(409, "LoginError : Unaurtorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unaurtorize Access")
  }
  let allPreviousJobInfo
  try {
    allPreviousJobInfo = await Employee.findById(req.params?.userId).select("previousJobsArray")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find job array"}`)
  }
  if(!allPreviousJobInfo){
    throw new ApiError(500, "Job array not finded")
  }
  return res
  .status(200)
  .json(new ApiResponce(200, allPreviousJobInfo, "successMessage : all jobs received"))
})

export const getCandidateDetails = AsyncHandler(async (req, res) => {
  /**
   * check Employee already login : check accessToken in cookies
   * get Candidate Id from params
   * search Candidate details from condidate Database
   * return candidate and responce
   */
  // check Employee login
  if(!req.userId){
    throw new ApiError(400, "Employee not login, please login first")
  }
  if(req.userType !== "Employee"){
    throw new ApiError(409, "LoginError : Unaurtorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unaurtorize Access")
  }
  // check candidate id received from parameters
  if(!req.params?.candidateId){
    throw new ApiError(404, "DataError : Candidate Id not received" )
  }
  // search Employee by userId
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(req.userId).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Employee"} `)
  }
  if(!searchEmployee){
    throw new ApiError(500, "DbError : Employee Data not find")
  }
  // search Candidate Data
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.params?.candidateId).select("_id fullName isActive avatar areaOfIntrest resumeArray")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate Data not find")
  }
  // return responce with all necessary info 
  return res 
  .status(200)
  .json(new ApiResponce(200, searchCandidate, "successMessage : candidate datails returned"))

});
