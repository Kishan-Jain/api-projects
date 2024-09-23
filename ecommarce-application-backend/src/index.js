// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
// env configration
dotenv.config({
  path: "../.env",
});

import { app } from "./app.js";
import connenctDb from "./db/connectDb.js";

const port = process.env.PORT
// DataBase Uri
const DbUri = process.env.DB_URI
const DbName = process.env.DB_NAME
// database connection and start server
connenctDb(DbUri, DbName)
  .then(
    app.listen(port, () => {
      console.log(`server listern on PORT : ${port}`);
    })
  )
  .catch((error) => {
    console.log(`DB-Server connection error :- ${error.message}`);
  });

