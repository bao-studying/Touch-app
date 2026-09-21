const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    // Góp ý nội bộ chỉ có khi rating thấp hơn ngưỡng (reviewThreshold)
    feedbackText: { type: String, default: "" },
    // "redirected_public": khách đã được đưa sang Google Maps/Shopee
    // "internal": góp ý nội bộ gửi thẳng Admin
    channel: { type: String, enum: ["redirected_public", "internal"], required: true },
    status: { type: String, enum: ["new", "seen", "resolved"], default: "new" },
    branch: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
