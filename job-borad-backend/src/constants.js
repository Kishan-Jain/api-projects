export const accessTokenCookieOption = {
  httpOnly : true,
  secure : true,
  maxAge : 1000*60*60*24
}

export const refreshTokenCookieOption = {
  httpOnly : true,
  secure : true,
  maxAge : 1000*60*60*24*15
}