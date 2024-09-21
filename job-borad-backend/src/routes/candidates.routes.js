import { Router } from "express";
import { ifAlreadyLogin, isLogin } from "../middlewares/auth.middlewares.js";
import { uploadInLocalStorage } from "../middlewares/multer.middlewares.js";
import {
  addAreaOfIntrest,
  addNewSkills,
  changeCandidatePassword,
  deleteCandidate,
  getAllApplications,
  getAllJobsByCandidateField,
  getAllResume,
  getAllSortedApplications,
  getApplicationDetails,
  getCandidateDetails,
  getEmployeeDetails,
  loginCandidate,
  logoutCandidate,
  registerCandidate,
  removeAreaOfIntrest,
  removeAResume,
  removeAvatar,
  removeSkills,
  resetCandidatePassword,
  setAvatar,
  updateCandidateField,
  updateCandidateFullName,
  uploadNewResume,
} from "../controllers/candidate.controllers.js";

const candidateRouter = Router();

candidateRouter.route("/register").post(ifAlreadyLogin, registerCandidate);
candidateRouter.route("/login").post(ifAlreadyLogin, loginCandidate);
candidateRouter.route("/logout/:userId").post(isLogin, logoutCandidate);
candidateRouter
  .route("/updateCandidate/updateCandidateFullname/:userId")
  .patch(isLogin, updateCandidateFullName);
candidateRouter
  .route("/updateCandidate/updateCandidateField/:userId")
  .patch(isLogin, updateCandidateField);
candidateRouter
  .route("/updateCandidate/addAreaOfIntrest/:userId")
  .patch(isLogin, addAreaOfIntrest);
candidateRouter
  .route("/updateCandidate/removeAreaOfIntrest/:userId/:intrestName")
  .patch(isLogin, removeAreaOfIntrest);
candidateRouter
  .route("/updateCandidate/addCandidateNewSkill/:userId")
  .patch(isLogin, addNewSkills);
candidateRouter
  .route("/updateCandidate/removeCandidateSkills/:userId/:skillsArray")
  .patch(isLogin, removeSkills);
candidateRouter
  .route("/updateCandidate/changeCandidatePassword/:userId")
  .patch(isLogin, changeCandidatePassword);
candidateRouter
  .route("/updateCandidate/resetCandidatePassword")
  .patch(ifAlreadyLogin, resetCandidatePassword);
candidateRouter
  .route("/deleteCandidate/:userId")
  .delete(isLogin, deleteCandidate);
candidateRouter
  .route("/getCandidateDetails/:userId")
  .get(isLogin, getCandidateDetails);
candidateRouter
  .route("/updateCandidate/setAvatar/:userId")
  .patch(isLogin, uploadInLocalStorage.single("candidateAvatar"), setAvatar);
candidateRouter
  .route("/updateCandidate/removeAvatar/:userId")
  .patch(isLogin, removeAvatar);
candidateRouter
  .route("/updateCandidate/uploadNewResume/:userId")
  .patch(isLogin, uploadInLocalStorage.single("resume"), uploadNewResume);
candidateRouter
  .route("/updateCandidate/removeResume/:userId/:resumeUrl")
  .patch(isLogin, removeAResume);
candidateRouter.route("/:userId/getAllResume").get(isLogin, getAllResume);
candidateRouter
  .route("/:userId/jobs/getAllJobsbyField")
  .get(isLogin, getAllJobsByCandidateField);
candidateRouter
  .route("/:userId/jobs/applications/getAllApplications")
  .get(isLogin, getAllApplications);
candidateRouter
  .route("/:userId/jobs/applications/getAllSortedApplications")
  .get(isLogin, getAllSortedApplications);
candidateRouter
  .route("/:userId/jobs/applications/getApplicationDetails/:ApplicationId")
  .get(isLogin, getApplicationDetails);
candidateRouter
  .route("/:userId/getEmployeeDetails/:employeeId")
  .get(isLogin, getEmployeeDetails);

export default candidateRouter;
