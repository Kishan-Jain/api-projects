import ApiError from "./apiError.js"

export function isSpace(text){
  if(!text){
    throw new ApiError(404, "DataError : Text not received in function")
  }
  return text.split("").filter(char => char === " ").length === 0
}