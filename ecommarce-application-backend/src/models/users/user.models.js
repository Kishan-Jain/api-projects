import mongoose from "mongoose";

// import usefull services
import jwt from "jsonwebtoken"; // jwt bearer token
import bcrypt from "bcrypt";

// subSchemas
const order = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "this is required field"],
    },
},{ timestamps: true });

const repleshOrderId = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Replace",
      required: [true, "this is required field"],
    },
},{ timestamps: true });

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

const wiseItem = new mongoose.Schema(
  {
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  { timestamps: true }
);

const cartItem = new mongoose.Schema(
  {
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productPrice: {
      type: Number,
      required : true
    },
  },
  { timestamps: true }
);

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
const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: [true, "this is required field"],
      unique: [true, "username already Exits!!!"],
    },
    email: { type: String, required: [true, "this is required field"] },
    fullName: { type: String, required: [true, "this is required field"] },
    password: { type: String, required: [true, "this is required field"] },
    lastLogin: { type: Date, default: null },
    orderlist: [order],
    repleshOrderList : [repleshOrderId],
    returnOrderList : [returnOrderId],
    wiselist: [wiseItem],
    cartbox: [cartItem],
    payments : [paymentId],
    address: [address],
    avatar: { type: String, default : process.env.DEFAULT_USER_AVATAR },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
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
      userType : "User"
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
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

const User = mongoose.model("User", userSchema);
export default User