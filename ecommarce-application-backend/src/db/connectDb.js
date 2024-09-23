import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";


const connenctDb = async (dbUri, dbName) => {
  try {
    const db = await mongoose.connect(`${dbUri}/${dbName}`);
    console.log(`Database connected successfully; \nDB HOST: ${db.connection.host}`);
  } catch (error) {
    throw new ApiError(500, `DbCoonectionError : ${error.message || "DATABASE connection faild"}`)
  }
};

export default connenctDb;


