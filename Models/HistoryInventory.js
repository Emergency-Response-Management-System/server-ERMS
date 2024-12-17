import mongoose from "mongoose";
const historyInventorySchema = mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
    },
 
    status: {
      type: String,
      require: true,
    },
    total: {
      type: Number,
      require: true,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);
const HistoryInventory = mongoose.model("HistoryInventory", historyInventorySchema);
export default HistoryInventory;
