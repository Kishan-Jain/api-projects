/**
 * register candidate
 * login candidate
 * logout candidate
 * update candidate details : fullName, field
 * add keySkills, area of interest
 * remove keySkills, area of interest
 * change Candidate password
 * reset candidate password
 * delete Candidate
 * get perticuler candidate details
 * set Candidate Avatar
 * remove Candidate avatar
 * 
 * get Candidate details
 * 
 * upload resume
 * remove resume
 * 
 * get all job that match candidate keySkills
 * get all applications
 * get all sorted application
 * 
 * view application details
 * check application status
 */

import AsyncHandler from "../utils/AsyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"
import Candidate from "../models/candidates.models.js"
import Employee from "../models/empoleeyes.models.js"
import Job from "../models/jobs.models.js"
import Application from "../models/applications.models.js"
import {accessTokenCookieOption, refreshTokenCookieOption} from "../constants.js"
import {uploadToCloudinary, removeToCloudinary} from "../utils/CloudinaryServices.js"
import {GenrateAccessRefreshToken} from "../utils/GenrateAccessRefreshToken.js"
import sendEmail from "../utils/manageMail.js"

export const registerCandidate = AsyncHandler(async (req, res) => {
  /**
   * check Candidate not login : check accessToken in cookies
   * check necessary data is received from body
   * validate all data - data validity, email exitance
   * create new Candidate object and save to database
   * varify saved Candidate
   * return with responce
   */

  // check user login
  if(req.cookies["refreshToken"]){
    throw new ApiError(409, "loginError : Candidate ALready Login, please  logout or clear cookies")
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
    field
  } = req.body;

  // validate data 
  if (
    [
      emailId,
      fullName,
      password,
      field
    ].some((field) => field === undefined)
  ) {
    throw new ApiError(404, "DataError : All field is required")
  }
  if (
    [
      emailId,
      fullName,
      password,
      field
    ].some((field) => field.toString().trim() === "")
  ) {
    throw new ApiError(400, "DataError : No any field is empty")
  }
  // check Candidate Email exitstance
  try {
    if (await Candidate.findOne({ emailId })) {
    throw new ApiError(400, "DataError : Candidate emails already exits")
  }
  } catch (error) {
    throw new ApiError(500, `DBError : ${error.message || "Unable to find Candidate data"} `)
  }
  
  // create and save new Candidate
  let newCreatedCandidate;
  try {
    newCreatedCandidate = await Candidate.create({
      emailId,
      password,
      fullName,
      field
    });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to create New Candidate"}`)
  }
  // varify new created Candidate
  if (!newCreatedCandidate) {
    throw new ApiError(500, "DbError : New Candidate not created")
  }
  // find new created Candidate from database
  let findNewCreatedCandidate;
  try {
    findNewCreatedCandidate = await Candidate.findById(
      newCreatedCandidate._id
    ).select("-password -__v");
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find New Candidate"}`)
  }
  // check finded Candidate
  if (!findNewCreatedCandidate) {
    throw new ApiError(500, `DbError : new created Candidate not found`)
  }
  // send Email
  sendEmail(findNewCreatedCandidate.emailId, "Cnadidate registed successFully", `Candidate registed successfull \n EmailId : ${emailId} \n Password : ${password}`)
  // return responce with new create Candidate
  return res
    .status(201)
    .json(
      new ApiResponce(
        201,
        findNewCreatedCandidate,
        "successMessage : Candidate register successfully "
      )
    );
});

export const loginCandidate = AsyncHandler(async (req, res) => {
  /**
   * check Candidate not login : check accessToken in cookies
   * check necessary data is received from body
   * validate and varify data - data validity, email exitance, password varification
   * generate access and refresh tokens
   * save refresh token in database and update Candidate
   * set access token and Refresh Token flag in cookie
   * return CandidateData and responce
   */

  // check Candidate login
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
  // check Candidate EmailId Exitstance
  let searchCandidate;
  try {
    searchCandidate = await Candidate.findOne({ emailId });
  } catch (error) {
    throw new ApiError(500, `DBError : ${error.message || "unable to find Candidate"}"`)
  }
  if (!searchCandidate) {
    throw new ApiError(400, "DataError : Candidate Email is not exits")
  }
  // check password validation
  if (!(await searchCandidate.checkPasswordCorrect(password))) {
    throw new ApiError(400, "DataError : Candidate Password is not valid")
  }
  // generate Tokens 
  const { accessToken, refreshToken } = await GenrateAccessRefreshToken(
    searchCandidate
  );

  // check tokens
  if([accessToken, refreshToken].some(field => field.toString().trim() === "")){
    throw new ApiError(400, "DBError : No any token generated")
  }
  // updated field in Candidate database
  let updateSearchCandidate
  try {
    updateSearchCandidate = await Candidate.findByIdAndUpdate(searchCandidate._id, {
      $set : {
        lastLogin : Date.now()
      }
    }, {new:true}).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update Candidate"}`)
  }
  // check Candidate update
  if(!updateSearchCandidate){
    throw new ApiError(500, "DBError : Candidate not updated")
  }
  // send Email
  sendEmail(updateSearchCandidate.emailId, "Candidate Login", `Candidate login successfully \nDate : ${new Date}`)
  // set cookies and return responce with new updated data
  return res 
  .status(200)
  .cookie("accessToken", accessToken, accessTokenCookieOption)
  .cookie("refreshToken", refreshToken, refreshTokenCookieOption)
  .json(new ApiResponce(200, updateSearchCandidate, "successMessage : Candidate login successfully"))
});

export const logoutCandidate = AsyncHandler(async (req, res) => {
  /**
   * check Candidate already login : check access token in cookies
   * update some Candidate data field in database and clear accessToken and refreshToken flag in cookie
   * return message and responce
   */

  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }

  // update Candidate field
  let updateCandidate
  try {
    updateCandidate = await Candidate.findByIdAndUpdate(req.userId,
      {
        $set : {
          lastLogout : Date.now()
        }
      }, {new:true}
    ).select("_id emailId")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update Candidate Data"}`)
  }
  // check Candidate updated
  if(!updateCandidate){
    throw new ApiError(500, "DbError : Candidate data not update")
  }
  // send Email
  sendEmail(updateCandidate.emailId, "Candidate logout", `Candidate logout now, Date : ${new Date}`)
  // clear cookies and return responce 
  return res
  .status(200)
  .clearCookie("accessToken", accessTokenCookieOption)
  .clearCookie("refreshToken", refreshTokenCookieOption)
  .json(new ApiResponce(200, {}, "successMessage : Candidate logout successFully"))
});


export const updateCandidateFullName = AsyncHandler(async (req, res) => {
  /**
   * check Candidate already login : check accessToken in cookies
   * check necessary data is received from body
   * updated data in Candidate database
   * return result and responce
   */

  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }

  // check data received from body
  if(!req.body){
    throw new ApiError(404, "DataError : No any data received from body")
  }
  // extract data from body
  const {fullName} = req.body
  if(fullName === undefined){
    throw new ApiError(404, "DataError : All field is required")
  }
  if(fullName === ""){
    throw new ApiError(400, "DataError : No any field is Empty")
  }
  // search Candidate by userId
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(400, "DbError : Candidate not Found")
  }
  // update Candidate
  let updateCandidate
  try {
    updateCandidate = await Candidate.findByIdAndUpdate(searchCandidate._id, {
      $set : {fullName}
    },{new:true}).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to updated Candidate"}`)
  }
  if(!updateCandidate){
    throw new ApiError(500, "DbError : Candidate not updated")
  }
  // send Email
  sendEmail(updateCandidate.emailId, "Candidate details updated", `Candidate Details Updated. \nDate : ${new Date}`)
  // return responce with updated Candidate data
  return res 
  .status(200)
  .json(new ApiResponce(200, updateCandidate, "successMessage : Candidate updated successfully"))
});

export const updateCandidateField = AsyncHandler(async (req, res) => {
  /**
   * check Candidate already login : check accessToken in cookies
   * check necessary data is received from body
   * updated data in Candidate database
   * return result and responce
   */

  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }

  // check data received from body
  if(!req.body){
    throw new ApiError(404, "DataError : No any data received from body")
  }
  // extract data from body
  const {field} = req.body
  if(field  === undefined){
    throw new ApiError(404, "DataError : All field is required")
  }
  if (field === ""){
    throw new ApiError(400, "DataError : No Any field is Empty")
  }
  // search Candidate by userId
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(400, "DbError : Candidate not Found")
  }
  // update Candidate
  let updateCandidate
  try {
    updateCandidate = await Candidate.findByIdAndUpdate(searchCandidate._id, {
      $set : {field}
    },{new:true}).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to updated Candidate"}`)
  }
  if(!updateCandidate){
    throw new ApiError(500, "DbError : Candidate not updated")
  }
  // send Email
  sendEmail(updateCandidate.emailId, "Candidate details updated", `Candidate details updated successfully \n Date : ${new Date}`)
  // return responce with updated Candidate data
  return res 
  .status(200)
  .json(new ApiResponce(200, updateCandidate, "successMessage : Candidate updated successfully"))
})

export const addAreaOfIntrest = AsyncHandler(async (req, res) => {
/**
 * check candidate is login
 * check data from body
 * push data on Area of Intrest array
 * return responce
 */
// check Candidate login
if(!req.userId){
  throw new ApiError(400, "Candidate not login, please login first")
}
if(req.userType !== "Candidate"){
  throw new ApiError(409, "LoginError : Unauthorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unauthorize Access")
}

// check data received from body
if(!req.body){
  throw new ApiError(404, "DataError : No any data received from body")
}
// extract data from body
const {areaOfIntrest} = req.body
if(areaOfIntrest  === undefined){
  throw new ApiError(404, "DataError : All field is required")
}
if (areaOfIntrest === ""){
  throw new ApiError(400, "DataError : No Any field is Empty")
}
// search Candidate by userId
let searchCandidate
try {
  searchCandidate = await Candidate.findById(req.userId).select("-password")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to find Candidate"}`)
}
if(!searchCandidate){
  throw new ApiError(400, "DbError : Candidate not Found")
}
if((searchCandidate.areaOfIntrest.find(field => field === areaOfIntrest))){
  throw new ApiError(404, "DataError : Intrest already exits")
}
// update Candidate
let updateCandidate
try {
  updateCandidate = await Candidate.findByIdAndUpdate(searchCandidate._id, {
    $push : {
      areaOfIntrest
    }
  },{new:true}).select("-password -__v")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to updated Candidate"}`)
}
if(!updateCandidate){
  throw new ApiError(500, "DbError : Candidate not updated")
}
// return responce with updated data
return res
.status(200)
.json(new ApiResponce(200, updateCandidate, "successMessage : Intrest add successfully"))
})

export const removeAreaOfIntrest = AsyncHandler(async (req, res) => {
/**
 * check candidate is login
 * check intrest name on params
 * pop data on Area of Intrest array
 * return responce
 */
// check Candidate login
if(!req.userId){
  throw new ApiError(400, "Candidate not login, please login first")
}
if(req.userType !== "Candidate"){
  throw new ApiError(409, "LoginError : Unauthorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unauthorize Access")
}

// check data received from body
if(!req.params?.intrestName){
  throw new ApiError(404, "DataError : No any data received from body")
}
// extract data from params
const {intrestName} = req.params
if(intrestName  === undefined){
  throw new ApiError(404, "DataError : All field is required")
}
if (intrestName === ""){
  throw new ApiError(400, "DataError : No Any field is Empty")
}
// search Candidate by userId
let searchCandidate
try {
  searchCandidate = await Candidate.findById(req.userId).select("-password")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to find Candidate"}`)
}
if(!searchCandidate){
  throw new ApiError(400, "DbError : Candidate not Found")
}
if(!(searchCandidate.areaOfIntrest.find(field => field === intrestName))){
  throw new ApiError(404, "DataError : Intrest not found")
}
// update Candidate
let updateCandidate
try {
  const newAreaOfIntrestArray = searchCandidate.areaOfIntrest.filter(field => field !== intrestName)
  searchCandidate.areaOfIntrest = newAreaOfIntrestArray
  await searchCandidate.save({validateBeforeSave:false})
  updateCandidate = await Candidate.findById(searchCandidate._id).select("-password -__v")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to updated Candidate"}`)
}
if(!updateCandidate){
  throw new ApiError(500, "DbError : Candidate not updated")
}
// return responce with updated data
return res
.status(200)
.json(new ApiResponce(200, updateCandidate, "successMessage : Intrest add successfully"))
})

export const addNewSkills = AsyncHandler(async (req, res) => {
/**
 * check candidate is login
 * check data from body
 * push data on skill array
 * return responce
 */
// check Candidate login
if(!req.userId){
  throw new ApiError(400, "Candidate not login, please login first")
}
if(req.userType !== "Candidate"){
  throw new ApiError(409, "LoginError : Unauthorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unauthorize Access")
}

// check data received from body
if(!req.body){
  throw new ApiError(404, "DataError : No any data received from body")
}
// extract data from body
const {newSkills} = req.body
if(newSkills  === undefined){
  throw new ApiError(404, "DataError : All field is required")
}
if (newSkills.length === 0){
  throw new ApiError(400, "DataError : No Any field is Empty")
}
if (newSkills.some(field => field === "")){
  throw new ApiError(400, "DataArrayError : No Any field is Empty")
}
// search Candidate by userId
let searchCandidate
try {
  searchCandidate = await Candidate.findById(req.userId).select("-password")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to find Candidate"}`)
}
if(!searchCandidate){
  throw new ApiError(400, "DbError : Candidate not Found")
}
for (let skill of newSkills){
    if((searchCandidate.keySkills.find(field => field === skill))){
    throw new ApiError(404, `DataError : ${skill} already exits in skills array`)
  }
}
// update Candidate
let updateCandidate
try {
  const newSkillsArray = searchCandidate.keySkills.concat(newSkills)
  
  searchCandidate.keySkills = newSkillsArray
  await searchCandidate.save({validateBeforeSave:false})
  updateCandidate = await Candidate.findById(searchCandidate._id).select("-password -__v")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to updated Candidate"}`)
}
if(!updateCandidate){
  throw new ApiError(500, "DbError : Candidate not updated")
}
// return responce with updated data
return res
.status(200)
.json(new ApiResponce(200, updateCandidate, "successMessage : new skill add successfully"))
})

export const removeSkills = AsyncHandler(async (req, res) => {
/**
 * check candidate is login
 * check data from body
 * push data on skill array
 * return responce
 */
// check Candidate login
if(!req.userId){
  throw new ApiError(400, "Candidate not login, please login first")
}
if(req.userType !== "Candidate"){
  throw new ApiError(409, "LoginError : Unauthorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unauthorize Access")
}

// check data received from body
if(!req.params?.skillsArray){
  throw new ApiError(404, "DataError : No any data received from body")
}
// extract data from body
let {skillsArray} = req.params
if(skillsArray  === undefined){
  throw new ApiError(404, "DataError : All field is required")
}
skillsArray = skillsArray.replace("[", "")
skillsArray = skillsArray.replace("]", "")
skillsArray = skillsArray.split(", ")
if (skillsArray.length === 0){
  throw new ApiError(400, "DataError : No Any field is Empty")
}

if (skillsArray?.some(field => field === "")){
  throw new ApiError(400, "DataArrayError : No Any field is Empty")
}
// search Candidate by userId
let searchCandidate
try {
  searchCandidate = await Candidate.findById(req.userId).select("-password")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to find Candidate"}`)
}
if(!searchCandidate){
  throw new ApiError(400, "DbError : Candidate not Found")
}
for (let skill of skillsArray){
  
  if((!searchCandidate.keySkills.find(field => field === skill))){
    throw new ApiError(404, `DataError : ${skill} not exits in skills array`)
  }
}
// update Candidate
let updateCandidate
try {
  let newSkillsArray
  for (let skill of skillsArray){
    newSkillsArray = searchCandidate.keySkills.filter(value => value !== skill)
    if(newSkillsArray === undefined){
      throw new ApiError(500, "DbError : keySkills not removed")
    }  
    if (newSkillsArray === ""){
      throw new ApiError(500, "dbError : keySkills remove error")
    }
    searchCandidate.keySkills = newSkillsArray
    await searchCandidate.save({validateBeforeSave:false})
  }
  updateCandidate = await Candidate.findById(searchCandidate._id).select("-password -__v")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "unable to updated Candidate"}`)
}
if(!updateCandidate){
  throw new ApiError(500, "DbError : Candidate not updated")
}
// return responce with updated data
return res
.status(200)
.json(new ApiResponce(200, updateCandidate, "successMessage : skill remove successfully"))
})

export const changeCandidatePassword = AsyncHandler(async (req, res) => {
  /**
   * check Candidate already login : check accessToken in cookies
   * chack passwords received from body
   * varify password and update its
   * return result and responce
   */
  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }

  // check data received from body
  if(!req.body){
    throw new ApiError(404, "Not any data received")
  }
  // destruct data and validate
  const {oldPassword, newPassword} = req.body
  if([oldPassword, newPassword].some(field => field === undefined)){
    throw new ApiError(404, "All field is required")
  }
  if([oldPassword, newPassword].some(field => field?.toString().trim() === "")){
    throw new ApiError(400, "any field is not empty")
  }
  // search Candidate by userId
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to search Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate not find")
  }
  // check password validation
  if(!await searchCandidate.checkPasswordCorrect(oldPassword)){
    throw new ApiError(400, "DataError : given old password is not correct")
  }
  // set new password
  try {
    searchCandidate.password = newPassword
    await searchCandidate.save({validateBeforeSave:false})
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update update password"}`)
  }
  // check password setted
  if(!searchCandidate.checkPasswordCorrect(newPassword)){
    throw new ApiError(500, "DbError : Password not chenged")
  }
  // send Email
  sendEmail(searchCandidate.emailId, "Candidate Password change",`Candidate password chenge successFully. \nDate : ${new Date} \n NewPaasword : ${newPassword}`)
  // clear all cookie and return responce with success message
  return res
  .status(200)
  .clearCookie("accessToken", accessTokenCookieOption)
  .clearCookie("refreshToken", refreshTokenCookieOption)
  .json(new ApiResponce(200, {}, "successMessage : Candidate Password changes successfully"))
});

export const resetCandidatePassword = AsyncHandler(async (req, res) => {
  /**
   * check Candidate not login : check accessToken in cookies
   * check Candidate datails received from body
   * varify Candidate details and set password
   * return result and responce
   */
});

export const deleteCandidate = AsyncHandler(async (req, res) => {
  /**
   * check Candidate already login : check accessToken in cookies
   * delete Candidate and clear cookies
   * return result and responce
   */
  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }
  // serch Candidate by user id
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(ueq.userId).select("_id emailId")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to search Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate not found")
  }
  // Delete Candidate
  try {
    await Candidate.findByIdAndDelete(searchCandidate._id)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to delete Candidate"}`)
  }
  // send Email
  sendEmail(searchCandidate.emailId, "Candidate Accound Deleted", `Your candidate Account ${searchCandidate.emailId} deleted \nDate : ${new Date}`)
  // clear all cookie and return responce with successMessage
  return res
  .status(200)
  .clearCookie("accessToken", accessTokenCookieOption)
  .clearCookie("refreshToken", refreshTokenCookieOption)
  .json(new ApiResponce(200, {}, "successMessage : Candidate Deleted successFully"))
});

export const getCandidateDetails = AsyncHandler(async (req, res) => {
  /**
   * check Candidate already login
   * serch Candidate and return datails in responce
   */
// check Candidate login
if(!req.userId){
  throw new ApiError(400, "Candidate not login, please login first")
}
if(req.userType !== "Candidate"){
  throw new ApiError(409, "LoginError : Unauthorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unauthorize Access")
}
// search Candidate
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to search Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate not find")
  }
  // return responce with full Candidate data
  return res
  .status(200)
  .json(new ApiResponce(200, searchCandidate, "seccessMessage : Candidate Data returned"))
});

export const setAvatar = AsyncHandler(async (req, res) => {
  /**
   * check Candidate already login : check accessToken in cookies
   * reteive file localPath and upload in cloudinary
   * check previous Avatar url is not default url, then delete pic by url in cloudinary
   * set cloudinary url in Candidate database
   * return responce
   */
// check Candidate login
if(!req.userId){
  throw new ApiError(400, "Candidate not login, please login first")
}
if(req.userType !== "Candidate"){
  throw new ApiError(409, "LoginError : Unauthorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unauthorize Access")
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
  // serch Candidate data
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate Data"}`)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate not find")
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
  if(searchCandidate.avatar !== process.env.DEFAULT_USER_AVATAR){
    try {
      // remove file on cloudinary
      await removeToCloudinary(searchCandidate.avatar)
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "unable to remove file on cloudinary"}`)
    }
  }
  // update atavar in Candidate Database
  let updateCandidate
  try {
    updateCandidate = await Candidate.findByIdAndUpdate(
      searchCandidate._id,
      {
        $set : {avatar : cloudibaryResponce?.url}
      }, {new : true}
    ).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update Candidate"}`)
  }
  if(!updateCandidate){
    throw new ApiError(500, "DbError : Candidate not updated")
  }
  // return responce with updated Candidate Data
  return res
  .status(200)
  .json(200, updateCandidate, "successMessage : Candidate Avatar set successfully")
});

export const removeAvatar = AsyncHandler(async (req, res) => {
  /**
   * check Candidate already login : check accessToken in cookies
   * check Candidate Avatar is default
   * remove Avatar by Url in cloudinary
   * set Avatar to defalt
   * return responce
   */
  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }
// search Candidate data by userId
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate not finded")
  }
  // check avatar is defalt avatar
  if(searchCandidate.avatar === process.env.DEFAULT_USER_AVATAR){
    throw new ApiError(400, "Error : default avatar, not allow to remove")
  }
  // remove avatar from cloudinary
  try {
    await removeToCloudinary(searchCandidate.avatar)
  } catch (error) {
    throw new ApiError(500, `Error : ${error.message || "Unable to remove file from cloudinary"}`)
  }
  // updated Candidate Database
  let updateCandidate
  try {
    updateCandidate = await Candidate.findByIdAndUpdate(searchCandidate._id, {
      $set : {avatar : process.env.DEFAULT_USER_AVATAR}
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update Candidate"}`)
  }
  if(!updateCandidate){
    throw new ApiError(500, "DbError : Candidate not updated")
  }
  // return response with updated Candidate
  return res
  .status(200)
  .json(200, updateCandidate, "successMessage : Candidate Avatar removed")
});

export const uploadNewResume = AsyncHandler(async (req, res) => {
/**
 * check candidate login
 * check file received
 * reteive file local path
 * upload file in cloudinary
 * push file cloudinary url in db resume array
 * return responce
 */
// check Candidate login
if(!req.userId){
  throw new ApiError(400, "Candidate not login, please login first")
}
if(req.userType !== "Candidate"){
  throw new ApiError(409, "LoginError : Unauthorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unauthorize Access")
}
// search Candidate data by userId
let searchCandidate
try {
  searchCandidate = await Candidate.findById(req.userId).select("-password")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate"}`)
}
if(!searchCandidate){
  throw new ApiError(500, "DbError : Candidate not finded")
}

// check file received 
if(!req.file){

}
const fileLocalPath = req.file?.path

// upload file on cloudinary and received url responce
let cloudibaryResponce
try {
  cloudibaryResponce = await uploadToCloudinary(fileLocalPath)
} catch (error) {
  
}
if(!cloudibaryResponce){

}
// update candidate
let updateCandidate
try {
  updateCandidate = await Candidate.findByIdAndUpdate(searchCandidate._id, {
    $push : {
      resumeArray : cloudibaryResponce.url
    }
  },{new:true}).select("-password -__v")
} catch (error) {
  
}
if(!updateCandidate){

}

// return responce with updated array
return res
.status(200)
.json(new ApiResponce(200, updateCandidate, "successMessage : new resume add successfully "))

})

export const removeAResume = AsyncHandler(async (req, res) => {
/**
 * check candidate is login
 * check resume url received from params
 * find resume id availavel in resume array
 * filter resume array without given id and save
 * return responce
 */
// check Candidate login
if(!req.userId){
  throw new ApiError(400, "Candidate not login, please login first")
}
if(req.userType !== "Candidate"){
  throw new ApiError(409, "LoginError : Unauthorize Access")
}
if(req.params?.userId !== req.userId){
  throw new ApiError(409, "ParamsError : Unauthorize Access")
}
// search Candidate data by userId
let searchCandidate
try {
  searchCandidate = await Candidate.findById(req.userId).select("-password")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate"}`)
}
if(!searchCandidate){
  throw new ApiError(500, "DbError : Candidate not finded")
}

})

export const getAllResume = AsyncHandler(async (req, res) => {
  /**
   * check candidate is login
   * find all resume array
   * return responce
   */
  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }
// search Candidate data by userId
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate not finded")
  }
  
})

export const getAllJobsByCandidateField = AsyncHandler(async (req, res) => {
  /**
   * check candidate login : check accessToken in cookies
   * reteive candidate keyskills 
   * filter jobs by keyskills 
   * return result and responce
   */
  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }
// search Candidate data by userId
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate not finded")
  }
  // reteive all jobs
  let reteiveAllJobs
  try {
    reteiveAllJobs = await Job.find({field : searchCandidate.field})
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Jobs"}`)
  }
  if(!reteiveAllJobs){
    throw new ApiError(500, "DbError : No any jobs find")
  }
  return res 
  .status(200)
  .json(new ApiResponce(200, reteiveAllJobs, "successMessage : All jobs reteived"))
})

export const getAllApplications = AsyncHandler(async (req, res) => {
  /**
   * check candidate login : check accessToken in cookies
   * reteive all application by candidate applications array
   * return result and responce
   */
  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }
// search Candidate application by userId
  let searchCandidateAllApplication
  try {
    searchCandidateAllApplication = await Candidate.findById(req.userId).select("application")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate application"}`)
  }
  if(!searchCandidateAllApplication){
    throw new ApiError(500, "DbError : Candidate application not finded")
  }
  return res
  .status(200)
  .json(new ApiError(200, searchCandidateAllApplication, "successMessage : All application reteive"))
})

export const getAllSortedApplications = AsyncHandler(async (req, res) => {
  /**
   * check candidate login : check accessToken in cookies 
   * reteive all sorted application by candidate sorted applications array
   * return result and responce 
   */
  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }
// search Candidate all sorted application by userId
let searchCandidateAllSortedApplication
try {
  searchCandidateAllSortedApplication = await Candidate.findById(req.userId).select("sortedApplication")
} catch (error) {
  throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate application"}`)
}
if(!searchCandidateAllSortedApplication){
  throw new ApiError(500, "DbError : Candidate application not finded")
}
return res
.status(200)
.json(new ApiError(200, searchCandidateAllSortedApplication, "successMessage : All sorted application reteive"))
  
})

export const getApplicationDetails = AsyncHandler(async (req, res) => {
  /**
   * check candidate login : check accessToken in cookies
   * check application Id from params
   * retrive application details by application id
   * return result and responce
   */
  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }
  if(!req.params?.ApplicationId){
    throw new ApiError(404, "DataError : Application Id not find")
  }
// search Candidate data by userId
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate"}`)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate not finded")
  }
  if(!(
    searchCandidate.application.find(application => application.applicationId.toString() === req.params?.applicationId) || 
    searchCandidate.sortedApplication.find(application => application.applicationId.toString() === req.params?.applicationId) ||
    searchCandidate.rejectedApplication.find(application => application.applicationId.toString() === req.params?.applicationId) 
)){
  throw new ApiError(400, "DataError : Application id Incorrect")
  }
  // reteived application by application id
  let reteiveApplication
  try {
    reteiveApplication = await Application.findById(req.params?.ApplicationId)
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to find application"}`)
  }
  if(!reteiveApplication){
    throw new ApiError(500, "DbError : Application Details not find")
  }

  return res
  .status(200)
  .json(new ApiResponce(200,reteiveApplication, "siccessMessage : Application all data reteived"))
})

export const getEmployeeDetails = AsyncHandler(async (req, res) => {
  /**
   * check Candidate already login : check accessToken in cookies
   * get Candidate Id from params
   * search Candidate details from condidate Database
   * return candidate and responce
   */
  // check Candidate login
  if(!req.userId){
    throw new ApiError(400, "Candidate not login, please login first")
  }
  if(req.userType !== "Candidate"){
    throw new ApiError(409, "LoginError : Unauthorize Access")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(409, "ParamsError : Unauthorize Access")
  }
  // check Employee id received from parameters
  if(!req.params?.employeeId){
    throw new ApiError(404, "DataError : Employee Id not received" )
  }
  // search Candidate by userId
  let searchCandidate
  try {
    searchCandidate = await Candidate.findById(req.userId).select("-password -__v")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate"} `)
  }
  if(!searchCandidate){
    throw new ApiError(500, "DbError : Candidate Data not find")
  }
  // search Employee Data
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(req.params?.employeeId).select("_id fullName isActive avatar companyDetails jobsArray previousJobsArray")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate"}`)
  }
  if(!searchEmployee){
    throw new ApiError(500, "DbError : Candidate Data not find")
  }
  // return responce with all necessary info 
  return res 
  .status(200)
  .json(new ApiResponce(200, searchEmployee, "successMessage : candidate datails returned"))
});
