import { ApiError } from "./apiError.js";

/* 
take user -> genrate refresh and access token by schema method -> chack genrate or not -> 
save refresh token on database -> return tokens for users
*/

const accessAndRefreshTokenGenrator = async (user) => {
  try {
    const accessToken = await user.genrateAccessToken();
    const refreshToken = await user.genrateRefreshToken();

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
      error?.massage || "server error - something wrong in genreting tokens"
    );
  }
};



export {accessAndRefreshTokenGenrator}