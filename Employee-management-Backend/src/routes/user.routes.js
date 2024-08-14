import express from "express";

// import controllers
import { loginPage, loginUser, registerPage, registerUser, profile, logout } from "../controllers/userController.js";

// import middlewares
import { CheckLogger, CookieCheck, LoginCheck } from "../middlewares/auth.middleware.js";


const userRouter = express.Router();

// Route for user registration
userRouter.route("/register").post(registerUser);

// Route for user login
userRouter.route("/").post(loginUser);

// Route for user profile (requires login)
userRouter.route("/profile").get(LoginCheck, CheckLogger, profile);

// Route for user logout (requires login)
userRouter.route("/logout").all(LoginCheck, logout);

export { userRouter };
