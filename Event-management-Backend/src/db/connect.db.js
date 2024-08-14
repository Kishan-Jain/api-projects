import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";

const DB_uri = process.env.DATABASE_URI
const DB_name = process.env.DATABASE_NAME


const connectdb = async () => {
    try {
        const DB = await mongoose.connect(`${DB_uri}/${DB_name}`);
        console.log(`DataBase connected successfully! \n DB Host : ${DB.connection.host}`)
    } catch (error) {
        throw new ApiError(500, error.message || "Database connection faild")
    }
}

export default connectdb