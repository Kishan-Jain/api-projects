
export default class ApiError extends Error{
    constructor(
        statusCode,
        errors = [],
        massage = "some thing went to wrong",
    )
    {
        super(massage)

        this.data = null
        this.message = massage
        this.errors = errors
        this.success = false
        this.statusCode = statusCode
        }
    }
