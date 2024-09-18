import express from "express";
import cookieParser from "cookie-parser";
import mainRouter from "./routes/main.routes";

const app = express()

app.use(express.json({limit : "24kb"}))
app.use(express.urlencoded({extended:true, limit:"24kb"}))
app.use(cookieParser())

app.use("/api/v1", mainRouter)


export default app