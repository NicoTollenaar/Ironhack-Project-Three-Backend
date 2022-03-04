const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = model("Transaction", transactionSchema);

module.exports = Transaction;
