import {Router} from "express";
import {isLogin} from "../middlewares/auth.middlewares.js"
import { cancelFollowingRequst, checkFollowed, checkFollowing, getAllFollowersData, getAllFollowersRequestData, getAllFollowingData, getAllFollowingRequestData, removeToFollowedList, removeToFollowingList, responceOnFollowRequest, sendFollowRequest } from "../controllers/following.controller.js"

const followingRouter = Router()

followingRouter.route("/:userType/:userId/getAllFollowingData").get(
  isLogin, getAllFollowingData
)
followingRouter.route("/:userType/:userId/getAllFollowersData").get(
  isLogin, getAllFollowersData
)
followingRouter.route("/:userType/:userId/getAllFollowingRequestData").get(
  isLogin, getAllFollowersRequestData
)
followingRouter.route("/:userType/:userId/getAllFollowersRequestData").get(
  isLogin, getAllFollowingRequestData
)
followingRouter.route("/:userType/:userId/checkFollowed/:secondUserType/:secondUserId").get(
  isLogin, checkFollowed
)
followingRouter.route("/:userType/:userId/checkFollowing/:secondUserType/:secondUserId").get(
  isLogin, checkFollowing
)

followingRouter.route("/:userType/:userId/removeFollowers/:secondUserType/:secondUserId").post(
  isLogin, removeToFollowedList
)
followingRouter.route("/:userType/:userId/removeFollowing/:secondUserType/:secondUserId").post(
  isLogin, removeToFollowingList
)
followingRouter.route("/:userType/:userId/sendFollowRequest/:secondUserType/:secondUserId").post(
  isLogin, sendFollowRequest
)
followingRouter.route("/:userType/:userId/responceOnFollowRequest/:responce/:secondUserType/:secondUserId").post(
  isLogin, responceOnFollowRequest
)

followingRouter.route("/:userType/:userId/cancelFollowingRequest/:secondUserType/:secondUserId").post(
  isLogin, cancelFollowingRequst
)

export default followingRouter