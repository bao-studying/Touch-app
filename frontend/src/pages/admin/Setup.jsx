import { useState } from "react";
import { Eye, X, Plus, Trash2, Pencil, GripVertical } from "lucide-react";
import api from "../../api/axios";
import { useBusiness } from "../../context/BusinessContext";
import EditableField from "../../components/admin/EditableField";
import AnimationPicker from "../../components/admin/AnimationPicker";
import LandingPage from "../public/LandingPage";

const PLATFORMS = ["facebook", "tiktok", "shopee", "zalo", "website", "wifi", "hotline", "instagram", "youtube", "email"];

export default function Setup() {
  const { business, links, refreshLinks, updateBusinessLocal } = useBusiness();
  const [guestPreview, setGuestPreview] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [addingLink, setAddingLink] = useState(false);
  const [newLink, setNewLink] = useState({ platform: "facebook", url: "", label: "" });

  if (!business) return null;

  const saveField = async (field, value) => {
    const res = await api.put(`/business/${business._id}`, { [field]: value });
    updateBusinessLocal(res.data);
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    await api.post("/links", { business: business._id, ...newLink, order: links.length });
    setNewLink({ platform: "facebook", url: "", label: "" });
    setAddingLink(false);
    refreshLinks();
  };

  const handleUpdateLink = async (id, patch) => {
    await api.put(`/links/${id}`, patch);
    refreshLinks();
  };

  const handleDeleteLink = async (id) => {
    await api.delete(`/links/${id}`);
    refreshLinks();
  };

  const previewBusiness = { ...business, links };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 md:px-8 md:py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl text-espresso-950">Setup Tab</h1>
          <p className="text-sm text-espresso-700/60">Chỉnh sửa trực tiếp — thay đổi hiển thị ngay trên bản xem trước.</p>
        </div>
        <button
          onClick={() => setGuestPreview(true)}
          className="flex items-center gap-1.5 rounded-xl bg-sky-600 text-white px-3.5 py-2 text-sm font-medium shadow-sm"
        >
          <Eye size={16} /> Xem như khách
        </button>
      </div>

      <div className="md:grid md:grid-cols-[1fr_360px] md:gap-8 md:items-start">
        {/* CỘT TRÁI: bảng điều khiển */}
        <div className="space-y-6">
          <Section title="Thương hiệu">
            <EditableField label="Tên doanh nghiệp" value={business.name} onSave={(v) => saveField("name", v)} />
            <EditableField label="Ảnh bìa (Cover URL)" value={business.coverUrl} placeholder="https://..." onSave={(v) => saveField("coverUrl", v)} />
            <EditableField label="Logo / Avatar URL" value={business.logoUrl} placeholder="https://..." onSave={(v) => saveField("logoUrl", v)} />
            <EditableField label="Ảnh linh vật (Mascot URL — dùng cho hiệu ứng Orbit)" value={business.mascotUrl} placeholder="https://..." onSave={(v) => saveField("mascotUrl", v)} />
            <EditableField label="Lời chào / Bio" value={business.bio} multiline onSave={(v) => saveField("bio", v)} />
          </Section>

          <Section title="Đánh giá thông minh">
            <EditableField label="Link đánh giá Google Maps" value={business.googleMapsLink} placeholder="https://g.page/..." onSave={(v) => saveField("googleMapsLink", v)} />
            <EditableField label="Link đánh giá Shopee" value={business.shopeeLink} placeholder="https://shopee.vn/..." onSave={(v) => saveField("shopeeLink", v)} />
            <EditableField label="Ngưỡng sao redirect công khai (1-5)" type="number" value={business.reviewThreshold} onSave={(v) => saveField("reviewThreshold", Number(v))} />
          </Section>

          <Section title="Tiện ích">
            <EditableField label="Thông tin Wifi" value={business.wifiInfo} onSave={(v) => saveField("wifiInfo", v)} />
            <EditableField label="Hotline" value={business.hotline} onSave={(v) => saveField("hotline", v)} />
          </Section>

          <Section title="Cổng liên kết nền tảng (Social Links)">
            <div className="space-y-2">
              {links.map((link) => (
                <div key={link._id} className="rounded-xl border border-espresso-900/10 bg-white">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <GripVertical size={14} className="text-espresso-900/20 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-espresso-900 capitalize">{link.label || link.platform}</p>
                      <p className="text-xs text-espresso-700/50 truncate">{link.url}</p>
                    </div>
                    <button
                      onClick={() => handleUpdateLink(link._id, { active: !link.active })}
                      className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${
                        link.active ? "bg-sage-400/20 text-sage-500" : "bg-espresso-900/10 text-espresso-700/50"
                      }`}
                    >
                      {link.active ? "Đang hiện" : "Đã ẩn"}
                    </button>
                    <button onClick={() => setEditingLinkId(editingLinkId === link._id ? null : link._id)} className="p-1.5 text-espresso-700/50 shrink-0">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteLink(link._id)} className="p-1.5 text-clay-500 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {editingLinkId === link._id && (
                    <div className="px-3 pb-3 space-y-3 border-t border-espresso-900/8 pt-3">
                      <input
                        value={link.url}
                        onChange={(e) => handleUpdateLink(link._id, { url: e.target.value })}
                        className="w-full rounded-lg border border-espresso-900/15 px-2.5 py-1.5 text-sm"
                        placeholder="URL"
                      />
                      <input
                        value={link.label || ""}
                        onChange={(e) => handleUpdateLink(link._id, { label: e.target.value })}
                        className="w-full rounded-lg border border-espresso-900/15 px-2.5 py-1.5 text-sm"
                        placeholder="Nhãn hiển thị tùy chỉnh (tùy chọn)"
                      />
                      <AnimationPicker value={link.animation} onChange={(anim) => handleUpdateLink(link._id, { animation: anim })} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!addingLink ? (
              <button
                onClick={() => setAddingLink(true)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-espresso-900/25 text-espresso-700/70 py-2.5 text-sm"
              >
                <Plus size={16} /> Thêm liên kết
              </button>
            ) : (
              <form onSubmit={handleAddLink} className="mt-3 rounded-xl border border-espresso-900/10 bg-white p-3 space-y-2">
                <select
                  value={newLink.platform}
                  onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                  className="w-full rounded-lg border border-espresso-900/15 px-2.5 py-1.5 text-sm capitalize"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p} className="capitalize">
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  required
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-espresso-900/15 px-2.5 py-1.5 text-sm"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-espresso-800 text-cream-50 py-2 text-sm font-medium">
                    Lưu
                  </button>
                  <button type="button" onClick={() => setAddingLink(false)} className="flex-1 rounded-lg bg-espresso-900/10 text-espresso-700 py-2 text-sm">
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </Section>
        </div>

        {/* CỘT PHẢI: Live Preview (desktop split-screen) */}
        <div className="hidden md:block">
          <div className="sticky top-8">
            <p className="text-xs text-espresso-700/50 mb-2 text-center">Live Preview</p>
            <div className="mx-auto w-[320px] h-[640px] rounded-[2rem] border-[6px] border-espresso-950 overflow-hidden shadow-xl relative">
              <div className="w-full h-full overflow-y-auto no-scrollbar">
                <LandingPage previewData={previewBusiness} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chế độ xem phía khách - fullscreen, không có bút chì chỉnh sửa */}
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

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-espresso-900 mb-2 px-1">{title}</h2>
      <div className="rounded-2xl bg-white ring-1 ring-espresso-900/5 px-3 py-1 shadow-sm">{children}</div>
    </div>
  );
}
