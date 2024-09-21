export default class ApiResponce {
    constructor(
        statusCode = 200,
        data,
        message = "success message"
    ){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.successMessage = statusCode < 400
    }
}