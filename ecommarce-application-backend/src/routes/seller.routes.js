import { Router } from "express";

// middleware
import { ifAlreadyLogin, isLogin } from "../middlewares/auth.middleware.js"
import {} from "../middlewares/multer.middleware.js"

// controller
import { addAddress, changePassword, deleteUser, logOutUser, removeAddress, removeAvatar, setAvtar, updateSellerData, sellerLogin, sellerLoginWithEmail, sellerRegister } from "../controllers/seller.controller.js"
const sellerRouter = Router()


sellerRouter.route("/register").post(ifAlreadyLogin, sellerRegister)
sellerRouter.route("/loginByUserName").post(ifAlreadyLogin, sellerLogin)
sellerRouter.route("/loginByEmail").post(ifAlreadyLogin, sellerLoginWithEmail)

sellerRouter.route("/logout/:userId").post(isLogin, logOutUser)
sellerRouter.route("/setAvatar/:userId").patch(isLogin, setAvtar)
sellerRouter.route("/removeAvatar/:userId").patch(isLogin, removeAvatar)

sellerRouter.route("/updateDetails/:userId").patch(isLogin, updateSellerData)
sellerRouter.route("/changePassword/:userId").patch(isLogin, changePassword)
sellerRouter.route("/deleteUser/:userId").delete(isLogin, deleteUser)

sellerRouter.route("/:userId/addAddress").patch(isLogin, addAddress)
sellerRouter.route("/:userId/removeAddress/:addressId").patch(isLogin, removeAddress)

export default sellerRouter