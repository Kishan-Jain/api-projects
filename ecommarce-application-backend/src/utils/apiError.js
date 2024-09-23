export default class ApiError extends Error{
    constructor(
        statusCode,
        massage = "Some error founds",
        errors = [],
        stack = ""
    ){
      super(massage),

      this.data = null
      this.statusCode = statusCode
      this.massage = massage
      this.success = false
      this.errors = errors
      
      if (stack) {
        this.stack = stack
      } else {
        Error.captureStackTrace(this, this.construtor)
      }
    }
}
