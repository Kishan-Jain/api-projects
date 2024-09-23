import Express from "express"
import Cookie from "cookie-parser"
import mainRouter from "./routes/main.routes.js"
const app = Express()

app.use(Express.json({limit:"16kb"}))
app.use(Express.static("public/temp"))
app.use(Cookie(process.env.COOKIE_SECRET))

app.use("/api/v1", mainRouter)

// render server define massage in home page Wep Request
app.get("/", (req, res) => {
  res.send(
    `<><h1>This is Server site Application</h1>
    <h2>So please use "POSTMAN" or other server side rendring tools with useing readme file for understanding</h2></>`
  )
})

export default app