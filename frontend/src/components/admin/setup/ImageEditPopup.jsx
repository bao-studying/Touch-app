import { useState } from "react";
import { Upload, Check, Loader2 } from "lucide-react";
import EditPopup from "./EditPopup";
import { uploadImageFile } from "../../../api/upload";

// shape: "square" (Logo/Mascot) hoặc "wide" (Cover) — khung xem trước LUÔN cố định kích thước,
// không phụ thuộc link dài ngắn hay kích thước ảnh gốc.
export default function ImageEditPopup({ title, value, onClose, onSave, shape = "square" }) {
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const frameClass = shape === "wide" ? "w-full h-36 rounded-xl" : "w-28 h-28 mx-auto rounded-2xl";

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      setPreview(url);
    } catch (err) {
      setError("Tải ảnh lên thất bại, thử lại nhé.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(preview);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditPopup
      title={title}
      onClose={onClose}
      footer={
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-espresso-800 text-cream-50 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          <Check size={16} /> {saving ? "Đang lưu..." : "Lưu"}
        </button>
      }
    >
      {/* Khung xem trước cố định kích thước, dù link dài đến đâu cũng không giãn ra */}
      <div className={`${frameClass} bg-espresso-900/5 overflow-hidden ring-1 ring-espresso-900/10 flex items-center justify-center mb-4 relative`}>
        {preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-espresso-900/25 text-xs">Chưa có ảnh</span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-espresso-950/40 flex items-center justify-center">
            <Loader2 className="animate-spin text-cream-50" size={22} />
          </div>
        )}
      </div>

      <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-espresso-900/25 text-espresso-700/70 py-2.5 text-sm cursor-pointer mb-3">
        <Upload size={16} /> Tải ảnh từ máy lên
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>

      <p className="text-[11px] text-espresso-700/45 mb-1 text-center">— hoặc dán link ảnh —</p>
      <input
        value={preview}
        onChange={(e) => setPreview(e.target.value)}
        placeholder="https://..."
        className="w-full rounded-xl border border-espresso-900/15 px-3 py-2.5 text-sm truncate"
      />
      {error && <p className="text-xs text-clay-500 mt-2">{error}</p>}
    </EditPopup>
  );
}
