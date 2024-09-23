import express from "express";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// inport routes


// difining routes 

// render server define massage in home page Wep Request
app.get("/", (req, res) => {
  res.send(
    `<><h1>This is Server site Application</h1>
    <h2>So please use "POSTMAN" or other server side rendring tools with useing readme file for understanding</h2></>`
  )
})

export { app };
