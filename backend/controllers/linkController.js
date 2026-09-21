const Link = require("../models/Link");
const Business = require("../models/Business");

// Helper: xác nhận business thuộc về admin đang đăng nhập
const assertOwnership = async (businessId, adminId) => {
  const business = await Business.findById(businessId);
  if (!business) return { error: "Không tìm thấy doanh nghiệp", status: 404 };
  if (business.owner.toString() !== adminId.toString()) {
    return { error: "Bạn không có quyền chỉnh sửa doanh nghiệp này", status: 403 };
  }
  return { business };
};

// @desc  Lấy tất cả link của 1 business (dùng cho Setup Tab)
// @route GET /api/links/business/:businessId
const getLinksByBusiness = async (req, res) => {
  const { error, status } = await assertOwnership(req.params.businessId, req.admin._id);
  if (error) return res.status(status).json({ message: error });

  const links = await Link.find({ business: req.params.businessId }).sort({ order: 1 });
  res.json(links);
};

// @desc  Thêm link mới
// @route POST /api/links
const createLink = async (req, res) => {
  const { business: businessId, platform, url, label, animation, order } = req.body;
  const { error, status } = await assertOwnership(businessId, req.admin._id);
  if (error) return res.status(status).json({ message: error });

  const link = await Link.create({
    business: businessId,
    platform,
    url,
    label: label || "",
    animation: animation || "stationary",
    order: order ?? 0,
  });
  res.status(201).json(link);
};

// @desc  Cập nhật link (url, label, animation, thứ tự, ẩn/hiện)
// @route PUT /api/links/:id
const updateLink = async (req, res) => {
  const link = await Link.findById(req.params.id);
  if (!link) return res.status(404).json({ message: "Không tìm thấy link" });

  const { error, status } = await assertOwnership(link.business, req.admin._id);
  if (error) return res.status(status).json({ message: error });

  const editableFields = ["platform", "label", "url", "order", "animation", "active"];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) link[field] = req.body[field];
  });

  await link.save();
  res.json(link);
};

// @desc  Xóa link
// @route DELETE /api/links/:id
const deleteLink = async (req, res) => {
  const link = await Link.findById(req.params.id);
  if (!link) return res.status(404).json({ message: "Không tìm thấy link" });

  const { error, status } = await assertOwnership(link.business, req.admin._id);
  if (error) return res.status(status).json({ message: error });

  await link.deleteOne();
  res.json({ message: "Đã xóa link" });
};

module.exports = { getLinksByBusiness, createLink, updateLink, deleteLink };
