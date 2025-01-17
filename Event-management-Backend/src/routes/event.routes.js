import { Router } from "express";
import { isLogin } from "../middlewares/auth.middleware.js";
import { createNewEvent, getAllUsersEventslist, getEventDetails, removeEvent, updateEventDetails } from "../controllers/event.controller.js";

const eventRouter = Router()

eventRouter.route("/:userId/createNewEvent").post(isLogin, createNewEvent)

eventRouter.route("/:userId/getEventDetails/:eventId").get(isLogin, getEventDetails)

eventRouter.route("/:userId/getAllUsersEventList").get(isLogin, getAllUsersEventslist)

eventRouter.route("/:userId/updateEventDetails/:eventId").patch(isLogin, updateEventDetails)

eventRouter.route("/:userId/removeEvent/:eventId").delete(isLogin, removeEvent)

export default eventRouter