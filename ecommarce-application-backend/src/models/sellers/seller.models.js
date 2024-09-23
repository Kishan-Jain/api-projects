import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// subSchema
const productID = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "this is required field"],
    },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

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
const repleshOrderId = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Replace",
      required: [true, "this is required field"],
    },
  },
  { timestamps: true }
);

const returnOrderId = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Return",
      required: [true, "this is required field"],
    },
  },
  { timestamps: true }
);

const paymentId = new mongoose.Schema({
  paymentId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "PaymentDetail",
    required : true
  },
  orderId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Order",
    required : true
  },
  sellerId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Seller",
    required : true
  }
},{timestamps:true})

const address = new mongoose.Schema({
    name : {
      type : String,
      required : true,
    },
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
    country : {
      type : String,
      default : "India"
    },
    pincode: { type: Number, required: true },
  });
  
// mainSchema

const sellerSchema = new mongoose.Schema(
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
    avtar: { type: String, default:process.env.DEFAULT_USER_AVATAR },
    productlist: [productID],
    orderlist: [orderId],
    repleshOrderList : [repleshOrderId],
    returnOrderList : [returnOrderId],
    paymentList : [paymentId],
    address : [address],
    refreshTokan: {
      type: String,
      default : null
    },
  },
  { timestamps: true }
);

sellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// custom method
sellerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// methods for generate Access and Refresh Token
sellerSchema.methods.genrateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      userType : "Seller"
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

sellerSchema.methods.genrateRefreshToken = function () {
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

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller