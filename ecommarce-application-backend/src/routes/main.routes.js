import {Router} from "express"

import userRouter from "./user.routes.js"
import sellerRouter from "./seller.routes.js"
const mainRouter = Router()

mainRouter.use("/user", userRouter)
mainRouter.use("/seller", sellerRouter)

export default mainRouter