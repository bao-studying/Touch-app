// Kiểm tra "lazy": gọi hàm này mỗi khi đọc/ghi 1 Business. Nếu gói trả phí đã quá hạn,
// tự động hạ về Free và LƯU LẠI — nhưng KHÔNG xoá dữ liệu đã có (links, leads, reviews...),
// chỉ ảnh hưởng tới việc tạo/sửa mới các tính năng thuộc gói cao hơn.
const ensureActivePlan = async (business) => {
  if (business.plan !== "free" && business.planExpiresAt && business.planExpiresAt < new Date()) {
    business.plan = "free";
    business.planExpiresAt = null;
    business.planHistory.push({ plan: "free", changedAt: new Date() });
    await business.save();
  }
  return business;
};

module.exports = { ensureActivePlan };
