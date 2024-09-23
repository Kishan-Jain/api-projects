import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema({
    sellerId : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Seller",
      required : true
    },
    userId : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User",
      required : true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    replaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Replace",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentDetail",
    },
    company_name: {
      type: String,
    },
    stutes: {
      type: String,
      enum: ["request", "process", "transmit", "complete"],
      default: "request",
    },
},{ timestamps: true });

const Tracking = mongoose.model("Tracking", trackingSchema);
export default Tracking