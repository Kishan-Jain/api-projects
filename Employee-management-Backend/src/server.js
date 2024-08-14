import dotenv from "dotenv";
import app from "./app.js"
import connectDB from "./db/connectDB.js"
import ApiError from "./utils/apiError.js";

// dotenv configration
dotenv.config({
    path:"./env"
})

connectDB()
.then(
app.listen(8000, () => {
    console.log("server listen on http://localhost:8000")
}))
.catch( (error) => {
    throw new ApiError(500, error.message || "Enable to connect DB-Server")
})
