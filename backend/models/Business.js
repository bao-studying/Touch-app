const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // dùng cho /p/:slug
    logoUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 300 },
    mascotUrl: { type: String, default: "" }, // ảnh mô hình 3D linh vật cho luồng kích hoạt NFC

    googleMapsLink: { type: String, default: "" },
    shopeeLink: { type: String, default: "" },
    wifiInfo: { type: String, default: "" },
    hotline: { type: String, default: "" },

    // Ngưỡng sao để redirect ra review công khai (mặc định 4)
    reviewThreshold: { type: Number, default: 4, min: 1, max: 5 },

    plan: {
      type: String,
      enum: ["free", "level1", "level2", "level3"],
      default: "free",
    },

    // Level 3: quản lý đa chi nhánh
    branches: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
