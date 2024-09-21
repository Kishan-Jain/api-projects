import { Router } from "express";
import {isLogin} from "../middlewares/auth.middlewares.js"
import { brackConnection, cancelConnectionSendRequest, checkConnection, getAllConnections, getAllReceivedConnectionRequest, getAllSendConnectionRequest, responceOnConnectionRequest, sendConnectionRequest } from "../controllers/connection.controller.js"

const connectionRouter = Router()

connectionRouter.route("/:userType/:userId/checkConnection/:secondUserType/:seconUserId").get(
  isLogin, checkConnection
)
connectionRouter.route("/:userType/:userId/getAllReceivedConnectionRequest").get(
  isLogin, getAllReceivedConnectionRequest
)
connectionRouter.route("/:userType/:userId/getAllSendConnectionRequest").get(
  isLogin, getAllSendConnectionRequest
)
connectionRouter.route("/:userType/:userId/getAllConnections").get(
  isLogin, getAllConnections
)
connectionRouter.route("/:userType/:userId/sendConnectionRequest/:secondUserType/:secondUserId").post(
  isLogin, sendConnectionRequest
)
connectionRouter.route("/:userType/:userId/responceOnConnectionRequest/:responce/:secondUserType/:secondUserId").post(
  isLogin, responceOnConnectionRequest
)
connectionRouter.route("/:userType/:userId/brackConnection/:secondUserType/:secondUserId").post(
  isLogin, brackConnection
)
connectionRouter.route("/:userType/:userId/cancelConnectionSendRequest/:secondUserType/:secondUserId").post(
  isLogin, cancelConnectionSendRequest
)

export default connectionRouter