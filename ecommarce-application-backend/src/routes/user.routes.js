import { Router } from "express";

// middleware
import { ifAlreadyLogin, isLogin } from "../middlewares/auth.middleware.js"
import {} from "../middlewares/multer.middleware.js"

// controller
import { addAddress, changePassword, deleteUser, logOutUser, removeAddress, removeAvatar, setAvtar, updateUserData, userLogin, userLoginWithEmail, userRegister } from "../controllers/user.controller.js"
const userRouter = Router()


userRouter.route("/register").post(ifAlreadyLogin, userRegister)
userRouter.route("/loginByUserName").post(ifAlreadyLogin, userLogin)
userRouter.route("/loginByEmail").post(ifAlreadyLogin, userLoginWithEmail)

userRouter.route("/logout/:userId").post(isLogin, logOutUser)
userRouter.route("/setAvatar/:userId").patch(isLogin, setAvtar)
userRouter.route("/removeAvatar/:userId").patch(isLogin, removeAvatar)

userRouter.route("/updateDetails/:userId").patch(isLogin, updateUserData)
userRouter.route("/changePassword/:userId").patch(isLogin, changePassword)
userRouter.route("/deleteUser/:userId").delete(isLogin, deleteUser)

userRouter.route("/:userId/addAddress").patch(isLogin, addAddress)
userRouter.route("/:userId/removeAddress/:addressId").patch(isLogin, removeAddress)
export default userRouter