const Lead = require("../models/Lead");
const Business = require("../models/Business");

// @desc  Khách đăng ký Khách hàng thân thiết (public)
// @route POST /api/leads/public
const submitLead = async (req, res) => {
  try {
    const { businessId, name, phone, email, zalo, dob, branch } = req.body;
    if (!businessId || !name) {
      return res.status(400).json({ message: "Thiếu thông tin doanh nghiệp hoặc tên khách hàng" });
    }
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });

    const lead = await Lead.create({
      business: businessId,
      name,
      phone: phone || "",
      email: email || "",
      zalo: zalo || "",
      dob: dob || undefined,
      branch: branch || "",
    });

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi đăng ký khách hàng thân thiết", error: err.message });
  }
};

// @desc  Admin xem danh sách khách hàng (CRM)
// @route GET /api/leads/business/:businessId
const getLeadsByBusiness = async (req, res) => {
  const business = await Business.findById(req.params.businessId);
  if (!business) return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });
  if (business.owner.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  const leads = await Lead.find({ business: req.params.businessId }).sort({ createdAt: -1 });
  res.json(leads);
};

// @desc  Xuất CSV danh sách khách hàng
// @route GET /api/leads/business/:businessId/export
const exportLeadsCsv = async (req, res) => {
  const business = await Business.findById(req.params.businessId);
  if (!business) return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });
  if (business.owner.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  const leads = await Lead.find({ business: req.params.businessId }).sort({ createdAt: -1 });

  const escapeCsv = (val = "") => `"${String(val).replace(/"/g, '""')}"`;
  const header = ["Họ tên", "Số điện thoại", "Email", "Zalo", "Ngày sinh", "Chi nhánh", "Điểm", "Ngày đăng ký"];
  const rows = leads.map((l) =>
    [
      l.name,
      l.phone,
      l.email,
      l.zalo,
      l.dob ? new Date(l.dob).toLocaleDateString("vi-VN") : "",
      l.branch,
      l.points,
      new Date(l.createdAt).toLocaleDateString("vi-VN"),
    ]
      .map(escapeCsv)
      .join(",")
  );
  const csv = "\uFEFF" + [header.map(escapeCsv).join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="crm-${business.slug}.csv"`);
  res.send(csv);
};

module.exports = { submitLead, getLeadsByBusiness, exportLeadsCsv };
