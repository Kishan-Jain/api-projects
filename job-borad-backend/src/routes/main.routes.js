import { Router } from "express";
import employeeRouter from "./employee.routes.js";
import candidateRouter from "./candidates.routes.js";
import jobsRouter from "./jobs.routes.js";
import applicationRouter from "./application.routes.js";
import followingRouter from "./following.routes.js";
import connectionRouter from "./connection.routes.js";

const mainRouter = Router()

mainRouter.use("/employee", employeeRouter)
mainRouter.use("/candidate", candidateRouter)
mainRouter.use("/jobs", jobsRouter)
mainRouter.use("/application", applicationRouter)
mainRouter.use("/followUtils", followingRouter)
mainRouter.use("/connectionUtils", connectionRouter)
export default mainRouter