const { Schema, model } = require("mongoose");

const accountSchema = new Schema(
  {
    accountholder: {
      type: Schema.Types.ObjectId,
      ref: "Accountholder",
    },
    accountType: {
      type: String,
      enum: ["on-chain", "off-chain"],
      required: true,
    },
    address: {
      type: String,
      required: true,
      unique: true,
    },
    balance: Number,
  },
  {
    timestamps: true,
  }
);

const Account = model("Account", accountSchema);

module.exports = Account;
