import mongoose from "mongoose";

// miniSchema

// mainSchema

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: [true, "field is required"],
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
    required: [true, "field is required"],
  },
});

export const PaymentDetail = mongoose.model("PaymentDetail", paymentSchema);
