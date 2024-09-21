import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const CandidatesSchema = new Schema(
  {
    emailId: {
      type: String,
      required: [true, "EmailId is required"],
      unique: [true, "EmailId already exits"],
    },
    fullName: {
      type: String,
      required: [true, "FullName is required"],
    },
    password: {
      type: String,
      required: [true, "EmailId is required"],
    },
    field: {
      type: String,
      required: true,
    },
    keySkills: [
      {
        type: String,
      },
    ],
    lastLogin: {
      type: Date,
    },
    lastLogout: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
    },
    areaOfIntrest: [
      {
        type: String,
      },
    ],
    resumeArray: [
      {
        type: String,
      },
    ],
    application: [
      {
        applicationId: {
          type: Schema.Types.ObjectId,
          ref: "Application",
        },
        date: Date,
      },
    ],
    sortedApplication: [
      {
        applicationId: {
          type: Schema.Types.ObjectId,
          ref: "Application",
        },
        date: Date,
      },
    ],
    rejectedApplication: [
      {
        applicationId: {
          type: Schema.Types.ObjectId,
          ref: "Application",
        },
        date: Date,
      },
    ],
    connectionRequestSendList: [
      {
        userId: {
          type: String,
          required: true,
          unique: true,
        },
        userType: String,
        Date: {
          type: Date,
        },
      },
    ],
    connectionRequestReceivedList: [
      {
        userId: {
          type: String,
          required: true,
          unique: true,
        },
        userType: String,
        Date: {
          type: Date,
        },
      },
    ],
    connectionList: [
      {
        userId: {
          type: String,
          required: true,
          unique: true,
        },
        userType: String,
        Date: {
          type: Date,
        },
      },
    ],
    followersRequestList: [
      {
        userId: {
          type: String,
          required: true,
          unique: true,
        },
        userType: String,
        Date: {
          type: Date,
        },
      },
    ],
    followingRequestList: [
      {
        userId: {
          type: String,
          required: true,
          unique: true,
        },
        userType: String,
        Date: {
          type: Date,
        },
      },
    ],
    followersList: [
      {
        userId: {
          type: String,
          required: true,
          unique: true,
        },
        userType: String,
        Date: {
          type: Date,
        },
      },
    ],
    followingList: [
      {
        userId: {
          type: String,
          required: true,
          unique: true,
        },
        userType: String,
        Date: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true }
);

// save password with hash
CandidatesSchema.pre("save", async function (next) {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 10);
  next();
});

// custom methods for utilities of schemas
// check password is correct
CandidatesSchema.methods.checkPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate AccessRefreshTokens
CandidatesSchema.methods.GenerateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      userType: "Candidate",
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
CandidatesSchema.methods.GenerateRefreshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      userType: "Candidate",
    },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// models
const Candidate = model("Candidate", CandidatesSchema);
export default Candidate;
