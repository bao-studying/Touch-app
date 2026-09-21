// Mirror của backend/config/planLimits.js — CHỈ dùng để hiển thị đúng trạng thái khóa/mở trên giao diện.
// Backend vẫn là nơi thực thi thật (xem planGate.js), đổi ở đây không "mở khóa" được gì cả.
export const PLAN_LIMITS = {
  free: {
    maxSocialLinks: 2,
    allowedAnimations: ["stationary", "bouncing"],
    hasLoyalty: false,
    hasCrmExport: false,
    hasSmartReview: false,
    hasMultiBranch: false,
    showsBrandingFooter: true,
  },
  level1: {
    maxSocialLinks: Infinity,
    allowedAnimations: ["stationary", "bouncing"],
    hasLoyalty: true,
    hasCrmExport: true,
    hasSmartReview: false,
    hasMultiBranch: false,
    showsBrandingFooter: false,
  },
  level2: {
    maxSocialLinks: Infinity,
    allowedAnimations: ["stationary", "bouncing", "marquee", "orbit"],
    hasLoyalty: true,
    hasCrmExport: true,
    hasSmartReview: true,
    hasMultiBranch: false,
    showsBrandingFooter: false,
  },
  level3: {
    maxSocialLinks: Infinity,
    allowedAnimations: ["stationary", "bouncing", "marquee", "orbit"],
    hasLoyalty: true,
    hasCrmExport: true,
    hasSmartReview: true,
    hasMultiBranch: true,
    showsBrandingFooter: false,
  },
};

export const PLAN_LABELS = { free: "Free", level1: "Level 1", level2: "Level 2", level3: "Level 3" };

export const getPlanLimits = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.free;

// Gói tối thiểu cần để mở 1 cờ tính năng — dùng để hiển thị "🔒 Cần Level X"
export const minPlanFor = (featureKey) => {
  const order = ["free", "level1", "level2", "level3"];
  for (const p of order) {
    if (PLAN_LIMITS[p][featureKey]) return p;
  }
  return "level3";
};
