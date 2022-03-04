const { Schema, model } = require("mongoose");

const accountholderSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    offChainAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      unique: true,
    },
    onChainAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Accountholder = model("Accountholder", accountholderSchema);

module.exports = Accountholder;
