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
    stock : {type:Number, ref:"Seller"},
    seller_name :{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Seller",
        required:[true, "this is required field" ]
    }

},{timestamps:true})

export const Product = mongoose.model("Product", productSchema);