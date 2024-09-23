import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    title : {type:String, required : [true, "this is required field" ]},
    discription : {type:String, required : [true, "this is required field" ]},
    categoryName : [{
        type : String,
        ref: "Category",
        required:[true, "this is required field" ]
    }],
    pics : [{pic :{type:String, required : [true, "this is required field" ]}}],
    price : {type:Number, required : [true, "this is required field" ]},
    discount : {type:Number, default: 0},
    stock : {type:Number, default: 1},
    sellerId :{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Seller",
        required:[true, "this is required field" ]
    },
    reviewList : [{
        title : String,
        description : {
            type:String,
            // required:true
        },
        pics : [{
            type:String
        }],
        rating : {
            type : Number,
            required : true
        },
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    }]

},{timestamps:true})

const Product = mongoose.model("Product", productSchema);
export default Product