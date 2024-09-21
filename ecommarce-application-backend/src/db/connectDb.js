import mongoose from "mongoose";
import { dbName } from "../constants.js";

const DATABASE_URI = process.env.DATABASE_URI 
const connenctDb = async () => {
  try {
    const db = await mongoose.connect(`${DATABASE_URI}/${dbName}`);
    console.log(`Database connected successfully; \nDB HOST: ${db.connection.host}`);
  } catch (error) {
    console.log(`DB connection error :: - ${error}`);
    process.exit(1);
  }
};

export default connenctDb;


