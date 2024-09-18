import {Router} from "express";
import userRouter from "./user.routes";
import eventRouter from "./event.routes";

const mainRouter = Router()

mainRouter.use("/user", userRouter)
mainRouter.use("/event", eventRouter)


export default mainRouter