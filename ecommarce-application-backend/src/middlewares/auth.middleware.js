import ApiError from "../utils/apiError.js"
import jwt from "jsonwebtoken"

// retrebe user - access token (cookie, ) 
// jwt verify method -> access sekret key 
// id -> user -> return req



export const isLogin = async(req, res, next) => {
    try {
        if(!(req.cookies?.accessToken || req.header("Authorization"))){
            throw new ApiError(401, "authError : AccessToken not available, please login again")
        }
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        if (!accessToken){
            throw new ApiError(400, "loginError : AccessToken not recieved")
        }
        const decodeAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY)

        if (!decodeAccessToken){
            throw new ApiError(400, "AuthError : AccessToken not Correct")
        }

        req.userId = decodeAccessToken._id
        req.userType = decodeAccessToken.userType
        next()
    } catch (error) {
        throw new ApiError(500, `authError : ${error.message || "Unable to check userLogin"}`)
    }
}

export const ifAlreadyLogin = async(req, res, next) => {
    try {
        if(req.cookies?.accessToken || req.header("Authorization")){
            throw new ApiError(401, "authError : User already login, please logout or clear cookies")
        }
        next()
    } catch (error) {
        throw new ApiError(500, `authError : ${error.message || "Unable to check userLogin"}`)
    }
}