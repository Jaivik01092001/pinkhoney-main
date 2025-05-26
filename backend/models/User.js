/**
 * User model
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    clerkId: {
      type: String,
      sparse: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
    },
    tokens: {
      type: String,
      default: "0",
    },
    subscribed: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    subscription: {
      type: {
        plan: {
          type: String,
          enum: ["free", "monthly", "yearly", "lifetime"],
          default: "free",
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ["active", "inactive", "canceled"],
          default: "inactive",
        },
        stripeCustomerId: {
          type: String,
        },
        stripeSubscriptionId: {
          type: String,
        },
      },
      default: {
        plan: "free",
        status: "inactive",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
