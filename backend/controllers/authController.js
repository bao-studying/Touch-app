const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");

// @desc  Đăng ký chủ doanh nghiệp mới
// @route POST /api/auth/register
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên, email và mật khẩu" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email này đã được đăng ký" });
    }

    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ khi đăng ký", error: err.message });
  }
};

// @desc  Đăng nhập
// @route POST /api/auth/login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      return res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
      });
    }

    res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ khi đăng nhập", error: err.message });
  }
};

// @desc  Lấy thông tin admin đang đăng nhập
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.admin);
};

// @desc  Cập nhật tên hiển thị (trang Cài đặt tài khoản)
// @route PUT /api/auth/me
const updateProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (req.body.name) admin.name = req.body.name;
  await admin.save();
  res.json({ _id: admin._id, name: admin.name, email: admin.email });
};

// @desc  Đổi mật khẩu (trang Cài đặt tài khoản)
// @route PUT /api/auth/me/password
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới (tối thiểu 6 ký tự)" });
  }

  const admin = await Admin.findById(req.admin._id);
  const matches = await admin.matchPassword(currentPassword);
  if (!matches) return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });

  admin.password = newPassword; // pre('save') hook trong model sẽ tự hash lại
  await admin.save();
  res.json({ message: "Đã đổi mật khẩu thành công" });
};

module.exports = { registerAdmin, loginAdmin, getMe, updateProfile, updatePassword };
