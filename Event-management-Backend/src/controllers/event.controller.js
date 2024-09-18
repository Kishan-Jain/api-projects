/**
 * create new event
 * get event details
 * get all users event list
 * update event details
 * remove event 
 */
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/event.models.js";
import UserDetail from "../models/user.models.js";

// Controller for new Event 
export const createNewEvent = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check user id in params
   * check data is received from body
   * add data in event collection with userId
   * push data id in user data
   * return responce
   */

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // check userId received from params and validate
  if(req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(404, "DataError : Data not received");
  }

  // Extract data from body
  const {title, description, location, startDate, endDate} = req.body

  // /validate data fields
  if([
    title, description, location, startDate, endDate
  ].some(field => field===undefined)){
    throw new ApiError(404, "DataError : All fields is required")
  }
  if([
    title, description, location, startDate, endDate
  ].some(field => field?.toString().trim() === "")){
    throw new ApiError(400, "DataError : No any field is Empty")
  }
  
  // serch user details
  let searchUserDetails
  try {
    searchUserDetails = await UserDetail.findById(req.userId).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to search user"}`)
  }
  if(!searchUserDetails){
    throw new ApiError(400, "DbError : User not found")
  }

  // create and save new Event
  let newEvent
  try {
    newEvent = await Event.create({
      title, description, location, startDate, endDate,
      userId : req.userId
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to save new Event"}`)
  }
  if(!newEvent){
    throw new ApiError(500, "DbError : New Event not created")
  }

  // add event id in user data
  let updateUserDetails
  try {
    updateUserDetails = await UserDetail.findByIdAndUpdate(searchUserDetails._id, {
      $push : {
        eventsArray : {EventId : newEvent._id}
      }
    }, {new:true}).select("-password")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to Update user EventArray"}`)
  }
  if(!updateUserDetails){
    throw new ApiError(500, "DbError : user event array not updated")
  }

  // return responce and creted new event data
  return res
  .status(200)
  .json(new ApiResponse(
    200, {
      UserDetails : updateUserDetails,
      EventDatails : newEvent
    },
    "successMessage : Event created successfully"
  ))
})

// Controller for reteived Event details
export const getEventDetails = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check userId and event id in params
   * check eventId exits in user event array
   * reteived event details by event id
   * return responce
   */
  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // check userId received from params and validate
  if(req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // Validate eventId from params
  if (!req.params?.eventId){
    throw new ApiError(400, "DataError : Event Id not received from params");
  }

  // search user details from database by userId
  let searchUserDetails
  try {
    searchUserDetails = await UserDetail.findById(req.userId).select("-password")
  } catch (error) {
     throw new ApiError(500, `DbError : ${error.message || "Unable to Find user"}`)
  }
  if(!searchUserDetails){
    throw new ApiError(500, "DbError : user not found")
  }

  // check event id exits in user event array
  if(!(searchUserDetails.eventsArray.find(objectId => objectId.EventId?.toString() === req.params?.eventId))){
    throw new ApiError(400, "DataError : Event id not exits in user event array")
  }

  // update event details
  let reteivedEventDetails
  try {
    reteivedEventDetails = await Event.findById(req.params?.eventId)
  } catch (error) {
     throw new ApiError(500, `DbError : ${error.message || "Unable to find Event"}`)
  }
  if(!reteivedEventDetails){
    throw new ApiError(500, "DbError : Event not found")
  }

  // return responce with event details
  return res
  .status(200)
  .json(new ApiResponse(
    200, reteivedEventDetails, "SuccessMessage : event details reteived"
  ))
})

// Controller of get all Users event list
export const getAllUsersEventslist = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * reteive all event 
   * get and save user details by event userId
   * return responce
   */
  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // check userId received from params and validate
  if(req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // reteived all event
  let findAllEvent
  try {
    findAllEvent = await Event.find().select("-description")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find event"}`)
  }
  if(!findAllEvent){
    throw new ApiError(500, "DbError : Event not found")
  }
  for(let event of findAllEvent){
    let searchUser
    try {
      searchUser = await UserDetail.findById(event.userId).select("userName fullName")
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find user"}`)
    }
    if(!searchUser){
      throw new ApiError(500, "DbError : User not found")
    }
    try {
      event.userName = searchUser.userName
      event.userFullName = searchUser.fullName
    } catch (error) {
      throw new ApiError(500, "Error : User data assigning in event object faild")
    }
  }

  return res
  .status(200)
  .json(
    200, findAllEvent, "SuccessMessage : all event reteived"
  )
})

// Controller for update Event details
export const updateEventDetails = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check userId and event id in params
   * check event id is exits in user data
   * check data is received from body
   * update event data
   * return responce
   */

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // check userId received from params and validate
  if(req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // Validate eventId from params
  if (!req.params?.eventId){
    throw new ApiError(400, "DataError : Event Id not received from params");
  }

  // Validate request body fields
  if (!req.body) {
    throw new ApiError(400, "DataError : Data not received");
  }

  // search user details from database by userId
  let searchUserDetails
  try {
    searchUserDetails = await UserDetail.findById(req.userId).select("-password")
  } catch (error) {
     throw new ApiError(500, `DbError : ${error.message || "Unable to Find user"}`)
  }
  if(!searchUserDetails){
    throw new ApiError(500, "DbError : user not found")
  }

  // check event id exits in user event array
  if(!(searchUserDetails.eventsArray.find(objectId => objectId.EventId?.toString() === req.params?.eventId))){
    throw new ApiError(400, "DataError : Event id not exits in user event array")
  }

  // update event details
  let updateEventDetails
  try {
    updateEventDetails = await Event.findByIdAndUpdate(req.params?.eventId, {
      $set : req.body
    }, {new:true})
  } catch (error) {
     throw new ApiError(500, `DbError : ${error.message || "Unable to update Event Details"}`)
  }
  if(!updateEventDetails){
    throw new ApiError(500, "DbError : Event Details not updated")
  }

  // return responce with update Event details
  return res
  .status(200)
  .json(new ApiResponse(
    200, updateEventDetails, "successMessage : Event details is updated"
  ))
})

// controller for remove Event
export const removeEvent = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check user id and event id in params
   * check event id is exits in user Data
   * delete event from event collactions and user data event array
   * return responce
   */

  // Check if user is authenticated
  if (!req.userId) {
    throw new ApiError(401, "LoginError : User not logged in, please login first");
  }

  // check userId received from params and validate
  if(req.params?.userId){
    throw new ApiError(404, "DataError : UserId not received from params")
  }
  if(req.params?.userId !== req.userId){
    throw new ApiError(400, "AuthError : User not authorized")
  }

  // Validate eventId from params
  if (!req.params?.eventId){
    throw new ApiError(400, "DataError : Event Id not received from params");
  }
  
  // search user data from database by userId
  let searchUserDetails
  try {
    searchUserDetails = await UserDetail.findById(req.userId).select("-password")
  } catch (error) {
     throw new ApiError(500, `DbError : ${error.message || "Unable to find user"}`)
  }
  if(!searchUserDetails){
    throw new ApiError(400, "DbError : User not found")
  }

  // check event id exits in User Event Array
  if(!(searchUserDetails.eventsArray.find(objectId => objectId.EventId?.toString() === req.params?.eventId))){
    throw new ApiError(400, "DataError : Event id not exits in User event array")
  }

  // delete Event by eventId
  try {
    await Event.findByIdAndDelete(req.params?.eventId)
  } catch (error) {
     throw new ApiError(500, `DbError : ${error.message || "Unable to find or remove Event"}`)
  }
  // validate deletation
  if(await Event.findById(req.params?.eventId)){
    throw new ApiError(500, "DbError : Event deletation error")
  }

  // remove event Id from user event array
  try {
    const updateEventArray = searchUserDetails.eventsArray.filter(objectId => objectId.EventId?.toString() !== req.params?.eventId)
    searchUserDetails.eventsArray = updateEventArray
    await searchUserDetails.save({validateBeforeSave : false})
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update user event array"}`)
  }
  // validate event id removedation
  if(searchUserDetails.eventsArray.find(objectId => objectId.EventId?.toString() === req.params?.eventId)){
    throw new ApiError(500, "DbError : EventId not remove from user event array")
  }

  // return responce
  return res
  .status(200)
  .json(new ApiResponse(
    200, {}, "successMessage : Event remove successfully"
  ))  
})