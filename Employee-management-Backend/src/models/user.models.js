import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

// Define the schema for user details
const userDetailSchema = new Schema({
    // Username of the user, must be unique
    userName: {
        type: String,
        required: [true, "This field is required"],
        unique: [true, "Username already exists"]
    },
    // Full name of the user
    fullName: {
        type: String,
        required: [true, "This field is required"]
    },
    // Email of the user, must be unique
    email: {
        type: String,
        required: [true, "This field is required"],
        unique: [true, "Email already exists"]
    },
    // Employee ID, must be unique
    empId: {
        type: String,
        required: [true, "This field is required"],
        unique: [true, "Employee ID already exists"]
    },
    // Password for the user account
    password: {
        type: String,
        required: [true, "This field is required"]
    },
    // Position or job title of the user
    position: {
        type: String,
        required: [true, "This field is required"]
    },
    // Branch location of the user
    branch: {
        type: String,
        required: true
    },
    // URL to the user's avatar image
    avatar: {
        type: String,
        default: process.env.DEFAULT_USER_PIC_CLOUDINARY_URL,
    },
    // Date when the user joined, default is the current date
    joiningDate: {
        type: Date,
        default: Date.now()
    },
    // Status to check if the user is verified
    isVerify: {
        type: Boolean,
        default: false
    },
    // Reference to the user who verified this account
    verifyBy: {
        type: Schema.Types.ObjectId,
        ref: "UserDetail"
    },
    // Refresh token for the user
    refreshToken: {
        type: String,
        default: null    
    },
    // Last login date of the user
    lastLogin: {
        type: Date,
        default: null
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Middleware to hash password before saving user document
userDetailSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Custom method to check if the provided password is correct
userDetailSchema.methods.IsPasswordCorrect = function (password) {
    if (!password) {
        return new ApiError(400, "Password not received");
    }
    return bcrypt.compare(password, this.password);
};

// Method to generate a refresh token for the user
userDetailSchema.methods.GenerateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

// Method to generate an access token for the user
userDetailSchema.methods.GenerateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            fullname: this.fullname,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Export the UserDetail model
const UserDetail = mongoose.model('UserDetail', userDetailSchema);
export default UserDetail
