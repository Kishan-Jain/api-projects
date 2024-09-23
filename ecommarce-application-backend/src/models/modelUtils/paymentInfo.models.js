import mongoose from "mongoose";

// miniSchema

// mainSchema

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: [true, "field is required"],
  },
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
  paymentType: {
    type: String,
    enum: ["netbanking", "upi", "debit_card/ credit_card", "cod"],
    required: [true, "field is required"],
  },
  payAmount: Number,
  stutes: {
    type: String,
    enum: ["pending", "success", "failed"],
    required: [true, "Payment Status not difine"],
  }
});

const PaymentDetail = mongoose.model("PaymentDetail", paymentSchema);
export default PaymentDetail
