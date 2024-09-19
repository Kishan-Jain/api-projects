import express from "express";
import cookieParser from "cookie-parser";
import mainRouter from "./routes/main.routes.js";

const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json({limit : "24kb"}))
app.use(cookieParser())
app.use(express.static("public"))

app.use("/api/v1", mainRouter)


export default app