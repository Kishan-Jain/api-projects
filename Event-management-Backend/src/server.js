import dotenv from "dotenv";
import server from "./server.socket.js";
import connectDB from "./db/connect.db.js"
import ApiError from "./utils/apiError.js";

// dotenv configration
dotenv.config({
    path:"../.env"
})

const port = process.env.PORT
const dbUri = process.env.DB_URI
const dbName = process.env.DB_NAME

 
connectDB(dbUri, dbName)
.then(
    server.listen(port, () => {
        console.log(`Server is listen on Port : ${port}`)
}))
.catch( (error) => {
    throw new ApiError(500, `ServerDbConnectionError : ${error.message || "Unable to connect DB-Server"}`)
})

