import express from "express";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// inport routes
import { userRouter } from "./routes/user.routes.js";
import { sellerRouter } from "./routes/seller.routes.js";


// difining routes 
app.use("/api/v1/user",userRouter)
app.use("/api/v1/seller", sellerRouter)


export { app };
