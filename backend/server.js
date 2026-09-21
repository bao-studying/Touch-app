require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());

// Phục vụ ảnh đã upload (logo/cover/mascot) — lưu local cho demo, xem ghi chú trong uploadController.js
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "O2O Brand Promotion API đang chạy 🚀" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/business", require("./routes/businessRoutes"));
app.use("/api/links", require("./routes/linkRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/nfc", require("./routes/nfcRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy route: ${req.originalUrl}` });
});

// Error handler chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Lỗi máy chủ" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));
