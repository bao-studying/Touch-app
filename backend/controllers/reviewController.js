const Review = require("../models/Review");
const Business = require("../models/Business");

// @desc  Khách gửi đánh giá sao (public, không cần đăng nhập)
// @route POST /api/reviews/public
// body: { businessId, rating, feedbackText?, branch? }
const submitReview = async (req, res) => {
  try {
    const { businessId, rating, feedbackText, branch } = req.body;
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Số sao không hợp lệ" });
    }

    const channel = numRating >= business.reviewThreshold ? "redirected_public" : "internal";

    const review = await Review.create({
      business: businessId,
      rating: numRating,
      feedbackText: channel === "internal" ? feedbackText || "" : "",
      channel,
      branch: branch || "",
    });

    // Trả về nơi cần redirect nếu là review công khai, để frontend điều hướng
    res.status(201).json({
      review,
      redirectUrl: channel === "redirected_public" ? business.googleMapsLink || business.shopeeLink : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi gửi đánh giá", error: err.message });
  }
};

// @desc  Admin xem danh sách đánh giá (đặc biệt các review nội bộ 1-3 sao)
// @route GET /api/reviews/business/:businessId
const getReviewsByBusiness = async (req, res) => {
  const business = await Business.findById(req.params.businessId);
  if (!business) return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });
  if (business.owner.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  const { channel } = req.query; // optional filter: internal | redirected_public
  const query = { business: req.params.businessId };
  if (channel) query.channel = channel;

  const reviews = await Review.find(query).sort({ createdAt: -1 });
  res.json(reviews);
};

// @desc  Cập nhật trạng thái xử lý góp ý nội bộ
// @route PUT /api/reviews/:id/status
const updateReviewStatus = async (req, res) => {
  const review = await Review.findById(req.params.id).populate("business");
  if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });
  if (review.business.owner.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ message: "Không có quyền" });
  }

  review.status = req.body.status || review.status;
  await review.save();
  res.json(review);
};

module.exports = { submitReview, getReviewsByBusiness, updateReviewStatus };
