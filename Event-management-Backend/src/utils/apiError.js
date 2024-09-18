
export default class ApiError extends Error{
    constructor(
        statusCode,
        message = "some thing went to wrong",
        errors = [],
    )
    {
        super(message)

        this.data = null
        this.message = message
        this.errors = errors
        this.success = false
        this.statusCode = statusCode
        }
    }
