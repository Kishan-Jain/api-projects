import mongoose from "mongoose";

// import usefull services
import jwt from "jsonwebtoken"; // jwt bearer token
import bcrypt from "bcrypt";

// subSchemas
const orderId = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "this is required field"],
    },
  },
  { timestamps: true }
);

const wiselist = new mongoose.Schema(
  {
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  { timestamps: true }
);

const cartBox = new mongoose.Schema(
  {
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productPrice: {
      type: Number,
      ref: "Product", // here we reference product price for calculating total
    },
  },
  { timestamps: true }
);

const address = new mongoose.Schema({
  area: {
    type: String,
    maxlength: 100,
    required: [true, "this is required field"],
  },
  city: {
    type: String,
    maxlength: 100,
    required: [true, "this is required field"],
  },
  state: {
    type: String,
    maxlength: 100,
    required: [true, "this is required field"],
  },
  pincode: { type: Number, required: true },
});

// mainSchema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "this is required field"],
      unique: [true, "username already Exits!!!"],
    },
    email: { type: String, required: [true, "this is required field"] },
    fullName: { type: String, required: [true, "this is required field"] },
    password: { type: String, required: [true, "this is required field"] },
    lastLogin: { type: Date, default: null },
    orderlist: [orderId],
    wiselist: [wiselist],
    cartbox: [cartBox],
    address: [address],
    avatar: { type: String, required: false },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// custom method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.genrateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.genrateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
