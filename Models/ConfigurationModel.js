import mongoose from "mongoose";
const configurationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: 'default',
      require: true,
    },
    nameWeb: {
      type: String,
      require: true,
    },
    logo: {
      type: String,
    },
    avatarDefault: {
      type: String,
    },
    backgroundLogin: {
      type: String,
    },
    colorDefault: {
      type: String,
    },
    quantityWarning: {
      type: Number,
      default: 30,
    },
    quantityDate: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
  },
);
const Configuration = mongoose.model("Configuration", configurationSchema);
export default Configuration;
