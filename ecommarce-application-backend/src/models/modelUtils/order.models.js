import mongoose from "mongoose";
// subSchema

const orderedItem = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "this is required field"],
    },
    quantity: { type: Number, default: 1 },
    amount: Number, // amount calculate on pre save time
  },
  { timestamps: true }
);

// mainSchema

const orderSchema = new mongoose.Schema(
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

    orderedItem: [orderedItem],
    total: Number, // total in calculate on pre save method

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

export const Order = mongoose.model("Order", orderSchema);
