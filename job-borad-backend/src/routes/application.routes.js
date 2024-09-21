import {Router} from "express"
import { isLogin } from "../middlewares/auth.middlewares.js"
import { applyJobVacancy, getPerticulerApplicationDetailsForEmployee, markToRejectedJobApplication, markToSortlistedJobApplication, matchApplicationWithJobKeySkills } from "../controllers/jobs.controllers.js"

const applicationRouter = Router()

applicationRouter.route("/:userId/applyVacancy/:vacancyId").post(
  isLogin, applyJobVacancy
)
applicationRouter.route("/:userId/getApplicationFullData/:applicationId").post(
  isLogin, getPerticulerApplicationDetailsForEmployee
)
applicationRouter.route("/:userId/matchKeySkillsInApplication/:applicationId/:vacancyId").post(
  isLogin, matchApplicationWithJobKeySkills
)
applicationRouter.route("/:userId/markToSortedApplication/:applicationId/:vacancyId").patch(
  isLogin, markToSortlistedJobApplication
)
applicationRouter.route("/:userId/markToRejectedApplication/:applicationId/:vacancyId").patch(
  isLogin, markToRejectedJobApplication
)


export default applicationRouter