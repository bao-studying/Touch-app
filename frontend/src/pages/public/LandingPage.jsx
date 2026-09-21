import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import SmartReview from "../../components/public/SmartReview";
import SocialLinks from "../../components/public/SocialLinks";
import LoyaltyForm from "../../components/public/LoyaltyForm";

// Landing Page công khai: /p/:slug?tag=UID
// Được dùng CHUNG cho cả khách hàng thật (public) và chế độ "Preview as Guest" trong Admin
// (Setup.jsx truyền businessData/links trực tiếp qua props để live-preview không cần gọi API).
export default function LandingPage({ previewData = null }) {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [business, setBusiness] = useState(previewData);
  const [loading, setLoading] = useState(!previewData);
  const [error, setError] = useState("");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (previewData) {
      setBusiness(previewData);
      return;
    }
    const fetchBusiness = async () => {
      try {
        const res = await api.get(`/business/public/${slug}`);
        setBusiness(res.data);
        const tag = searchParams.get("tag");
        if (tag) api.post(`/nfc/scan/${tag}`).catch(() => {});
      } catch (err) {
        setError("Không tìm thấy trang này. Vui lòng kiểm tra lại đường liên kết.");
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, previewData]);

  useEffect(() => {
    if (previewData) return; // trong khung preview nhỏ, không theo dõi scroll của cả trang
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [previewData]);

  const scrollProgress = Math.min(scrollY / 160, 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 text-espresso-700">
        Đang tải...
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 text-espresso-700 px-6 text-center">
        {error || "Không có dữ liệu"}
      </div>
    );
  }

  return (
    <div className={previewData ? "relative" : "relative min-h-screen"}>
      {/* HERO: ảnh bìa + avatar, mờ dần khi cuộn */}
      <div
        className={`${previewData ? "absolute h-56" : "fixed h-[38vh]"} top-0 left-0 right-0 overflow-hidden bg-espresso-800`}
      >
        {business.coverUrl ? (
          <img src={business.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-espresso-700 to-espresso-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-espresso-950/10 via-espresso-950/5 to-cream-50/95" />
        <div
          className="absolute inset-0 bg-espresso-950 transition-opacity"
          style={{ opacity: previewData ? 0 : scrollProgress * 0.55 }}
        />

        <div
          className="absolute top-5 left-5 flex items-center gap-3 transition-all"
          style={
            previewData
              ? {}
              : { opacity: 1 - scrollProgress, transform: `translateY(${-scrollProgress * 16}px)` }
          }
        >
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-cream-50/80 shadow-md bg-cream-100">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">☕</div>
            )}
          </div>
          <span className="text-cream-50 font-display text-lg drop-shadow-sm">{business.name}</span>
        </div>
      </div>

      {/* Spacer đẩy nội dung xuống dưới hero lúc ban đầu */}
      <div className={previewData ? "h-40" : "h-[30vh]"} />

      {/* Khối nội dung tràn lên phía trên khi cuộn */}
      <div
        className={`relative z-10 rounded-t-[28px] bg-cream-50 px-5 pt-6 shadow-[0_-12px_30px_rgba(42,24,16,0.12)] ${
          previewData ? "pb-10" : "min-h-screen pb-32"
        }`}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-espresso-900/15" />

        <h1 className="font-display text-2xl text-espresso-950 text-center mb-1">{business.name}</h1>
        {business.bio && (
          <p className="text-center text-sm text-espresso-700/70 mb-6 leading-relaxed">{business.bio}</p>
        )}

        <div className="space-y-6">
          <SmartReview businessId={business._id} />
          <SocialLinks links={business.links} mascotUrl={business.mascotUrl} />
        </div>
      </div>

      {!previewData && <LoyaltyForm businessId={business._id} />}
    </div>
  );
}
