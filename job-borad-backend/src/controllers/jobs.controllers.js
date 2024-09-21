/**
 * publish a vacancy vacancy
 * get perticeler vacancy details by vacancyId for user
 * get perticeler vacancy details by vacancyId for Employee
 * update vacancy details
 * deactivate vacancy
 * reactivate vancancy
 */

import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import Job from "../models/jobs.models.js";
import Employee from "../models/empoleeyes.models.js";
import Candidate from "../models/candidates.models.js";
import Application from "../models/applications.models.js";
import sendEmail from "../utils/manageMail.js";

export const publishNewJobVacancy = AsyncHandler(async (req, res) => {
  /**
   * check employee is login
   * check necessary data is received
   * fill data in vacancy model and save
   * save vacancys Id in employee vacancys array
   * return responce
   */

  // check Employee login
  if (!req.userId) {
    throw new ApiError(400, "Employee not login, please login first");
  }
  if (req.userType !== "Employee") {
    throw new ApiError(409, "LoginError : Unauthorize Access");
  }
  if (req.params?.userId !== req.userId) {
    throw new ApiError(409, "ParamsError : Unauthorize Access");
  }

  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received");
  }
  const {
    title,
    description,
    type,
    startStatus,
    field,
    keySkills,
    numberOfOpening,
    maxApplications,
    applicationStartDate,
    applicationEndDate,
  } = req.body;

  if (
    [
      title,
      description,
      type,
      startStatus,
      field,
      keySkills,
      numberOfOpening,
      maxApplications,
      applicationStartDate,
      applicationEndDate,
    ].some((field) => field === undefined)
  ) {
    throw new ApiError(404, "DataError : All field is required");
  }
  if (
    [
      title,
      description,
      type,
      startStatus,
      field,
      keySkills,
      numberOfOpening,
      maxApplications,
      applicationStartDate,
      applicationEndDate,
    ].some((field) => field?.toString().trim() === "")
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }

  let createNewJob;
  try {
    createNewJob = await Job.create({
      employeeId: req.userId,
      title,
      description,
      type,
      startStatus,
      field,
      keySkills,
      numberOfOpening,
      maxApplications,
      applicationStartDate,
      applicationEndDate,
    });
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to create new vacancy "}`
    );
  }
  if (!createNewJob) {
    throw new ApiError(500, "DbError : Job not created");
  }
  let searchNewCreatedJob;
  try {
    searchNewCreatedJob = await Job.findById(createNewJob._id);
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to find new created vacancy"}`
    );
  }
  if (!searchNewCreatedJob) {
    throw new ApiError(500, "DbError : new created vacancy not find");
  }
  const newJobId = {
    jobTitle : searchNewCreatedJob.title,
    jobId: searchNewCreatedJob._id,
    addDate: Date.now(),
  };
  let addJobIdInEmployee;
  try {
    addJobIdInEmployee = await Employee.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          vacancysArray: newJobId,
        },
      },
      { new: true }
    ).select("vacancysArray previousJobsArray");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to update Employee"} `
    );
  }
  if (!addJobIdInEmployee) {
    throw new ApiError(500, "DbError : Employee not updated");
  }

  // send Email
  sendEmail(emailId, "Job Publish successfully", `Job Published successfull \n 
    \njobtitle : ${title},
    \nDesription : ${description},
    \ntype : ${type},
    \nfield : ${field},
    \nkeySkills : ${keySkills},
    \napplicationStartDate : ${applicationStartDate},
    \napplicationEndDate : ${applicationEndDate}
    `)

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        [createNewJob, addJobIdInEmployee],
        "successMessage : vacancy vacancy add successfully"
      )
    );
});

export const getPerticulerVacancyFullDetailsForEmployee = AsyncHandler(
  async (req, res) => {
    /**
     * check employee is login
     * check vacancy id recieved from param
     * serch vacancy and return full data
     */
    // check Employee login
    if (!req.userId) {
      throw new ApiError(400, "Employee not login, please login first");
    }
    if (req.userType !== "Employee") {
      throw new ApiError(409, "LoginError : Unauthorize Access");
    }
    if (req.params?.userId !== req.userId) {
      throw new ApiError(409, "ParamsError : Unauthorize Access");
    }
    // check vacancy id
    if (!req.params?.vacancyId) {
      throw new ApiError(404, "DataError : No any field received");
    }
    // check user authorize for access
    if (
      (await Job.findById(req.params?.vacancyId))?.employeeId.toString() !==
      req.userId
    ) {
      throw new ApiError(409, "LoginError : Employee unauthorize to access");
    }
    let searchVacancyDetails;
    try {
      searchVacancyDetails = await Job.findById(req.params?.vacancyId).select(
        "-maxApplications -applicationArray"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "unable to find jab info"}`
      );
    }
    if (!searchVacancyDetails) {
      throw new ApiError(404, "vacancy info not finded");
    }
    return res
      .status(200)
      .json(
        new ApiResponce(
          200,
          searchVacancyDetails,
          "successMessage : Vacancy data received successfully"
        )
      );
  }
);

export const getPerticulerVacancyFullDetailsForUsers = AsyncHandler(
  async (req, res) => {
    /**
     * check vacancy id recieved from param
     * serch vacancy and return full data
     */
    // check vacancy id received from params
    if (!req.params?.vacancyId) {
      throw new ApiError(
        404,
        "DataError : vacancy id not received from params"
      );
    }
    // serch vacancy details
    let searchVacancyDetails;
    try {
      searchVacancyDetails = await Job.findById(req.params?.vacancyId).select(
        "-maxApplications -applicationArray"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "unable to find jab info"}`
      );
    }
    if (!searchVacancyDetails) {
      throw new ApiError(404, "vacancy info not finded");
    }
    // return responce
    return res
      .status(200)
      .json(
        new ApiResponce(
          200,
          searchVacancyDetails,
          "successMessage : Vacancy data received successfully"
        )
      );
  }
);

export const updateVacancyDetails = AsyncHandler(async (req, res) => {
  /**
   * check employee is login
   * check vacancy id on params
   * check nessary data received from body
   * update vacancy
   * return responce
   */

  // check Employee login
  if (!req.userId) {
    throw new ApiError(400, "Employee not login, please login first");
  }
  if (req.userType !== "Employee") {
    throw new ApiError(409, "LoginError : Unauthorize Access");
  }
  if (req.params?.userId !== req.userId) {
    throw new ApiError(409, "ParamsError : Unauthorize Access");
  }
  if (!req.params?.vacancyId) {
    throw new ApiError(404, "DataError : vacancyId not received from params");
  }

  if (
    (await Job.findById(req.params?.vacancyId))?.employeeId.toString() !==
    req.userId
  ) {
    throw new ApiError(409, "LoginError : Employee unauthorize to access");
  }
  if (
    (await Job.findById(req.params?.vacancyId))?.status.toString() !== "Active"
  ) {
    throw new ApiError(409, "LoginError : Job Vacancy not active stage");
  }

  if (!req.body) {
    throw new ApiError(404, "no any data received from params");
  }
  // const {description, keySkills, numberOfOpening, maxApplications, applicationEndDate} = req.body
  let searchEmployee
  try {
    searchEmployee = await Employee.findById(req.userId).select("emailId")
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Employee"}`)
  }
  if(!searchEmployee){
    throw new ApiError(500, "Employee not find")
  }
  let updateJobDetails;
  try {
    updateJobDetails = await Job.findByIdAndUpdate(
      req.params.vacancyId,
      {
        $set: req.body,
      },
      { new: true }
    ).select("-applicationArray");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to update vacancy details"}`
    );
  }
  if (!updateJobDetails) {
    throw new ApiError(500, "DbError : Job details not updated");
  }
  // send Email
  sendEmail(searchEmployee.emailId, "Update job Details", `Your Job ${updateJobDetails.title} is updated ${new Date}`)
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        updateJobDetails,
        "successMessage : vacancy details updated successfully"
      )
    );
});

export const deactivateVacancy = AsyncHandler(async (req, res) => {
  /**
   * check employee is login
   * check vacancy id on params
   * chang vacancy to deactive
   * cut vacancy id from employee vacancy array and paste previous vacancy array
   * return responce
   */

  // check Employee login
  if (!req.userId) {
    throw new ApiError(400, "Employee not login, please login first");
  }
  if (req.userType !== "Employee") {
    throw new ApiError(409, "LoginError : Unauthorize Access");
  }
  if (req.params?.userId !== req.userId) {
    throw new ApiError(409, "ParamsError : Unauthorize Access");
  }
  if (!req.params?.vacancyId) {
    throw new ApiError(404, "DataError : vacancyId not received from params");
  }
  if (
    (await Job.findById(req.params?.vacancyId))?.employeeId.toString() !==
    req.userId
  ) {
    throw new ApiError(409, "LoginError : Employee unauthorize to access");
  }
  if (
    (await Job.findById(req.params?.vacancyId))?.status.toString() ===
    "Deactive"
  ) {
    throw new ApiError(409, "LoginError : Vacancy allready deactivate");
  }
  let makeVacancyDeactive;
  try {
    makeVacancyDeactive = await Job.findByIdAndUpdate(
      req.params?.vacancyId,
      {
        $set: {
          status: "Deactive",
        },
        $setOnInsert: {
          deactiveDate: Date.now(),
        },
      },
      { new: true }
    ).select("-applicationArray");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "unable to deactivate vacancy"} `
    );
  }
  if (!makeVacancyDeactive) {
    throw new ApiError(500, "DbError : Vacancy not deactivate");
  }
  const vacancyId = {
    jobTitle : makeVacancyDeactive.title,
    jobId: makeVacancyDeactive._id,
    startDate: makeVacancyDeactive.startDate,
    addDate: Date.now(),
  };
  let changeEmployeeJobArray;
  try {
    changeEmployeeJobArray = await Employee.findById(req.userId);
    const newJobArray = changeEmployeeJobArray.vacancysArray.filter(
      (field) => field.vacancyId?.toString() !== makeVacancyDeactive._id?.toString()
    );
    changeEmployeeJobArray.vacancysArray = newJobArray;
    changeEmployeeJobArray.save({ validateBeforeSave: false });
    changeEmployeeJobArray = await Employee.findByIdAndUpdate(
      req.userId,
      {
        $push: { previousJobsArray: vacancyId },
      },
      { new: true }
    ).select("emailId vacancysArray previousJobsArray");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to change Employee vacancy array"}`
    );
  }
  if (!changeEmployeeJobArray) {
    throw new ApiError(500, "DbError : Employee Job Array not changed");
  }
  // send Email
  sendEmail(changeEmployeeJobArray.emailId, "Job Deactivate", `Job "title : ${ makeVacancyDeactive.title}" deactivate Now. \nDate : ${new Date}  `)
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        [makeVacancyDeactive, changeEmployeeJobArray],
        "successMessage : Vacancy deactivate marked"
      )
    );
});

export const reactivateVacancy = AsyncHandler(async (req, res) => {
  /**
   * check employee is login
   * check vacancy id on params
   * check vacancy is deactive
   * change vacancy to active
   * cut vacancy id from employee previous vacancy array and paste vacancy array
   * return responce
   */

  // check Employee login
  if (!req.userId) {
    throw new ApiError(400, "Employee not login, please login first");
  }
  if (req.userType !== "Employee") {
    throw new ApiError(409, "LoginError : Unauthorize Access");
  }
  if (req.params?.userId !== req.userId) {
    throw new ApiError(409, "ParamsError : Unauthorize Access");
  }
  if (!req.params?.vacancyId) {
    throw new ApiError(404, "DataError : vacancyId not received from params");
  }
  if (
    (await Job.findById(req.params?.vacancyId))?.employeeId.toString() !==
    req.userId
  ) {
    throw new ApiError(409, "LoginError : Employee unauthorize to access");
  }
  if (
    (await Job.findById(req.params?.vacancyId))?.status.toString() !==
    "Deactive"
  ) {
    throw new ApiError(409, "DataError : Vacancy not deactivate");
  }
  let makeVacancyActivate;
  try {
    makeVacancyActivate = await Job.findByIdAndUpdate(
      req.params?.vacancyId,
      {
        $set: {
          status: "Active",
          deactiveDate: undefined,
        },
      },
      { new: true }
    ).select("-applicationArray");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "unable to deactivate vacancy"} `
    );
  }
  if (!makeVacancyActivate) {
    throw new ApiError(500, "DbError : Vacancy not deactivate");
  }
  const vacancyId = {
    jobTitle : makeVacancyActivate.title,
    jobId: makeVacancyActivate._id?.toString(),
    addDate: makeVacancyActivate.startDate,
  };
  let changeEmployeeJobArray;
  try {
    changeEmployeeJobArray = await Employee.findById(req.userId);
    const newPreviousJobArray = changeEmployeeJobArray.previousJobsArray.filter(
      (field) => field.vacancyId?.toString() !== makeVacancyActivate._id?.toString()
    );
    changeEmployeeJobArray.previousJobsArray = newPreviousJobArray;
    changeEmployeeJobArray.save({ validateBeforeSave: false });
    changeEmployeeJobArray = await Employee.findByIdAndUpdate(
      req.userId,
      {
        $push: { vacancysArray: vacancyId },
      },
      { new: true }
    ).select("emailId vacancysArray previousJobsArray");
  } catch (error) {
    throw new ApiError(
      500,
      `DbError : ${error.message || "Unable to change Employee vacancy array"}`
    );
  }
  if (!changeEmployeeJobArray) {
    throw new ApiError(500, "DbError : Employee Job Array not changed");
  }
  // send Email
  sendEmail(changeEmployeeJobArray.emailId, "Job Deactivate", `Job "title : ${ makeVacancyActivate.title}" ReActivate Now. \nDate : ${new Date}  `)
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        [makeVacancyActivate, changeEmployeeJobArray],
        "successMessage : Vacancy Activate marked"
      )
    );
});

/**
 * apply for vacancys vacancy
 * match application with vacancy keyskills
 * application mark to sorted
 * application mark to rejected
 */

export const applyJobVacancy = AsyncHandler(async (req, res) => {
  /**
   * check Candidate is login
   * check vacancyId received from params
   * check necessary data received from body
   * create new application object and save
   * save this application ID in vacancy application array and candidate aaplication array
   * return responce with application details
   */
  // check Candidate login
  if (!req.userId) {
    throw new ApiError(400, "Candidate not login, please login first");
  }
  if (req.userType !== "Candidate") {
    throw new ApiError(409, "LoginError : Unauthorize Access");
  }
  if (req.params?.userId !== req.userId) {
    throw new ApiError(409, "ParamsError : Unauthorize Access");
  }
  if (!req.params?.vacancyId) {
    throw new ApiError(404, "DataError : vacancyId not received from params");
  }
  if (!req.body) {
    throw new ApiError(404, "DataError : No any data received from body");
  }

  const { keySkills, candidateResume } = req.body;
  if ([keySkills, candidateResume].some((field) => field === undefined)) {
    throw new ApiError(404, "DataError : All field is required");
  }
  if (
    [keySkills, candidateResume].some(
      (field) => (field === field?.toString().trim()) === ""
    )
  ) {
    throw new ApiError(400, "DataError : No any field is Empty");
  }
  let findVacancyDetails;
  try {
    findVacancyDetails = await Job.findById(req.params?.vacancyId).select(
      "-applocationArray"
    );
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Vacancy Details"}`);
  }
  if (!findVacancyDetails) {
    throw new ApiError(500, "DbError : Vacanvy details not find");
  }
  let findCandidateDetails;
  try {
    findCandidateDetails = await Candidate.findById(req.userId).select(
      "-password"
    );
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate Details"}`);
  }
  if (!findCandidateDetails) {
    throw new ApiError(500, "DbError : Candidate details not find");
  }

  let createNewApplication;
  try {
    createNewApplication = await Application.create({
      jobTitle: findVacancyDetails.title,
      jobId: findVacancyDetails._id,
      candidateId: findCandidateDetails._id,
      candidateName: findCandidateDetails.fullName,
      keySkills,
      candidateResume,
    });
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to create new Application"}`);
  }
  if (!createNewApplication) {
    throw new ApiError(500, "DbError : New Application not created");
  }
  let findNewCreateApplication;
  try {
    findNewCreateApplication = await Application.findById(
      createNewApplication._id
    );
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find new created application"}`);
  }
  if (!findNewCreateApplication) {
    throw new ApiError(500, "DbError : new created application not finded");
  }
  // add application id on candidate and job application array
  const applicationId = {
    applicationId : findNewCreateApplication._id,
    date : Date.now()
  }
  let updateJobApplicationArray
  try {
    updateJobApplicationArray = await Job.findByIdAndUpdate(req.params?.vacancyId, {
      $push : {applicationArray : applicationId}
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update job array"}`)
  }
  if(!updateJobApplicationArray){
    throw new ApiError(500, "DbError : Job array not updated")
  }
  let updateCandidateApplicationArray
  try {
    updateCandidateApplicationArray = await Candidate.findByIdAndUpdate(req.userId, {
      $push : {application : applicationId}
    })
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "unable to update job array"}`)
  }
  if(!updateCandidateApplicationArray){
    throw new ApiError(500, "DbError : Job array not updated")
  }
  // send Email
  sendEmail(findCandidateDetails.emailId, "Job Application Received", `Job "title : ${jobTitle}" \n application received `)
  return res
    .status(201)
    .json(
      new ApiResponce(
        201,
        findNewCreateApplication,
        "successMessage : Application successFully submited"
      )
    );
});

export const getPerticulerApplicationDetailsForEmployee = AsyncHandler(async (req,res) => {
  /**
     * check Employee is login
     * check application id received from params
     * return responce with application details
     */
    // check Employee login
    if (!req.userId) {
      throw new ApiError(400, "Employee not login, please login first");
    }
    if (req.userType !== "Employee") {
      throw new ApiError(409, "LoginError : Unauthorize Access");
    }
    if (req.params?.userId !== req.userId) {
      throw new ApiError(409, "ParamsError : Unauthorize Access");
    }
    if (!req.params?.applicationId) {
      throw new ApiError(
        404,
        "DataError : Application Id not received from params"
      );
    }
    let findApplicationDetails;
    try {
      findApplicationDetails = await Application.findById(
        req.params?.applicationId
      );
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find Application Details"}`);
    }
    if (!findApplicationDetails) {
      throw new ApiError(500, "Application details not finded");
    }
    return res
    .status(200)
    .json(new ApiResponce(200, findApplicationDetails, "successMessage : application data is received"))
})

export const matchApplicationWithJobKeySkills = AsyncHandler(
  async (req, res) => {
    /**
     * check Employee is login
     * check application id received from params
     * retevieve vacancy from vacancyId by application and match keySkills from vacancy and application
     * update application varification process if Done
     * return responce with application
     */
    // check Employee login
    if (!req.userId) {
      throw new ApiError(400, "Employee not login, please login first");
    }
    if (req.userType !== "Employee") {
      throw new ApiError(409, "LoginError : Unauthorize Access");
    }
    if (req.params?.userId !== req.userId) {
      throw new ApiError(409, "ParamsError : Unauthorize Access");
    }
    if (!req.params?.vacancyId) {
      throw new ApiError(404, "DataError : vacancyId not received from params");
    }
    if (!req.params?.applicationId) {
      throw new ApiError(
        404,
        "DataError : Application Id not received from params"
      );
    }
    let findVacancyDetails;
    try {
      findVacancyDetails = await Job.findById(req.params?.vacancyId);
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find vacancy details"}`);
    }
    if (!findVacancyDetails) {
      throw new ApiError(500, "DbError : vacancy Details not finded");
    }findVacancyDetails.applicationArray.find(
      (app) => console.log(app.applicationId?.toString()))
    console.log(req.params?.applicationId)
    if (!(findVacancyDetails.applicationArray.find(
        (app) => app.applicationId?.toString() === req.params?.applicationId))) {
      throw new ApiError(400, "DataError : application Id not match");
    }
    let findApplicationDetails;
    try {
      findApplicationDetails = await Application.findById(
        req.params?.applicationId
      );
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find Application Details"}`);
    }
    if (!findApplicationDetails) {
      throw new ApiError(500, "Application details not finded");
    }
    const keySkills = findApplicationDetails.keySkills;
    const i = keySkills.length !== 0 ? 100 / keySkills.length : 0;
    let match = 0;
    for (let skill of keySkills) {
      if (
        findVacancyDetails.keySkills.filter((key) => key === skill).length > 0
      ) {
        match += i;
      }
    }
    let updateApplication;
    if (match > 80) {
      try {
        updateApplication = await Application.findByIdAndUpdate(
          findApplicationDetails._id,
          {
            $set: {
              applicationVarificationStatus: `Varified, skills match : ${match}%`,
            },
          }, {new : true}
        );
      } catch (error) {
        throw new ApiError(500, `DbError : ${error.message || "Unable to update application"}`);
      }
    } else {
      try {
        updateApplication = await Application.findByIdAndUpdate(
          findApplicationDetails._id,
          {
            $set: {
              applicationVarificationStatus: `Not Varified, skills match : ${match}% only`,
            },
          }, {new:true}
        );
      } catch (error) {
        throw new ApiError(500, `DbError : ${error.message || "Unable to update application"}`);
      }
    }
    if (!updateApplication) {
      throw new ApiError(500, "DbError : Application not updated");
    }
    let findCandidateDetails
    try {
      findCandidateDetails = await Candidate.findById(updateApplication.candidateId).select("emailId")
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "unable to find candidate"}`)
    }
    if(!findCandidateDetails){
      throw new ApiError(404, "DbError : candidate not find")
    }
    // send Email
    sendEmail(findCandidateDetails.emailId, "Job Application updated", `congratulation : ${findCandidateDetails.fullName} \n Job "title : ${jobTitle}" \n application varify your key skills `)
    return res
      .status(200)
      .json(
        new ApiResponce(
          200,
          updateApplication,
          "successMessage : Application update varification status"
        )
      );
  }
);

export const markToSortlistedJobApplication = AsyncHandler(async (req, res) => {
  /**
   * check Employee is login
   * check application id and vacancy Id received from params
   * match vacancy id from application
   * check application varification status is done
   * update application states Sorted
   * chenge application array candidate models
   * return responce with message
   */
  if (!req.userId) {
    throw new ApiError(400, "Employee not login, please login first");
  }
  if (req.userType !== "Employee") {
    throw new ApiError(409, "LoginError : Unauthorize Access");
  }
  if (req.params?.userId !== req.userId) {
    throw new ApiError(409, "ParamsError : Unauthorize Access");
  }
  if (!req.params?.vacancyId) {
    throw new ApiError(404, "DataError : vacancyId not received from params");
  }
  if (!req.params?.applicationId) {
    throw new ApiError(
      404,
      "DataError : Application Id not received from params"
    );
  }
  let findVacancyDetails;
  try {
    findVacancyDetails = await Job.findById(req.params?.vacancyId);
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find vacancy details"}`);
  }
  if (!findVacancyDetails) {
    throw new ApiError(500, "DbError : Vacancy details not finded");
  }
  if (
    !findVacancyDetails.applicationArray.find(
      (app) => app.applicationId?.toString() === req.params?.applicationId
    )
  ) {
    throw new ApiError(400, "DataError : Application id not correct");
  }
  let findApplicationDetails;
  try {
    findApplicationDetails = await Application.findById(
      req.params?.applicationId
    );
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Application Details"}`);
  }
  if (!findApplicationDetails) {
    throw new ApiError(500, "Application Details not find");
  }
  let findCandidateDetails;
  try {
    findCandidateDetails = await Candidate.findById(
      findApplicationDetails.candidateId
    ).select("-password");
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find Candidate Details"}`);
  }
  if (!findCandidateDetails) {
    throw new ApiError(500, "DbError : Candidate details not finded");
  }
  if(findApplicationDetails.applicationStatus !== "Pending"){
    throw new ApiError(400, "DataError : Apllication not in Pamding stage")
  }
  let updateApplication;
  try {
    updateApplication = await Application.findByIdAndUpdate(
      findApplicationDetails._id,
      {
        $set: { applicationStatus: "Sorted" },
      }, {new:true}
    );
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update Application status"}`);
  }
  if (!updateApplication) {
    throw new ApiError(500, "DbError : Application not updated");
  }
  const applicationId = {
    applicationId : updateApplication._id,
    date : updateApplication.createdAt
  }
  let updateCandidate;
  try {
    if(!(findCandidateDetails.application.find(field => field.applicationId?.toString() === updateApplication._id.toString()))){
      throw new ApiError(400, "DataError : Application not found")
    }
    let newApplicationArray = findCandidateDetails.application.filter(field => field.applicationId?.toString() !== updateApplication._id?.toString())
    console.log(newApplicationArray)
    findCandidateDetails.application = newApplicationArray
    await findCandidateDetails.save({validateBeforeSave:false})
    updateCandidate = await Candidate.findByIdAndUpdate(findCandidateDetails._id, {
      $push : {sortedApplication : applicationId}
    }, {new:true}).select("-password");
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update Candidate"}`);
  }
  if (!updateCandidate) {
    throw new ApiError(500, "DbError : Candidate not Updated");
  }
  // send Email
  sendEmail(updateCandidate.emailId, "Job Application updates", `Congratulation ${updateCandidate.fullName} \nJob "title : ${jobTitle}" \n application sortlisted, we contact you for next step very soon `)

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        updateApplication,
        "successMessage : Application mark to sorted"
      )
    );
});

export const markToRejectedJobApplication = AsyncHandler(async (req, res) => {
  /**
   * check Employee is login
   * check application id and vacancy Id received from params
   * match vacancy id from application
   * check application varification status is done
   * update application states rejected
   * chenge application array candidate models
   * return responce with message
   */
  if (!req.userId) {
    throw new ApiError(400, "Employee not login, please login first");
  }
  if (req.userType !== "Employee") {
    throw new ApiError(409, "LoginError : Unauthorize Access");
  }
  if (req.params?.userId !== req.userId) {
    throw new ApiError(409, "ParamsError : Unauthorize Access");
  }
  if (!req.params?.vacancyId) {
    throw new ApiError(404, "DataError : vacancyId not received from params");
  }
  if (!req.params?.applicationId) {
    throw new ApiError(
      404,
      "DataError : Application Id not received from params"
    );
  }
  let findVacancyDetails;
  try {
    findVacancyDetails = await Job.findById(req.params?.vacancyId);
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find vacancy Details"}`);
  }
  if (!findVacancyDetails) {
    throw new ApiError(500, "DbError : Vacancy details not find");
  }
  if (
    !findVacancyDetails.applicationArray.find(
      (app) => app.applicationId?.toString() === req.params?.applicationId
    )
  ) {
    throw new ApiError(400, "DbError : Application Id not correct");
  }
  let findApplicationDetails;
  try {
    findApplicationDetails = await Application.findById(
      req.params?.applicationId
    );
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find application details"}`);
  }
  if (!findApplicationDetails) {
    throw new ApiError(500, "DbError : Application Details not finded");
  }
  let findCandidateDetails;
  try {
    findCandidateDetails = await Candidate.findById(
      findApplicationDetails.candidateId
    ).select("-password");
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to find candidate details"}`);
  }
  if (!findCandidateDetails) {
    throw new ApiError(500, "DbError : cancicate details not find");
  }
  if(findApplicationDetails.applicationStatus !== "Pending"){
    throw new ApiError(400, "DataError : Apllication not in Pending stage")
  }
  let updateApplication;
  try {
    updateApplication = await Application.findByIdAndUpdate(
      findApplicationDetails._id,
      {
        $set: { applicationStatus: "Rejected" },
      }, {new : true}
    );
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to updated application status"}`);
  }
  if (!updateApplication) {
    throw new ApiError(500, "DbError : Application status not updated");
  }
  const applicationId = {
    applicationId : updateApplication._id,
    date : updateApplication.createdAt
  }
  let updateCandidate;
  try {
    if(!(findCandidateDetails.application.find(field => field.applicationId?.toString() === updateApplication._id.toString()))){
      throw new ApiError(400, "DataError : Application not found")
    }
    let newApplicationArray = findCandidateDetails.application.filter(field => field.applicationId?.toString() !== updateApplication._id?.toString())
    findCandidateDetails.application = newApplicationArray
    await findCandidateDetails.save({validateBeforeSave:false})
    
    updateCandidate = await Candidate.findByIdAndUpdate(findCandidateDetails._id, {
      $push : {rejectedApplication : applicationId}
    }, {new:true}).select("-password");
  } catch (error) {
    throw new ApiError(500, `DbError : ${error.message || "Unable to update candidate"}`);
  }
  if (!updateCandidate) {
    throw new ApiError(500, "DbError : Candidate not updated");
  }
  // send Email
  sendEmail(updateCandidate.emailId, "Job Application updates", `Unfortunretuly, ${updateCandidate.fullName} \nJob "title : ${jobTitle}" \n application rejected, we are regret for this.`)
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        updateApplication,
        "successMessage : Application mark to rejected"
      )
    );
});
