import { useState } from "react";
import { Eye, X } from "lucide-react";
import api from "../../api/axios";
import { useBusiness } from "../../context/BusinessContext";
import { getPlanLimits } from "../../utils/planLimits";
import LandingPage from "../public/LandingPage";
import ImageEditPopup from "../../components/admin/setup/ImageEditPopup";
import BioEditPopup from "../../components/admin/setup/BioEditPopup";
import SocialLinksEditPopup from "../../components/admin/setup/SocialLinksEditPopup";
import ReviewSettingsEditPopup from "../../components/admin/setup/ReviewSettingsEditPopup";
import LoyaltyEditPopup from "../../components/admin/setup/LoyaltyEditPopup";
import ThemeEditPopup from "../../components/admin/setup/ThemeEditPopup";

// Setup Tab kiểu Facebook: chỉnh sửa TRỰC TIẾP trên bản xem thật (giống hệt trang công khai),
// mỗi khối có 1 nút "✎ Edit" nổi ngay trên đó — bấm vào mở popup chỉnh riêng phần ấy.
// Dùng chung cho cả mobile lẫn desktop (không còn split-screen).
export default function Setup() {
  const { business, links, refreshLinks, refreshBusiness, updateBusinessLocal } = useBusiness();
  const [activePopup, setActivePopup] = useState(null); // 'cover' | 'logo' | 'bio' | 'links' | 'review' | 'loyalty' | 'theme'
  const [guestPreview, setGuestPreview] = useState(false);

  if (!business) return null;

  const limits = getPlanLimits(business.plan);

  const saveField = async (patch) => {
    const res = await api.put(`/business/${business._id}`, patch);
    updateBusinessLocal(res.data);
  };

  const previewBusiness = {
    ...business,
    links,
    loyaltyOfferText: business.loyaltyOfferText,
    features: {
      hasLoyalty: limits.hasLoyalty,
      hasSmartReview: limits.hasSmartReview,
      showsBrandingFooter: limits.showsBrandingFooter,
    },
  };

  const editHandlers = {
    onEditCover: () => setActivePopup("cover"),
    onEditLogo: () => setActivePopup("logo"),
    onEditBio: () => setActivePopup("bio"),
    onEditLinks: () => setActivePopup("links"),
    onEditReview: () => setActivePopup("review"),
    onEditLoyalty: () => setActivePopup("loyalty"),
    onEditTheme: () => setActivePopup("theme"),
  };

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-20 flex items-center justify-between bg-cream-100/90 backdrop-blur px-4 py-3 md:px-8">
        <div>
          <h1 className="font-display text-lg text-espresso-950">Setup Tab</h1>
          <p className="text-xs text-espresso-700/60">Bấm vào từng phần để chỉnh sửa trực tiếp</p>
        </div>
        <button
          onClick={() => setGuestPreview(true)}
          className="flex items-center gap-1.5 rounded-xl bg-sky-600 text-white px-3.5 py-2 text-sm font-medium shadow-sm shrink-0"
        >
          <Eye size={16} /> Xem như khách
        </button>
      </div>

      {/* Khung điện thoại căn giữa trên desktop cho gọn mắt, full-width trên mobile */}
      <div className="md:flex md:justify-center md:pt-4">
        <div className="md:w-[380px] md:rounded-[2rem] md:border-[6px] md:border-espresso-950 md:overflow-hidden md:shadow-xl md:max-h-[calc(100vh-140px)] md:overflow-y-auto">
          <LandingPage previewData={previewBusiness} editHandlers={editHandlers} />
        </div>
      </div>

      {activePopup === "cover" && (
        <ImageEditPopup title="Ảnh bìa (Cover)" value={business.coverUrl} shape="wide" onClose={() => setActivePopup(null)} onSave={(url) => saveField({ coverUrl: url })} />
      )}
      {activePopup === "logo" && (
        <ImageEditPopup title="Logo / Avatar" value={business.logoUrl} shape="square" onClose={() => setActivePopup(null)} onSave={(url) => saveField({ logoUrl: url })} />
      )}
      {activePopup === "bio" && (
        <BioEditPopup name={business.name} bio={business.bio} onClose={() => setActivePopup(null)} onSave={(patch) => saveField(patch)} />
      )}
      {activePopup === "links" && (
        <SocialLinksEditPopup businessId={business._id} plan={business.plan} links={links} onClose={() => setActivePopup(null)} onRefresh={refreshLinks} />
      )}
      {activePopup === "review" && (
        <ReviewSettingsEditPopup business={business} hasSmartReview={limits.hasSmartReview} onClose={() => setActivePopup(null)} onSave={(patch) => saveField(patch)} />
      )}
      {activePopup === "loyalty" && (
        <LoyaltyEditPopup business={business} hasLoyalty={limits.hasLoyalty} onClose={() => setActivePopup(null)} onSave={(patch) => saveField(patch)} />
      )}
      {activePopup === "theme" && (
        <ThemeEditPopup theme={business.theme} onClose={() => setActivePopup(null)} onSave={(patch) => saveField(patch)} />
      )}

      {/* Chế độ xem phía khách - fullscreen, sạch hoàn toàn, không có bất kỳ chrome chỉnh sửa nào */}
      {guestPreview && (
        <div className="fixed inset-0 z-50 bg-cream-50 overflow-y-auto">
          <button
            onClick={() => setGuestPreview(false)}
            className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-espresso-950/80 text-cream-50 flex items-center justify-center"
            aria-label="Đóng xem trước"
          >
            <X size={18} />
          </button>
          <LandingPage previewData={previewBusiness} />
        </div>
      )}
    </div>
  );
}
