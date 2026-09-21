const Business = require("../models/Business");
const Link = require("../models/Link");

const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/đ/g, "d")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// @desc  Tạo hồ sơ doanh nghiệp cho admin đang đăng nhập
// @route POST /api/business
const createBusiness = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Vui lòng nhập tên doanh nghiệp" });

    let baseSlug = slugify(name) || "shop";
    let slug = baseSlug;
    let counter = 1;
    while (await Business.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const business = await Business.create({
      owner: req.admin._id,
      name,
      slug,
    });

    res.status(201).json(business);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo doanh nghiệp", error: err.message });
  }
};

// @desc  Lấy danh sách doanh nghiệp của admin đang đăng nhập
// @route GET /api/business/mine
const getMyBusinesses = async (req, res) => {
  const businesses = await Business.find({ owner: req.admin._id }).sort({ createdAt: -1 });
  res.json(businesses);
};

// @desc  Lấy 1 doanh nghiệp theo id (chỉ chủ sở hữu)
// @route GET /api/business/:id
const getBusinessById = async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });
  if (business.owner.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ message: "Bạn không có quyền truy cập doanh nghiệp này" });
  }
  res.json(business);
};

// @desc  Cập nhật hồ sơ doanh nghiệp (live edit từ Setup Tab)
// @route PUT /api/business/:id
const updateBusiness = async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });
  if (business.owner.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa doanh nghiệp này" });
  }

  const editableFields = [
    "name",
    "logoUrl",
    "coverUrl",
    "bio",
    "mascotUrl",
    "googleMapsLink",
    "shopeeLink",
    "wifiInfo",
    "hotline",
    "reviewThreshold",
    "plan",
    "branches",
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) business[field] = req.body[field];
  });

  await business.save();
  res.json(business);
};

// @desc  Lấy Landing Page công khai (business + links active) theo slug — KHÔNG cần đăng nhập
// @route GET /api/business/public/:slug
const getPublicBusinessBySlug = async (req, res) => {
  const business = await Business.findOne({ slug: req.params.slug });
  if (!business) return res.status(404).json({ message: "Không tìm thấy trang này" });

  const links = await Link.find({ business: business._id, active: true }).sort({ order: 1 });

  res.json({
    _id: business._id,
    name: business.name,
    slug: business.slug,
    logoUrl: business.logoUrl,
    coverUrl: business.coverUrl,
    bio: business.bio,
    mascotUrl: business.mascotUrl,
    googleMapsLink: business.googleMapsLink,
    shopeeLink: business.shopeeLink,
    reviewThreshold: business.reviewThreshold,
    plan: business.plan,
    links,
  });
};

module.exports = {
  createBusiness,
  getMyBusinesses,
  getBusinessById,
  updateBusiness,
  getPublicBusinessBySlug,
};
