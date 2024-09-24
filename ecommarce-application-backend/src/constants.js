export const AccessTokenCookieOption = {
  httpOnly : true,
  secure : true,
  maxAge : 24*60*60*1000
}

export const RefreshTokenCookieOption = {
  httpOnly : true,
  secure : true,
  maxAge : 15*24*60*60*1000
}