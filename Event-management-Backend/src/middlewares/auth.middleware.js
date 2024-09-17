import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

// When check user login or not, for logout or avoid login/register page;
export const varifyCookie = async (req, res, next) => {
  // Check if cookie or authorization header is present
  if(!(req.cookies["AccessToken"] || req.params?.Authorization )){
    throw new ApiError()
  }
  const accessToken = req.cookies["AccessToken"] || (req.params?.Authorization)?.toString().replase("Bearer ", "").trim()

  let decodeToken
  try {
    decodeToken = jwt.verify(
      accessToken, process.env.ACCESS_TOKEN_SECRET_KEY
    )
  } catch (error) {
    throw new ApiError
  }
  if(!decodeToken){
    throw new ApiError
  }
  req.userId = decodeToken._id
  next()
};

// when check user login or not, for direct jump profile page / updates
export const ifLogin = async (req, res, next) => {
  // Check if cookie or authorization header is present
  if (req.cookies["AccessToken"] || req.params?.Authorization ) {
  throw new ApiError  
  }
  next()
};
