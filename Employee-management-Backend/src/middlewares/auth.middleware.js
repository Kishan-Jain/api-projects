import jwt from "jsonwebtoken";
import { UserDetail } from "../models/userModels.js";
import ApiError from "../utils/apiError.js";


// When check user login or not, for logout or avoid login/register page;
export const CookieCheck = async (req, res, next) => {
  // Check if cookie or authorization header is present
  if (req.cookies?.accessToken || req.headers?.authorization) {
    const accessToken = 
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "").trim();

    if (!accessToken) {
      throw new ApiError(400, "User Not logged in, please login first")
    }

    try {
      // Verify JWT token
      const decodeData = await jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET_KEY
      );
      if (!decodeData) {
        throw new ApiError(400, "Access token Decodation failed" )
      }

      // Find user by ID and exclude password and refreshToken fields
      const user = await UserDetail.findById(decodeData._id).select(
        "-password -refreshToken"
      );
      if (!user) {
        throw new ApiError(500, "User Not find; Invalid DecodeData")
      }

      // Attach user to request object
      req.user = user;
      return next();
    } catch (error) {
      console.error("Authentication error:", error);
      throw new ApiError(500, "Unable to check User logging, pleace clear cookies and login again")
    }
  }
  next();
};

// when check user login or not, for direct jump profile page / updates
export const LoginCheck = async (req, res, next) => {
  // Check if cookie or authorization header is present
  if (!req.cookies) {
    console.log("cookie not present");
    return res.redirect("/");
  }

  // Get token from cookie or authorization header
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.redirect("/");
  }

  try {
    // Verify JWT token
    const decodeData = await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_KEY
    );
    if (!decodeData) {
      return res.redirect("/");
    }

    // Find user by ID and exclude password and refreshToken fields
    const user = await UserDetail.findById(decodeData._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.redirect("/");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.redirect("/");
  }
};

// when check user login on not, for check user authorize for login or not
export const CheckLogger = async (req, res, next) => {
  // Check if the user is authenticated
  if (!req.user) {
    return res.redirect("/");
    // redirect if not authenticated
  }

  // Retrieve user details from the database
  const userDetails = await UserDetail.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!userDetails) {
    return res.redirect("/");
    // redirect if user details not found
  }

  // Check user permissions (HR department, Owner, or Admin)
  if (
    !(
      userDetails.department === "HR" ||
      userDetails.position === "Owner" ||
      userDetails.position === "Admin"
    )
  ) {
    return res.render("main/home.ejs", {
      title: "Home",
      message: "User not allowed to log in",
    });
    // redirect if permissions are not met
  }

  // Update req.user with retrieved user details
  req.user = userDetails;
  next(); // Proceed to the next middleware
};
