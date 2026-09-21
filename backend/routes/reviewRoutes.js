const express = require("express");
const router = express.Router();
const { submitReview, getReviewsByBusiness, updateReviewStatus } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

// Public — khách gửi đánh giá
router.post("/public", submitReview);

// Admin
router.get("/business/:businessId", protect, getReviewsByBusiness);
router.put("/:id/status", protect, updateReviewStatus);

module.exports = router;
