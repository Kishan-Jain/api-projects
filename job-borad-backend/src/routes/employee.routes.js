import express from "express";
import { ifAlreadyLogin, isLogin } from "../middlewares/auth.middlewares.js";
import { uploadInLocalStorage } from "../middlewares/multer.middlewares.js";
import {
  changeEmployeePassword,
  deleteEmployee,
  getAllJobs,
  getAllPreviousJobs,
  getCandidateDetails,
  loginEmployee,
  logoutEmployee,
  registerEmployee,
  removeEmployeeAvatar,
  resetEmployeePassword,
  setEmployeeAvatar,
  updateEmployeeCompanyDetails,
  updateEmployeeFullName,
  getEmployeeDetails,
} from "../controllers/employee.controllers.js";

const employeeRouter = express.Router();

employeeRouter.route("/register").post(ifAlreadyLogin, registerEmployee);
employeeRouter.route("/login").post(ifAlreadyLogin, loginEmployee);
employeeRouter.route("/logout/:userId").post(isLogin, logoutEmployee);
employeeRouter
  .route("/updateEmployee/updateEmployeeFullName/:userId")
  .patch(isLogin, updateEmployeeFullName);
employeeRouter
  .route("/updateEmployee/updateEmployeeCompanyDetails/:userId")
  .patch(isLogin, updateEmployeeCompanyDetails);
employeeRouter
  .route("/updateEmployee/changeEmployeePassword/:userId")
  .patch(isLogin, changeEmployeePassword);
employeeRouter
  .route("/updateEmployee/resetEmployeePassword")
  .patch(ifAlreadyLogin, resetEmployeePassword);
employeeRouter.route("/deleteEmployee/:userId").delete(isLogin, deleteEmployee);
employeeRouter
  .route("/getEmployeeDetails/:userId")
  .get(isLogin, getEmployeeDetails);
employeeRouter
  .route("/updateEmployee/:userId/setAvater/")
  .patch(isLogin, uploadInLocalStorage.single("avatar"), setEmployeeAvatar);
employeeRouter
  .route("/updateEmployee/:userId/removeAvatar/:avatarUrl")
  .patch(isLogin, removeEmployeeAvatar);
employeeRouter
  .route("/:userId/getCandidateDetails/:candidateId")
  .get(isLogin, getCandidateDetails);
employeeRouter.route("/getAllJobs/:userId").get(isLogin, getAllJobs);
employeeRouter
  .route("/getAllPreviousJobs/:userId")
  .get(isLogin, getAllPreviousJobs);




export default employeeRouter;
