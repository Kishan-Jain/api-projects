import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

// When check user login or not, for logout or avoid login/register page;
export const isLogin = async (req, res, next) => {
  /**
   * check accessToken
   * decode accessToken
   * assign userId in request object
   * call next
   */
  // Check if cookie or authorization header is present
  if(!(req.cookies["AccessToken"] || req.params?.Authorization )){
    throw new ApiError(404, "LoginError : Not received any cookies or autherization parameter")
  }

  const accessToken = req.cookies["AccessToken"] || (req.params?.Authorization)?.toString().replase("Bearer ", "").trim()

  // decode accessToken
  let decodeToken
  try {
    decodeToken = jwt.verify(
      accessToken, process.env.ACCESS_TOKEN_SECRET_KEY
    )
  } catch (error) {
    throw new ApiError(500, `JwtError : ${error.message || "Unable to decode accessToken"}`)
  }
  if(!decodeToken){
    throw new ApiError(400, "LoginError : AccessToken not valid")
  }

  // assign userId in request object
  req.userId = decodeToken._id
  next()
};

// when check user login or not, for direct jump profile page / updates
export const ifAlreadyLogin = async (req, res, next) => {
  /**
   * check accessToken exitanse
   * call next function
   */

  // Check if cookie or authorization header is present
  if (req.cookies["AccessToken"] || req.params?.Authorization ) {
  throw new ApiError(400, "LoginError : AccessToken cookie or autherization parameter is exits, please logout or clear cookies")
  }
  // call simply next when access token not exits
  next()
};
