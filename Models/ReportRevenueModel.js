import mongoose from "mongoose";

const ReportRevenueSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    entryDate: { type: Date, required: true }, // Ngày nhập
    quantity: { type: Number, required: true }, // Số lượng
    unitPrice: { type: Number, required: true }, // Giá nhập trên đơn vị
    totalPrice: { type: Number, required: true },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    }   
  },
  {
    timestamp: true,
  },
);

const reportRevenue = mongoose.model("ReportRevenue", ReportRevenueSchema);
export default reportRevenue;
