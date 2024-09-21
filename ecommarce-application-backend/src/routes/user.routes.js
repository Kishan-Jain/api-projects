import {Router} from "express"
import { addAddress, logOutUser, setAvtar, userLogin, userRegister } from "../controllers/user.controllers.js"
import { varifyAuth } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const userRouter = Router()

userRouter.route("/register").post(userRegister)
userRouter.route("/login").post(userLogin)


// secure routes

userRouter.route("/logout").post(varifyAuth, logOutUser)
userRouter.route("/setavatar").post(upload.single("avatar"), varifyAuth, setAvtar)
userRouter.route("/addaddress").post(varifyAuth, addAddress)


export {userRouter}