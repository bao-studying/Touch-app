import { useState } from "react";
import { Check, X, Package, Wrench } from "lucide-react";
import api from "../../api/axios";
import { useBusiness } from "../../context/BusinessContext";
import { diffUnlockedFeatures } from "../../utils/planLimits";
import UnlockToast from "../../components/admin/UnlockToast";
import PaymentModal from "../../components/admin/PaymentModal";

const PLANS = [
  { id: "free", name: "Free", price: "0đ", desc: "Trang giới thiệu cơ bản, có quảng cáo hỗ trợ duy trì máy chủ.", features: ["Landing Page cơ bản", "Tối đa 2 Social Links", "Có quảng cáo"] },
  { id: "level1", name: "Level 1", price: "99.000đ/tháng", desc: "Bắt đầu thu thập dữ liệu khách hàng.", features: ["Mọi tính năng Free", "Không giới hạn Social Links", "Loyalty Lead Capture", "CRM + Xuất CSV"] },
  { id: "level2", name: "Level 2", price: "199.000đ/tháng", desc: "Chủ động quản lý danh tiếng thương hiệu.", features: ["Mọi tính năng Level 1", "Smart Review (gating thông minh)", "Animation Marquee/Orbit", "Loại bỏ quảng cáo"] },
  { id: "level3", name: "Level 3", price: "299.000đ/tháng", desc: "Dành cho chuỗi nhiều chi nhánh.", features: ["Mọi tính năng Level 2", "Quản lý đa chi nhánh"] },
];

const COMPARE_ROWS = [
  { label: "Số Social Links", free: "2", level1: "Không giới hạn", level2: "Không giới hạn", level3: "Không giới hạn" },
  { label: "Hiệu ứng Marquee/Orbit", free: false, level1: false, level2: true, level3: true },
  { label: "Loyalty Lead Capture", free: false, level1: true, level2: true, level3: true },
  { label: "CRM + Xuất CSV", free: false, level1: true, level2: true, level3: true },
  { label: "Smart Review (gating)", free: false, level1: false, level2: true, level3: true },
  { label: "Chọn kiểu chữ thương hiệu", free: false, level1: true, level2: true, level3: true },
  { label: "Đa chi nhánh", free: false, level1: false, level2: false, level3: true },
  { label: "Không có quảng cáo", free: false, level1: false, level2: true, level3: true },
];

export default function Store() {
  const { business, updateBusinessLocal, refreshBusiness } = useBusiness();
  const [saving, setSaving] = useState(false);
  const [unlocked, setUnlocked] = useState(null);
  const [payingPlan, setPayingPlan] = useState(null); // plan id đang mở PaymentModal, null = đóng

  const handleSelectPlan = async (planId) => {
    if (planId === "free") {
      setSaving(true);
      try {
        const res = await api.put(`/business/${business._id}/plan`, { plan: "free" });
        updateBusinessLocal(res.data.business);
      } finally {
        setSaving(false);
      }
      return;
    }
    setPayingPlan(planId);
  };

  const handlePaymentSuccess = async (planId) => {
    const oldPlan = business.plan;
    setPayingPlan(null);
    const updated = await refreshBusiness();
    const features = diffUnlockedFeatures(oldPlan, updated?.plan || planId);
    if (features.length > 0) setUnlocked(features);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 md:px-8 md:py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-espresso-950">Gói dịch vụ</h1>
        <p className="text-sm text-espresso-700/60">Nâng cấp để mở khóa Smart Review, CRM và quản lý đa chi nhánh.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const active = business?.plan === plan.id;
          return (
            <div key={plan.id} className={`rounded-2xl p-5 flex flex-col shadow-sm ring-1 ${active ? "bg-espresso-950 text-cream-50 ring-espresso-950" : "bg-white ring-espresso-900/5"}`}>
              <p className="font-display text-lg">{plan.name}</p>
              <p className={`text-xl font-semibold mt-1 ${active ? "text-amber-400" : "text-espresso-900"}`}>{plan.price}</p>
              <p className={`text-xs mt-2 ${active ? "text-cream-100/70" : "text-espresso-700/60"}`}>{plan.desc}</p>
              <ul className="mt-4 space-y-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-1.5 text-xs ${active ? "text-cream-100/85" : "text-espresso-700/75"}`}>
                    <Check size={13} className={`mt-0.5 shrink-0 ${active ? "text-amber-400" : "text-sage-500"}`} /> {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={active || saving}
                onClick={() => handleSelectPlan(plan.id)}
                className={`mt-4 rounded-xl py-2 text-sm font-medium ${
                  active ? "bg-cream-50/10 text-cream-50 cursor-default" : "bg-espresso-800 text-cream-50"
                }`}
              >
                {active ? "Đang sử dụng" : plan.id === "free" ? "Chọn gói này" : "Nâng cấp — Thanh toán"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bảng so sánh tính năng */}
      <div className="rounded-2xl bg-white ring-1 ring-espresso-900/5 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-espresso-900/8">
              <th className="text-left px-4 py-3 text-espresso-700/60 font-medium text-xs">Tính năng</th>
              {PLANS.map((p) => (
                <th key={p.id} className="text-center px-4 py-3 text-espresso-900 font-medium text-xs">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-espresso-900/5 last:border-0">
                <td className="px-4 py-2.5 text-espresso-800 text-xs">{row.label}</td>
                {["free", "level1", "level2", "level3"].map((planId) => (
                  <td key={planId} className="text-center px-4 py-2.5">
                    {typeof row[planId] === "boolean" ? (
                      row[planId] ? (
                        <Check size={15} className="mx-auto text-sage-500" />
                      ) : (
                        <X size={15} className="mx-auto text-espresso-900/20" />
                      )
                    ) : (
                      <span className="text-xs text-espresso-700/80">{row[planId]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white ring-1 ring-espresso-900/5 p-5 shadow-sm">
          <Package className="text-clay-500 mb-2" size={22} />
          <p className="font-medium text-espresso-900 mb-1">Bán kèm phần cứng</p>
          <p className="text-xs text-espresso-700/60 mb-3">Mô hình decor gắn sẵn chip NFC (NTAG213) + mã QR, đã lập trình sẵn để chạm là mở trang.</p>
          <p className="text-sm font-semibold text-espresso-900">Từ 149.000đ / vật phẩm</p>
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-espresso-900/5 p-5 shadow-sm">
          <Wrench className="text-clay-500 mb-2" size={22} />
          <p className="font-medium text-espresso-900 mb-1">Phí dịch vụ thiết kế (Setup Fee)</p>
          <p className="text-xs text-espresso-700/60 mb-3">Đội ngũ hỗ trợ thiết kế Landing Page, chụp ảnh bìa, viết bio thương hiệu theo phong cách riêng.</p>
          <p className="text-sm font-semibold text-espresso-900">Liên hệ báo giá</p>
        </div>
      </div>

      {payingPlan && (
        <PaymentModal plan={payingPlan} businessId={business._id} onClose={() => setPayingPlan(null)} onSuccess={handlePaymentSuccess} />
      )}
      {unlocked && <UnlockToast features={unlocked} onDone={() => setUnlocked(null)} />}
    </div>
  );
}
