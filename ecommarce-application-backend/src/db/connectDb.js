import mongoose from "mongoose";
import { dbName } from "../constants.js";


const connenctDb = async (dbUri, dbName) => {
  try {
    const db = await mongoose.connect(`${dbUri}/${dbName}`);
    console.log(`Database connected successfully; \nDB HOST: ${db.connection.host}`);
  } catch (error) {
    console.log(`DB connection error :: - ${error}`);
    process.exit(1);
  }
};

export default connenctDb;


