import { Router } from "express";
import {isLogin} from "../middlewares/auth.middlewares.js"
import {deactivateVacancy, getPerticulerVacancyFullDetailsForEmployee, getPerticulerVacancyFullDetailsForUsers, publishNewJobVacancy, reactivateVacancy, updateVacancyDetails} from "../controllers/jobs.controllers.js"

const jobsRouter = Router()

jobsRouter.route("/:userId/publishNewVacancy").post(
  isLogin, publishNewJobVacancy
)
jobsRouter.route("/getVacancyDetails/:vacancyId").get(getPerticulerVacancyFullDetailsForUsers)

jobsRouter.route("/:userId/getVacancyFullDetails/:vacancyId").get(
  isLogin, getPerticulerVacancyFullDetailsForEmployee
)
jobsRouter.route("/:userId/updateVacancyDetails/:vacancyId").patch(
  isLogin, updateVacancyDetails
)
jobsRouter.route("/:userId/deactivateVacancy/:vacancyId").patch(
  isLogin, deactivateVacancy
)
jobsRouter.route("/:userId/reactivateVacancy/:vacancyId").patch(
  isLogin, reactivateVacancy
)



export default jobsRouter