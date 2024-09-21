// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import { app } from "./app.js";
import connenctDb from "./db/connectDb.js";
import { port } from "./constants.js";

// env configration
dotenv.config({
  path: "./.env",
});

// database connection and start server
connenctDb()
  .then(
    app.listen(port, () => {
      console.log(`server listern on http://localhost:${port}`);
    })
  )
  .catch((error) => {
    console.log(`Database-app connection error :- ${error}`);
  });

