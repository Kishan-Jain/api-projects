import express from "express";
import cookieParser from "cookie-parser";

const app = express()

app.use(express.json({limit : "24kb"}))
app.use(express.urlencoded({extended:true, limit:"24kb"}))
app.use(cookieParser())
app.use(express.static("public"))

// render server define massage in home page Wep Request
app.get("/", (req, res) => {
  
  res.send(
    `
    <div><h1>This is Server site Application</h1>
    <h2>please use "POSTMAN" or other server side rendring tools with using readme file for understanding</h2></div>
    `
  )
})

export default app