import { ApiError } from "./apiError.js"

// Function to generate access and refresh tokens for a user
export const AccessRefreshTokenGenerator = async (user) => {
    try {
        // Check if the user object is available
        if (!user) {
            // Throw an error if the user object is not available
            throw new ApiError(500, "User not available") 
        }

        // Generate refresh token
        const refreshToken = await user.GenerateRefreshToken() 
        // Generate access token
        const accessToken = await user.GenerateAccessToken() 
        
        // Return the generated tokens
        return { refreshToken, accessToken }
    } catch (error) {
        // Return an ApiError object in case of failure
        return new ApiError(500, error.message || "Token generation failed") 
    }
}
