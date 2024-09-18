import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";

// Define the schema for user details
const userDetailSchema = new Schema(
  {
    // Username of the user, must be unique
    userName: {
      type: String,
      required: [true, "This field is required"],
      unique: [true, "Username already exists"],
    },
    // Full name of the user
    fullName: {
      type: String,
      required: [true, "This field is required"],
    },
    // Email of the user, must be unique
    email: {
      type: String,
      required: [true, "This field is required"],
      unique: [true, "Email already exists"],
    },
    // Password for the user account
    password: {
      type: String,
      required: [true, "This field is required"],
    },
    // URL to the user's avatar image
    avatar: {
      type: String,
      default: process.env.DEFAULT_USER_PIC_CLOUDINARY_URL,
    },
    // save Event id in array with event reference and Date
    eventsArray: [
      {
        EventId: {
          type: Schema.Types.ObjectId,
          ref: "Event",
        },
        Date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    // Last login date of the user
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt fields

// Middleware to hash password before saving user document
userDetailSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Custom method to check if the provided password is correct
userDetailSchema.methods.IsPasswordCorrect = async function (password) {
  if (!password) {
    return new ApiError(400, "Password not received");
  }
  return await bcrypt.compare(password, this.password);
};

// Method to generate an access token for the user
userDetailSchema.methods.GenerateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Export the UserDetail model
const UserDetail = mongoose.model("UserDetail", userDetailSchema);
export default UserDetail;
