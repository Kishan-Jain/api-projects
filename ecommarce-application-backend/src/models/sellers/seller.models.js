import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// subSchema
const productlist =new  mongoose.Schema({
    product : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Product",
        required : [true, "this is required field" ] 
    },
    stock : {type:Number, default : 0}
}, {timestamps:true})

const orderId = new mongoose.Schema({
    order : {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required : [true, "this is required field" ]
    }
}, {timestamps:true})




// mainSchema


const sellerSchema = new mongoose.Schema({
    username : {type:String, required : [true, "this is required field" ], unique:[true, "username already Exits!!!"]},
    email : {type:String, required : [true, "this is required field" ]},
    fullName : {type:String, required : [true, "this is required field" ]},
    password : {type:String, required : [true, "this is required field" ]},
    lastLogin : {type:Date, default:null},
    avtar:{type:String, required:false},
    productlist : [productlist],
    orderlist : [orderId] ,
    
    accessTokan : {
        type:String
    },
    
}, { timestamps : true})

sellerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  // custom method
sellerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  
sellerSchema.methods.genrateAccessToken = function(){
return jwt.sign(
    {
        _id: this._id,
        username : this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

sellerSchema.methods.genrateRefreshToken = function(){
return jwt.sign(
    {
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}



export const Seller = mongoose.model("Seller", sellerSchema)