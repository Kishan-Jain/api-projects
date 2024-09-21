import mongoose from "mongoose";

// subSchema

// mainSchema

const returnSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    Query: { type: String },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentDetail",
      required: [true, "this is required field"],
    },
    status: {
      type: String,
      enum: ["pending", "process", "complete", "cancelled", "returned"],
      default: "pending",
    },
    // status : {
    //     type : String,
    //     ref : 'Order'
    // }
  },
  { timestamps: true }
);

export const Return = mongoose.model("Return", returnSchema);
