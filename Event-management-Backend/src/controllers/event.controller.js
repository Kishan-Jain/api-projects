/**
 * create new event
 * update event details
 * remove event 
 * 
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
})

export const updateEventDetails = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check userId and event id in params
   * check event id is exits in user data
   * check data is received from body
   * update event data
   * return responce
   */
})

export const removeEvent = asyncHandler(async (req, res) => {
  /**
   * check user is login
   * check user id and event id in params
   * check event id is exits in user Data
   * delete event from event collactions and user data event array
   * return responce
   */
})