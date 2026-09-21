import { useState } from "react";
import { Check } from "lucide-react";
import EditPopup from "./EditPopup";

export default function BioEditPopup({ name, bio, onClose, onSave }) {
  const [draftName, setDraftName] = useState(name || "");
  const [draftBio, setDraftBio] = useState(bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ name: draftName, bio: draftBio });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditPopup
      title="Tên & Giới thiệu"
      onClose={onClose}
      footer={
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-espresso-800 text-cream-50 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          <Check size={16} /> {saving ? "Đang lưu..." : "Lưu"}
        </button>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs text-espresso-700/60 mb-1 block">Tên doanh nghiệp</label>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="w-full rounded-xl border border-espresso-900/15 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-espresso-700/60 mb-1 block">Lời chào / Bio</label>
          <textarea
            rows={4}
            maxLength={300}
            value={draftBio}
            onChange={(e) => setDraftBio(e.target.value)}
            className="w-full rounded-xl border border-espresso-900/15 px-3 py-2.5 text-sm"
          />
          <p className="text-[11px] text-espresso-700/40 mt-1 text-right">{draftBio.length}/300</p>
        </div>
      </div>
    </EditPopup>
  );
}
