const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: [true, "Transaction type is required."],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required."],
      min: [0.01, "Amount must be greater than 0."],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters."],
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      required: [true, "Payment method is required."],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, "Description cannot exceed 250 characters."],
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required."],
      index: true,
    },
    person: {
      type: String,
      trim: true,
      maxlength: [100, "Person cannot exceed 100 characters."],
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transactionSchema.index({ user: 1, date: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
