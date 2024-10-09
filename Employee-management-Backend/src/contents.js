
  // Define cookie options for access and refresh tokens
  export const accessTokenCookieOption = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000 // maxAge one day
  };

  export const refreshTokenCookieOption = {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000 // maxAge fifteen days
  };