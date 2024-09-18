import {Router} from "express";

// import controllers
import { loginUser, registerUser, logoutUser, getUserDetails, updateUser, changeUserPassword, setUserAvatar, removeUserAvatar, deleteUser, getAllEventList } from "../controllers/user.controller.js";

// import middlewares
import { isLogin, ifAlreadyLogin } from "../middlewares/auth.middleware.js";


const userRouter = Router();

userRouter.route("/register").post(ifAlreadyLogin ,registerUser);

userRouter.route("/login").post(ifAlreadyLogin, loginUser);

userRouter.route("/logout/:userId").post(isLogin, logoutUser)

userRouter.route("/getUserDetails/:userId").get(isLogin, getUserDetails)

userRouter.route("/updateUserDetails/:userId").post(isLogin, updateUser)

userRouter.route("/changeUserPassword/:userId").post(isLogin, changeUserPassword)

userRouter.route("/deleteUser/:userId").post(isLogin, deleteUser)

userRouter.route("/setUserAvatar/:userId").post(isLogin, setUserAvatar)

userRouter.route("/removeUserAvatar/:userId").post(isLogin, removeUserAvatar)

userRouter.route("/getAllEventList/:userId").get(isLogin, getAllEventList)

export default userRouter;
