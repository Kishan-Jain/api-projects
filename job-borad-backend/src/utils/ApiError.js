export default class ApiError extends Error {
    constructor(
        statusCode, 
        massage = "Throw Error Messages",
        errors = [],
        stack = ""
    ){  
        super(massage)
        this.data = null
        this.statusCode = statusCode
        this.message = this.message
        this.errors = errors
        this.success = false
        
        if (stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}