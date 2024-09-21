import mongoose from "mongoose";

// mainSchema

const trackingSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

export const Tracking = mongoose.model("Tracking", trackingSchema);
