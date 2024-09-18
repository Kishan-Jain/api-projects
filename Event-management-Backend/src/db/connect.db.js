import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";

const connectdb = async (dbUri, dbName) => {
    try {
        const DB = await mongoose.connect(`${dbUri}/${dbName}`);
        console.log(`DataBase connected successfully! \nDB Host : ${DB.connection.host}`)
    } catch (error) {
        throw new ApiError(500, `DbConnectionError : ${error.message || "Database connection faild"}`)
    }
}

export default connectdb