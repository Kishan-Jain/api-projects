import { ApiError } from "../utils/apiError.js"
import jwt from "jsonwebtoken"

// retrebe user - access token (cookie, ) 
// jwt verify method -> access sekret key 
// id -> user -> return req



export const varifyAuth = async(req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        if (!accessToken){
            throw new ApiError(401, "unauthorized access")
        }
        const decodeAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        if (!decodeAccessToken){
            throw new ApiError(400, "Invalid AccessToken")
        }
        
        const userId = decodeAccessToken._id

        req.userId = userId
        next()
    } catch (error) {
        throw new ApiError(500, error?.massage || "server error : some thing went to wrong")
    }


}