import Express from "express"
import Cookie from "cookie-parser"
import mainRouter from "./routes/main.routes.js"
const app = Express()

app.use(Express.json({limit:"16kb"}))
app.use(Express.static("public/temp"))
app.use(Cookie(process.env.COOKIE_SECRET))

app.use("/api/v1", mainRouter)

export default app