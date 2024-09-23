import dotenv from "dotenv";
import app from "./app.js"
import connectDB from "./db/connect.db.js"
import ApiError from "./utils/apiError.js";

// dotenv configration
dotenv.config({
    path:"./env"
})

const port = process.env.PORT
const dbUri = process.env.DB_URI
const dbName = process.env.DB_NAME

connectDB(dbUri, dbName)
.then(
app.listen(port, () => {
    console.log(`server listen on PORT : ${port}`)
}))
.catch( (error) => {
    console.log("DB eoonection error")
})
