import { Router } from "express";
import { sellerRegister } from "../controllers/seller.controller.js";

export const sellerRouter = Router();

sellerRouter.route("/register").post(sellerRegister);
