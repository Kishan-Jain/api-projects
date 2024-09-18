import {Router} from "express";
import userRouter from "./user.routes.js";
import eventRouter from "./event.routes.js";

const mainRouter = Router()

mainRouter.use("/user", userRouter)
mainRouter.use("/event", eventRouter)


export default mainRouter