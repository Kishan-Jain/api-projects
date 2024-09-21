import mongoose from "mongoose";
// subSchema

// mainSchema

const replaceSchema = new mongoose.Schema(
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
    trackingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tracking",
      required: [true, "this is required field"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "process",
        "ready to ship",
        "shipped",
        "deleverd",
        "cancelled",
      ],
      default: "pending",
    },
    // status : {
    //     type : String,
    //     ref : 'Order'
    // }
  },
  { timestamps: true }
);

export const Replace = mongoose.model("Replace", replaceSchema);
