import  ApiError  from "./apiError.js";

/* 
take user -> genrate refresh and access token by schema method -> chack genrate or not -> 
save refresh token on database -> return tokens for users
*/

const accessAndRefreshTokenGenerator = async (user) => {
  try {
    if(!user){

    }
    let accessToken, refreshToken
    try {
      accessToken = await user.generateAccessToken();
    } catch (error) {
      
    }
    try {
      refreshToken = await user.generateRefreshToken();
    } catch (error) {
      
    }
    
    if (
      [accessToken, refreshToken].some((field) => field === undefined)
    ) {
      throw new ApiError(500, "server error in generating Tokens");
    }

    if (
      [accessToken, refreshToken].some((field) => field.trim() === "") ||
      !(accessToken || refreshToken)
    ) {
      throw new ApiError(500, "server error in genrating Tokens");
    }

    return {accessToken, refreshToken};
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "server error - something wrong in genreting tokens"
    );
  }
};

export default accessAndRefreshTokenGenerator