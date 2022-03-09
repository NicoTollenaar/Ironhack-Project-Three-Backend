const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    fromAccountid: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    toAccountId: {
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
