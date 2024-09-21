/**
 * check connections
 * view all connections
 * send connection request
 * view connection request
 * responce on conection request
 * brack connection
 */

import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import Employee from "../models/empoleeyes.models.js";
import Candidate from "../models/candidates.models.js";

export const getAllConnections = AsyncHandler(async (req, res) => {
  /**
   * check user is logged in
   * validate user
   * reteive all data
   * return data and responce
   */

  // check user is login
  if (!req.userId) {
    throw new ApiError(400, "LoginError : User not logged in");
  }
  if (!req.userType) {
    throw new ApiError(400, "LoginError : User login Error");
  }
  if (req.userId !== req.params?.userId) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (req.userType !== req.params?.userType) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  let AllConnectionData;
  // check user type
  if (req.userType === "Employee") {
    // search Employee Datils
    let searchEmployee;
    try {
      searchEmployee = await Employee.findById(req.userId).select(
        "_id connectionList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Employee"} `
      );
    }
    if (!searchEmployee) {
      throw new ApiError(404, "DataError : Employee not found");
    }
    AllConnectionData = searchEmployee.connectionList;
    if (!AllConnectionData) {
      throw new ApiError(400, "DbError : Connection array not found");
    }
  } else if (req.userType === "Candidate") {
    // search Candidate Datils
    let searchCandidate;
    try {
      searchCandidate = await Candidate.findById(req.userId).select(
        "_id connectionList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Candidate"}`
      );
    }
    if (!searchCandidate) {
      throw new ApiError(404, "DataError : Candidate not found");
    }
    AllConnectionData = searchCandidate.connectionList;
    if (!AllConnectionData) {
      throw new ApiError(404, "DbError : Connection Array not found");
    }
  }
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        AllConnectionData,
        "successMessage : received All send connection request"
      )
    );
});

export const getAllReceivedConnectionRequest = AsyncHandler(
  async (req, res) => {
    /**
     * check user is logged in
     * validate user
     * reteive all data
     * return data and responce
     */

    // check user is login
    if (!req.userId) {
      throw new ApiError(400, "LoginError : User not logged in");
    }
    if (req.userId !== req.params?.userId) {
      throw new ApiError(401, "AuthError : User not authorize");
    }
    if (!req.userType) {
      throw new ApiError(400, "LoginError : User login Error");
    }
    if (req.userType !== req.params?.userType) {
      throw new ApiError(401, "AuthError : User not authorize");
    }
    let connectionRequestReceivedList;
    // check user type
    if (req.userType === "Employee") {
      // search Employee Datils
      let searchEmployee;
      try {
        searchEmployee = await Employee.findById(req.userId).select(
          "_id connectionRequestReceivedList"
        );
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${error.message || "Unable to find Employee"} `
        );
      }
      if (!searchEmployee) {
        throw new ApiError(404, "DataError : Employee not found");
      }
      connectionRequestReceivedList =
        searchEmployee.connectionRequestReceivedList;
      if (!connectionRequestReceivedList) {
      throw new ApiError(404, "DbError : Connection request list not found");
      }
    } else if (req.userType === "Candidate") {
      // search Candidate Datils
      let searchCandidate;
      try {
        searchCandidate = await Candidate.findById(req.userId).select(
          "_id connectionRequestReceivedList"
        );
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${error.message || "Unable to find Candidate"}`
        );
      }
      if (!searchCandidate) {
        throw new ApiError(404, "DataError : Candidate not found");
      }
      connectionRequestReceivedList =
        searchCandidate.connectionRequestReceivedList;
      if (!connectionRequestReceivedList) {
      throw new ApiError(404, "DbError : Connection request list not found");
      }
    }
    return res
      .status(200)
      .json(
        new ApiResponce(
          200,
          connectionRequestReceivedList,
          "successMessage : received All Received Connection request"
        )
      );
  }
);

export const getAllSendConnectionRequest = AsyncHandler(async (req, res) => {
  /**
   * check user is logged in
   * validate user
   * reteive all data
   * return data and responce
   */

  // check user is login
  if (!req.userId) {
    throw new ApiError(400, "LoginError : User not logged in");
  }
  if (!req.userType) {
    throw new ApiError(400, "LoginError : User login Error");
  }
  if (req.userId !== req.params?.userId) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (req.userType !== req.params?.userType) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  let connectionRequestSendList;
  // check user type
  if (req.userType === "Employee") {
    // search Employee Datils
    let searchEmployee;
    try {
      searchEmployee = await Employee.findById(req.userId).select(
        "_id connectionRequestSendList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Employee"} `
      );
    }
    if (!searchEmployee) {
      throw new ApiError(404, "DataError : Employee not found");
    }
    connectionRequestSendList = searchEmployee.connectionRequestSendList;
    if (!connectionRequestSendList) {
      throw new ApiError(404, "DbError : Connection request list not found");
    }
  } else if (req.userType === "Candidate") {
    // search Candidate Datils
    let searchCandidate;
    try {
      searchCandidate = await Candidate.findById(req.userId).select(
        "_id connectionRequestSendList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Candidate"}`
      );
    }
    if (!searchCandidate) {
      throw new ApiError(404, "DataError : Candidate not found");
    }
    connectionRequestSendList = searchCandidate.connectionRequestSendList;
    if (!connectionRequestSendList) {
      throw new ApiError(404, "DbError : Connection request list not found");
    }
  }
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        connectionRequestSendList,
        "successMessage : received All send connection request"
      )
    );
});

export const checkConnection = AsyncHandler(async (req, res) => {
  /**
   * check user is logged in
   * validate user
   * check second user Id and type from query perameter
   * validate second user
   * match second user id and type in frist user connectionlist and connection request list
   * return responce
   */

  // check user is login
  if (!req.userId) {
    throw new ApiError(400, "LoginError : User not logged in");
  }
  if (!req.userType) {
    throw new ApiError(400, "LoginError : User login Error");
  }
  if (req.userId !== req.params?.userId) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (req.userType !== req.params?.userType) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (!(req.params?.secondUserId && req.params?.secondUserType)) {
    throw new ApiError(404, "DataError : require params is not received");
  }
  // check user type
  if (req.userType === "Employee") {
    // search Employee Datils
    let searchEmployee;
    try {
      searchEmployee = await Employee.findById(req.userId).select(
        "_id connectionRequestSendList connectionRequestReceivedList connectionList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Employee"} `
      );
    }
    if (!searchEmployee) {
      throw new ApiError(404, "DataError : Employee not found");
    }
    const connectionList = searchEmployee.connectionList;
    if (!connectionList) {
      throw new ApiError(404, "DbError : Connection list not found");
    }
    if (
      connectionList.find(
        (userObject) =>
          userObject.userId.toString() === req.params?.secondUserId
      )
    ) {
      return res
        .status(200)
        .json(new ApiResponce(200, {}, "successMessage : connected"));
    } else {
      return res
        .status(200)
        .json(new ApiResponce(200, {}, "successMessage : Not Connected"));
    }
  } else if (req.userType === "Candidate") {
    // search Candidate Datils
    let searchCandidate;
    try {
      searchCandidate = await Candidate.findById(req.userId).select(
        "_id connectionList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Candidate"}`
      );
    }
    if (!searchCandidate) {
      throw new ApiError(404, "DataError : Candidate not found");
    }
    const connectionList = searchCandidate.connectionList;
    if (!connectionList) {
    }
    if (
      connectionList.find(
        (userObject) =>
          userObject.userId.toString() === req.params?.secondUserId
      )
    ) {
      return res
        .status(200)
        .json(new ApiResponce(200, {}, "successMessage : connected"));
    } else {
      return res
        .status(200)
        .json(new ApiResponce(200, {}, "successMessage : Not Connected"));
    }
  }
});

export const sendConnectionRequest = AsyncHandler(async (req, res) => {
  /**
   * check user is logged in
   * validate user
   * check second user id and type from query perameter
   * validate second user
   * push user id on connection request send list and push first user id in second user connection request received list
   * return responce
   */

  // check user is login
  if (!req.userId) {
    throw new ApiError(400, "LoginError : User not logged in");
  }
  if (!req.userType) {
    throw new ApiError(400, "LoginError : User login Error");
  }
  if (req.userId !== req.params?.userId) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (req.userType !== req.params?.userType) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (!(req.params?.secondUserId && req.params?.secondUserType)) {
    throw new ApiError(404, "DataError : require params is not received");
  }
  // user details object
  const userDetails = {
    userId: req.userId?.toString(),
    userType: req.userType.toString(),
    Date : new Date
  };
  const secondUserDetails = {
    userId: req.params?.secondUserId?.toString(),
    userType: req.params?.secondUserType,
    Date : new Date
  };
  
  // check user type
  if (req.userType === "Employee") {
    // search Employee Datils
    let searchEmployee;
    try {
      searchEmployee = await Employee.findById(req.userId).select(
        "followingList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Employee"} `
      );
    }
    if (!searchEmployee) {
      throw new ApiError(404, "DataError : Employee not found");
    }
    if (
      searchEmployee.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    ) {
    }
    if (
      searchEmployee.connectionRequestReceivedList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    ) {
    }
    if (
      searchEmployee.connectionRequestSendList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    ) {
    }
    let searchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        searchSecondUser = await Employee.findById(req.params?.secondUserId);
      } catch (error) {}
    } else if (req.params?.secondUserType === "Candidate") {
      try {
        searchSecondUser = await Candidate.findById(req.params?.secondUserId);
      } catch (error) {}
    }
    if (!searchSecondUser) {
    }
    if (
      searchSecondUser.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchEmployee._id?.toString()
      )
    ) {
    }
    if (
      searchSecondUser.connectionRequestReceivedList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchEmployee._id?.toString()
      )
    ) {
    }
    if (
      searchSecondUser.connectionRequestSendList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchEmployee._id?.toString()
      )
    ) {
    }
    let updateSearchEmployee;
    try {
      updateSearchEmployee = await Employee.findByIdAndUpdate(
        searchEmployee._id,
        {
          $push: {
            connectionRequestSendList: secondUserDetails,
          },
        }
      );
    } catch (error) {}
    if (!updateSearchEmployee) {
    }
    let updateSearchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        updateSearchSecondUser = await Employee.findByIdAndUpdate(
          searchSecondUser._id,
          {
            $push: {
              connectionRequestSendList: userDetails,
            },
          }
        );
      } catch (error) {}
    } else if (req.params?.searchSecondUser === "Candidate") {
      try {
        updateSearchSecondUser = await Candidate.findByIdAndUpdate(
          searchSecondUser._id,
          {
            $push: {
              connectionRequestSendList: userDetails,
            },
          }
        );
      } catch (error) {}
    }
    if (!updateSearchSecondUser) {
    }
  } else if (req.userType === "Candidate") {
    // search Candidate Datils
    let searchCandidate;
    try {
      searchCandidate = await Candidate.findById(req.userId).select(
        "followingList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Candidate"}`
      );
    }
    if (!searchCandidate) {
      throw new ApiError(404, "DataError : Candidate not found");
    }
    if (
      searchCandidate.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    ) {
    }
    if (
      searchCandidate.connectionRequestReceivedList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    ) {
    }
    if (
      searchCandidate.connectionRequestSendList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    ) {
    }
    let searchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        searchSecondUser = await Employee.findById(req.params?.secondUserId);
      } catch (error) {}
    } else if (req.params?.secondUserType === "Candidate") {
      try {
        searchSecondUser = await Candidate.findById(req.params?.secondUserId);
      } catch (error) {}
    }
    if (!searchSecondUser) {
    }
    if (
      searchSecondUser.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchCandidate._id?.toString()
      )
    ) {
    }
    if (
      searchSecondUser.connectionRequestReceivedList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchCandidate._id?.toString()
      )
    ) {
    }
    if (
      searchSecondUser.connectionRequestSendList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchCandidate._id?.toString()
      )
    ) {
    }
    let updateSearchCandidate;
    try {
      updateSearchCandidate = await Candidate.findByIdAndUpdate(
        searchCandidate._id,
        {
          $push: {
            connectionRequestSendList: secondUserDetails,
          },
        }
      );
    } catch (error) {}
    if (!updateSearchCandidate) {
    }
    let updateSearchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        updateSearchSecondUser = await Employee.findByIdAndUpdate(
          searchSecondUser._id,
          {
            $push: {
              connectionRequestSendList: userDetails,
            },
          }
        );
      } catch (error) {}
    } else if (req.params?.searchSecondUser === "Candidate") {
      try {
        updateSearchSecondUser = await Candidate.findByIdAndUpdate(
          searchSecondUser._id,
          {
            $push: {
              connectionRequestSendList: userDetails,
            },
          }
        );
      } catch (error) {}
    }
    if (!updateSearchSecondUser) {
    }
  }
  return res
    .status(200)
    .json(
      new ApiResponce(200, {}, "successMessage : Connection send successfully")
    );
});

export const responceOnConnectionRequest = AsyncHandler(async (req, res) => {
  /**
   * check user is logged in
   * validate user
   * check connection request availabel on user connection requesr list
   * responce on connection request
   * if request accept, add user id in both user connection list
   * if request reject, remove user id from both user connection request listed
   * return responce
   */

  // check user is login
  if (!req.userId) {
    throw new ApiError(400, "LoginError : User not logged in");
  }
  if (!req.userType) {
    throw new ApiError(400, "LoginError : User login Error");
  }
  if (req.userId !== req.params?.userId) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (req.userType !== req.params?.userType) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (!(req.params?.secondUserId && req.params?.secondUserType)) {
    throw new ApiError(404, "DataError : require params is not received");
  }
  if (!req.params?.responce){
    throw new ApiError(404, "DataError : responce params is not received");
  }
  // user details object
  const userDetails = {
    userId: req.userId?.toString(),
    userType: req.userType.toString(),
    Date : new Date
  };
  const secondUserDetails = {
    userId: req.params?.secondUserId?.toString(),
    userType: req.params?.secondUserType,
    Date : new Date
  };  
  // check user type
  if (req.userType === "Employee") {
    // search Employee Datils
    let searchEmployee;
    try {
      searchEmployee = await Employee.findById(req.userId).select(
        "_id connectionRequestSendList connectionRequestReceivedList connectionList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "unable to find Employee"}`
      );
    }
    if (!searchEmployee) {
      throw new ApiError(404, "DbError : Employee not found");
    }
    if (
      !(searchEmployee.connectionRequestReceivedList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params.secondUserId
      ))
    ) {
      throw new ApiError(
        404,
        "DbError : secondUser id not exits in connection request list"
      );
    }
    if (
      searchEmployee.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params.secondUserId
      )
    ) {
      throw new ApiError(
        404,
        "DbError : secondUser id already exits connection list"
      );
    }
    let searchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        searchSecondUser = await Employee.findById(
          req.params.secondUserId
        ).select(
          "_id connectionRequestSendList connectionList"
        );
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${error.message || "Unable to find second user"}`
        );
      }
    } else if (req.params?.secondUserType === "Candidate") {
      try {
        searchSecondUser = await Candidate.findById(
          req.params.secondUserId
        ).select(
          "_id connectionRequestSendList connectionList"
        );
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${error.message || "Unable to find second user"}`
        );
      }
    }
    if (!searchSecondUser) {
      throw new ApiError(404, "DataError : Second user Id not correct");
    }
    if (
      searchSecondUser.connectionList?.find(
        (userObject) => userObject.userId?.toString() === req.userId
      )
    ) {
      throw new ApiError(
        404,
        "DbError : User id already exits second user Connection List"
      );
    }
    if (
      !(searchSecondUser.connectionRequestSendList?.find(
        (userObject) => userObject.userId?.toString() === req.userId
      ))
    ) {
      throw new ApiError(
        404,
        "DbError : user id not exits in second user connection request list"
      );
    }
    if (req.params?.responce === "Accept") {
      
      let updateSearchEmployee;
      try {
        updateSearchEmployee = await Employee.findByIdAndUpdate(
          searchEmployee._id?.toString(),
          {
            $push: {
              connectionList: secondUserDetails,
            },
          },
          { new: true }
        ).select(
          "_id connectionRequestSendList connectionRequestReceivedList connectionList"
        );
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${error.message || "Unable to update Employee"}`
        );
      }
      if (!updateSearchEmployee) {
        throw new ApiError(500, "DbError : Employee not updated");
      }
      let updateSearchSecondUser;
      if (req.params?.secondUserType === "Employee") {
        try {
          updateSearchSecondUser = await Employee.findByIdAndUpdate(
            searchSecondUser._id?.toString(),
            {
              $push: {
                connectionList: userDetails,
              },
            },
            { new: true }
          ).select(
            "_id connectionRequestSendList connectionRequestReceivedList connectionList"
          );
        } catch (error) {
          throw new ApiError(
            500,
            `DbError : ${error.message || "Unable to update second user"}`
          );
        }
      } else if (req.params?.secondUserType === "Candidate") {
        try {
          updateSearchSecondUser = await Candidate.findByIdAndUpdate(
            searchSecondUser._id?.toString(),
            {
              $push: {
                connectionList: userDetails,
              },
            },
            { new: true }
          ).select(
            "_id connectionRequestSendList connectionRequestReceivedList connectionList"
          );
        } catch (error) {
          throw new ApiError(
            500,
            `DbError : ${error.message || "Unable to update second user"}`
          );
        }
      }
      if (!updateSearchSecondUser) {
        throw new ApiError(500, "DbError : second user not updated");
      }
      try {
        const newConnectionRequestReceivedList =
          updateSearchEmployee.connectionRequestReceivedList.filter(
            (userObject) =>
              userObject.userId?.toString() !== updateSearchSecondUser._id?.toString()
          );
        updateSearchEmployee.connectionRequestReceivedList = newConnectionRequestReceivedList;
        await updateSearchEmployee.save({ validateBeforeSave: false });
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${
            error.message || "Unable to update Employee connection request list"
          }`
        );
      }
      if (!updateSearchEmployee) {
        throw new ApiError(500, "DbError : Employee not updated");
      }
      try {
        const newConnectionRequestSendList =
          updateSearchSecondUser.connectionRequestReceivedList.filter(
            (userObject) =>
              userObject.userId?.toString() !== updateSearchEmployee._id?.toString()
          );
        updateSearchSecondUser.connectionRequestSendList = newConnectionRequestSendList;
        await updateSearchSecondUser.save({ validateBeforeSave: false });
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${
            error.message || "Unable to update second user connection request list"
          }`
        );
      }
      if (!updateSearchSecondUser) {
        throw new ApiError(500, "DbError : second user not updated");
      }

      return res
        .status(200)
        .json(
          new ApiResponce(200, {}, "successMessage : connection request accepted")
        );
    } else if (req.params?.responce === "Reject") {
      try {
        const newConnectionRequestReceivedList = searchEmployee.connectionRequestReceivedList.filter(
          (userObject) =>
            userObject.userId?.toString() !== searchSecondUser._id.toString()
        );
        searchEmployee.connectionRequestReceivedList = newConnectionRequestReceivedList;
        await searchEmployee.save({ validateBeforeSave: false });
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${
            error.message || "Unable to update Employee connection request list"
          }`
        );
      }
      if (!searchEmployee) {
        throw new ApiError(500, "DbError : Employee not updated");
      }
      try {
        const newConnectionRequestSendList =
          searchSecondUser.connectionRequestSendList.filter(
            (userObject) =>
              userObject.userId?.toString() !== searchEmployee._id.toString()
          );
        searchSecondUser.connectionRequestSendList = newConnectionRequestSendList;
        await searchSecondUser.save({ validateBeforeSave: false });
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${
            error.message || "Unable to update second user connection request list"
          }`
        );
      }
      if (!searchSecondUser) {
        throw new ApiError(500, "DbError : second user not updated");
      }
      return res
        .status(200)
        .json(
          new ApiResponce(200, {}, "successMessage : Follow request rejected")
        );
    }
  } else if (req.userType === "Candidate") {
    // search Candidate Datils
    let searchCandidate;
    try {
      searchCandidate = await Candidate.findById(req.userId).select(
        "_id connectionRequestReceivedList connectionList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find candidate"}`
      );
    }
    if (!searchCandidate) {
      throw new ApiError(404, "DbError : Candidate not found");
    }
    if (
      !(searchCandidate.connectionRequestReceivedList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params.secondUserId
      ))
    ) {
      throw new ApiError(
        404,
        "DbError : secondUser id not exits in connection request list"
      );
    }
    if (
      searchCandidate.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchSecondUser._id?.toString()
      )
    ) {
      throw new ApiError(
        404,
        "DbError : secondUser id already exits connection list"
      );
    }

    let searchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        searchSecondUser = await Employee.findById(
          req.params.secondUserId
        ).select(
          "_id connectionRequestSendList connectionList"
        );
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${error.message || "Unable to find second user"}`
        );
      }
    } else if (req.params?.secondUserType === "Candidate") {
      try {
        searchSecondUser = await Candidate.findById(
          req.params.secondUserId
        ).select(
          "_id connectionRequestSendList connectionList"
        );
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${error.message || "Unable to find second user"}`
        );
      }
    }
    if (!searchSecondUser) {
      throw new ApiError(404, "DataError : Second user Id not correct");
    }
    if (
      searchSecondUser.followingList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchCandidate._id?.toString()
      )
    ) {
      throw new ApiError(
        404,
        "DbError : User id already exits second user connection list"
      );
    }
    if (
      !searchSecondUser.followingRequestList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchCandidate._id.toString()
      )
    ) {
      throw new ApiError(
        404,
        "DbError : user id not exits in second user connection request list"
      );
    }
    if (req.params.responce === "Accept") {
      
      let updateSearchCandidate;
      try {
        updateSearchCandidate = await Candidate.findByIdAndUpdate(
          searchCandidate._id,
          {
            $push: {
              connectionList: secondUserDetails,
            },
          },
          { new: true }
        ).select(
          "_id connectionRequestSendList connectionRequestReceivedList connectionList"
        );
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${error.message || "Unable to update Candidate"}`
        );
      }
      if (!updateSearchCandidate) {
        throw new ApiError(500, "DbError : Candidate not updated");
      }
      let updateSearchSecondUser;
      if (req.params?.secondUserType === "Employee") {
        try {
          updateSearchSecondUser = await Employee.findByIdAndUpdate(
            searchSecondUser._id?.toString(),
            {
              $push: {
                connectionList: userDetails,
              },
            },
            { new: true }
          ).select(
            "_id connectionRequestSendList connectionRequestReceivedList connectionList"
          );
        } catch (error) {
          throw new ApiError(
            500,
            `DbError : ${error.message || "Unable to update second user"}`
          );
        }
      } else if (req.params?.secondUserType === "Candidate") {
        try {
          updateSearchSecondUser = await Candidate.findByIdAndUpdate(
            searchSecondUser._id?.toString(),
            {
              $push: {
                connectionList: userDetails,
              },
            },
            { new: true }
          ).select(
            "_id connectionRequestSendList connectionRequestReceivedList connectionList"
          );
        } catch (error) {
          throw new ApiError(
            500,
            `DbError : ${error.message || "Unable to update second user"}`
          );
        }
      }
      if (!updateSearchSecondUser) {
        throw new ApiError(500, "DbError Unable to update second user");
      }
      try {
        const newConnectionRequestReceivedList =
          updateSearchCandidate.connectionRequestReceivedList.filter(
            (userObject) =>
              userObject.userId?.toString() !==
              updateSearchSecondUser._id?.toString()
          );
        updateSearchCandidate.connectionRequestReceivedList = newConnectionRequestReceivedList;
        await updateSearchCandidate.save({ validateBeforeSave: false });
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${
            error.message || "Unable to update Candidate connection list"
          }`
        );
      }
      if (!updateSearchCandidate) {
        throw new ApiError(500, "DbError : Employee not updated");
      }
      try {
        const newConnectionRequestSendList =
          updateSearchSecondUser.newConnectionRequestSendList.filter(
            (userObject) =>
              userObject.userId?.toString() !==
              updateSearchCandidate._id?.toString()
          );
        updateSearchSecondUser.connectionRequestSendList = newConnectionRequestSendList;
        await updateSearchSecondUser.save({ validateBeforeSave: false });
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${
            error.message || "Unable to update second user connection request list"
          }`
        );
      }
      if (!updateSearchSecondUser) {
        throw new ApiError(500, "DbError : second user not updated");
      }

      return res

        .status(200)
        .json(
          new ApiResponce(200, {}, "successMessage : Follow request accepted")
        );
    } else if (req.params.responce === "Reject") {
      try {
        const newConnectionRequestReceivedList =
          searchCandidate.connectionRequestReceivedList.filter(
            (userObject) =>
              userObject.userId?.toString() !== searchSecondUser._id?.toString()
          );
        searchCandidate.connectionRequestReceivedList = newConnectionRequestReceivedList;
        await searchCandidate.save({ validateBeforeSave: false });
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${
            error.message || "Unable to update Candidate connection list"
          }`
        );
      }
      if (!searchCandidate) {
        throw new ApiError(500, "DbError : Candidate not updated");
      }
      try {
        const newConnectionRequestSendList =
          searchSecondUser.connectionRequestSendList.filter(
            (userObject) =>
              userObject.userId?.toString() !== searchCandidate._id?.toString()
          );
        searchSecondUser.connectionRequestSendList = newConnectionRequestSendList;
        await searchSecondUser.save({ validateBeforeSave: false });
      } catch (error) {
        throw new ApiError(
          500,
          `DbError : ${
            error.message || "Unable to update second user connection request list"
          }`
        );
      }
      if (!searchSecondUser) {
        throw new ApiError(500, "DbError : second user not updated");
      }
      return res
        .status(200)
        .json(
          new ApiResponce(200, {}, "successMessage : Follow request rejected")
        );
    }
  }
});

export const brackConnection = AsyncHandler(async (req, res) => {
  /**
   * check user is logged in
   * check users also connected
   * remove connection details in both user connection list
   * return responce
   */

  // check user is login
  if (!req.userId) {
    throw new ApiError(400, "LoginError : User not logged in");
  }
  if (!req.userType) {
    throw new ApiError(400, "LoginError : User login Error");
  }
  if (req.userId !== req.params?.userId) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (req.userType !== req.params?.userType) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (!(req.params?.secondUserId && req.params?.secondUserType)) {
    throw new ApiError(404, "DataError : require params is not received");
  }
  // check user type
  if (req.userType === "Employee") {
    // search Employee Datils
    let searchEmployee;
    try {
      searchEmployee = await Employee.findById(req.userId).select(
        "connectionList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Employee"} `
      );
    }
    if (!searchEmployee) {
      throw new ApiError(404, "DataError : Employee not found");
    }
    if (
      !(searchEmployee.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    )) {
      throw new ApiError(400, "DataError : second user id not exits in user connection array");
    }
    let searchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        searchSecondUser = await Employee.findById(req.params?.secondUserId).select("connectionList");
      } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find second user"}`);
      }
    } else if (req.params?.secondUserType === "Candidate") {
      try {
        searchSecondUser = await Candidate.findById(req.params?.secondUserId).select("connectionList");
      } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find second user"}`);
      }
    }
    if (!searchSecondUser) {
      throw new ApiError(404, "DataError : Second user id not correct");
    }
    if (
      !searchSecondUser.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchEmployee._id?.toString()
      )
    ) {
      throw new ApiError(400, "DataError : user id not exits in user connection array");
    }
    try {
      const newConnectionList = searchEmployee.connectionList.filter(
        (userObject) =>
          userObject.userId?.toString() !== searchSecondUser._id?.toString()
      );
      searchEmployee.connectionList = newConnectionList;
      await searchEmployee.save({ validateBeforeSave: false });
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to update user connection list"}`);
    }
    let updateSearchEmployee;
    try {
      updateSearchEmployee = await Employee.findById(searchEmployee._id).select("connectionList");
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find updated employee"}`);

    }
    if (!updateSearchEmployee) {
      throw new ApiError(404, "DataError : updated Employee not found");
    }
    try {
      const newConnectionList = searchSecondUser.connectionList.filter(
        (userObject) =>
          userObject.userId?.toString() !== searchEmployee._id?.toString()
      );
      searchSecondUser.connectionList = newConnectionList;
      await searchSecondUser.save({ validateBeforeSave: false });
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to second user update connection list"}`);
    }
    let updateSearchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        updateSearchSecondUser = await Employee.findById(searchSecondUser._id).select("connectionList");
      } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find updated second user"}`);
      }
    } else if (req.params?.searchSecondUser === "Candidate") {
      try {
        updateSearchSecondUser = await Candidate.findById(searchSecondUser._id);
      } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find updated second user"}`);
      }
    }
    if (!updateSearchSecondUser) {
      throw new ApiError(500, "DbError : updated second user not find");
    }
  }
  else if (req.userType === "Candidate") {
    // search Candidate Datils
    let searchCandidate;
    try {
      searchCandidate = await Candidate.findById(req.userId).select(
        "connectionList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Candidate"}`
      );
    }
    if (!searchCandidate) {
      throw new ApiError(404, "DataError : Candidate not found");
    }
    if (
      !(searchCandidate.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      ))
    ) {
      throw new ApiError(404, "DataError : second user id not exits in user connection list");
    }

    let searchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        searchSecondUser = await Employee.findById(req.params?.secondUserId);
      } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find second user"}`);
      }
    } else if (req.params?.secondUserType === "Candidate") {
      try {
        searchSecondUser = await Candidate.findById(req.params?.secondUserId);
      } catch (error) {
      throw new ApiError(500, `DbError ${error.message || "Unable to find second user"}`);
      }
    }
    if (!searchSecondUser) {
      throw new ApiError(404, "DataError : second user not found");
    }
    if (
      !(searchSecondUser.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchCandidate._id?.toString()
      ))
    ) {
      throw new ApiError(400, "DataError : second user id not exits in user connection list");
    }
    try {
      const newConnectionList = searchCandidate.connectionList.filter(
        (userObject) =>
          userObject.userId?.toString() !== searchSecondUser._id?.toString()
      );
      searchCandidate.connectionList = newConnectionList;
      await searchCandidate.save({ validateBeforeSave: false });
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to update user connection list"}`);
    }
    let updateSearchCandidate;
    try {
      updateSearchCandidate = await Candidate.findById(searchCandidate._id).select("connectionList");
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find update user"}`);
    }
    if (!updateSearchCandidate) {
      throw new ApiError(500, "DbError : Updated user not found");
    }
    try {
      const newConnectionList = searchSecondUser.connectionList.filter(
        (userObject) =>
          userObject.userId?.toString() !== searchCandidate._id?.toString()
      );
      searchSecondUser.connectionList = newConnectionList;
      await searchSecondUser.save({ validateBeforeSave: false });
    } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to update second user connection list"}`);
    }
    let updateSearchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        updateSearchSecondUser = await Employee.findById(searchSecondUser._id).select("connectionList");
      } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find updated second user"}`);
      }
    } else if (req.params?.searchSecondUser === "Candidate") {
      try {
        updateSearchSecondUser = await Candidate.findById(searchSecondUser._id);
      } catch (error) {
      throw new ApiError(500, `DbError : ${error.message || "Unable to find updated second user"}`);
      }
    }
    if (!updateSearchSecondUser) {
      throw new ApiError(500, "DbError : updated second user not found");
    }
  }
  return res
    .status(200)
    .json(
      new ApiResponce(200, {}, "successMessage : Connection brack successfully")
    );
});

export const cancelConnectionSendRequest = AsyncHandler(async (req, res) => {
  /**
   * check user is logged in
   * check connection request availabel on user connection request list
   * remove connection request details in both user connection request list
   * return responce
   */

  // check user is login
  if (!req.userId) {
    throw new ApiError(400, "LoginError : User not logged in");
  }
  if (!req.userType) {
    throw new ApiError(400, "LoginError : User login Error");
  }
  if (req.userId !== req.params?.userId) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (req.userType !== req.params?.userType) {
    throw new ApiError(401, "AuthError : User not authorize");
  }
  if (!(req.params?.secondUserId && req.params?.secondUserType)) {
    throw new ApiError(404, "DataError : require params is not received");
  }
  // check user type
  if (req.userType === "Employee") {
    // search Employee Datils
    let searchEmployee;
    try {
      searchEmployee = await Employee.findById(req.userId).select(
        "followingList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Employee"} `
      );
    }
    if (!searchEmployee) {
      throw new ApiError(404, "DataError : Employee not found");
    }
    if (
      !(searchEmployee.connectionRequestSendList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      ))
    ) {
    }
    if (
      searchEmployee.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    ) {
    }
    let searchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        searchSecondUser = await Employee.findById(req.params?.secondUserId);
      } catch (error) {}
    } else if (req.params?.secondUserType === "Candidate") {
      try {
        searchSecondUser = await Candidate.findById(req.params?.secondUserId);
      } catch (error) {}
    }
    if (!searchSecondUser) {
    }
    if (
      searchSecondUser.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchEmployee._id?.toString()
      )
    ) {
    }
    if (
      !(searchSecondUser.connectionRequestReceivedList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchEmployee._id?.toString()
      ))
    ) {
    }
    try {
      const newConnectionRequestSendList =
        searchEmployee.connectionRequestSendList.filter(
          (userObject) =>
            userObject.userId?.toString !== searchSecondUser._id?.toString
        );
      searchEmployee.connectionRequestSendList = newConnectionRequestSendList;
      await searchEmployee.save({ validateBeforeSave: false });
    } catch (error) {}
    let updateSearchEmployee;
    try {
      updateSearchEmployee = await Employee.findById(searchEmployee._id);
    } catch (error) {}
    if (!updateSearchEmployee) {
    }
    try {
      const newConnectionRequestReceivedList =
        searchSecondUser.connectionRequestReceivedList.filter(
          (userObject) =>
            userObject.userId?.toString !== searchEmployee._id?.toString
        );
      searchSecondUser.connectionRequestReceivedList =
        newConnectionRequestReceivedList;
      await searchSecondUser.save({ validateBeforeSave: false });
    } catch (error) {}
    let updateSearchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        updateSearchSecondUser = await Employee.findById(searchSecondUser._id);
      } catch (error) {}
    } else if (req.params?.searchSecondUser === "Candidate") {
      try {
        updateSearchSecondUser = await Candidate.findById(searchSecondUser._id);
      } catch (error) {}
    }
    if (!updateSearchSecondUser) {
    }
  } else if (req.userType === "Candidate") {
    // search Candidate Datils
    let searchCandidate;
    try {
      searchCandidate = await Candidate.findById(req.userId).select(
        "followingList"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `DbError : ${error.message || "Unable to find Candidate"}`
      );
    }
    if (!searchCandidate) {
      throw new ApiError(404, "DataError : Candidate not found");
    }
    if (
      !searchCandidate.connectionRequestSendList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    ) {
    }
    if (
      searchCandidate.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === req.params?.secondUserId
      )
    ) {
    }

    let searchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        searchSecondUser = await Employee.findById(req.params?.secondUserId);
      } catch (error) {}
    } else if (req.params?.secondUserType === "Candidate") {
      try {
        searchSecondUser = await Candidate.findById(req.params?.secondUserId);
      } catch (error) {}
    }
    if (!searchSecondUser) {
    }
    if (
      searchSecondUser.connectionRequestReceivedList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchCandidate._id?.toString()
      )
    ) {
    }
    if (
      searchSecondUser.connectionList?.find(
        (userObject) =>
          userObject.userId?.toString() === searchCandidate._id?.toString()
      )
    ) {
    }
    try {
      const newConnectionRequestSendList =
        searchCandidate.connectionRequestSendList.filter(
          (userObject) =>
            userObject.userId?.toString !== searchSecondUser._id?.toString
        );
      searchCandidate.connectionRequestSendList = newConnectionRequestSendList;
      await searchCandidate.save({ validateBeforeSave: false });
    } catch (error) {}
    let updateSearchCandidate;
    try {
      updateSearchCandidate = await Candidate.findById(searchCandidate._id);
    } catch (error) {}
    if (!updateSearchCandidate) {
    }
    try {
      const newConnectionRequestReceivedList =
        searchSecondUser.connectionRequestReceivedList.filter(
          (userObject) =>
            userObject.userId?.toString !== searchCandidate._id?.toString
        );
      searchSecondUser.connectionList = newConnectionRequestReceivedList;
      await searchSecondUser.save({ validateBeforeSave: false });
    } catch (error) {}
    let updateSearchSecondUser;
    if (req.params?.secondUserType === "Employee") {
      try {
        updateSearchSecondUser = await Employee.findById(searchSecondUser._id);
      } catch (error) {}
    } else if (req.params?.searchSecondUser === "Candidate") {
      try {
        updateSearchSecondUser = await Candidate.findById(searchSecondUser._id);
      } catch (error) {}
    }
    if (!updateSearchSecondUser) {
    }
  }
  return res
    .status(200)
    .json(
      new ApiResponce(200, {}, "successMessage : Connection send successfully")
    );
});
