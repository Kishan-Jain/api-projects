import express from "express";
import cookieParser from "cookie-parser";
import mainRouter from "./routes/main.routes.js";

const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json({limit : "24kb"}))
app.use(cookieParser())
app.use(express.static("public"))

app.use("/api/v1", mainRouter)

// render server define massage in home page Wep Request
app.get("/", (req, res) => {
  res.send(
    `<><h1>This is Server site Application</h1>
    <h2>So please use "POSTMAN" or other server side rendring tools with useing readme file for understanding</h2></>`
  )
})

export default app