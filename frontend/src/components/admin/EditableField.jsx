import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

// Field chỉnh sửa tại chỗ: hiển thị giá trị hiện tại + icon bút chì, bấm vào để mở ô nhập,
// lưu qua onSave(newValue) (gọi API cập nhật Business trong Setup.jsx).
export default function EditableField({ label, value, onSave, placeholder = "", multiline = false, type = "text" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft(value || "");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3 py-2.5 border-b border-espresso-900/8 last:border-0">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-espresso-700/45">{label}</p>
          <p className="text-sm text-espresso-900 truncate">{value || <span className="text-espresso-700/40">Chưa thiết lập</span>}</p>
        </div>
        <button onClick={startEdit} className="shrink-0 text-espresso-700/50 hover:text-espresso-900 p-1" aria-label={`Sửa ${label}`}>
          <Pencil size={15} />
        </button>
      </div>
    );
  }

  const InputTag = multiline ? "textarea" : "input";

  return (
    <div className="py-2.5 border-b border-espresso-900/8 last:border-0">
      <p className="text-[11px] uppercase tracking-wide text-espresso-700/45 mb-1">{label}</p>
      <div className="flex items-start gap-2">
        <InputTag
          autoFocus
          type={multiline ? undefined : type}
          rows={multiline ? 3 : undefined}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 rounded-lg border border-espresso-900/15 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso-800/30"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 p-1.5 rounded-lg bg-sage-500 text-white disabled:opacity-50"
          aria-label="Lưu"
        >
          <Check size={15} />
        </button>
        <button onClick={() => setEditing(false)} className="shrink-0 p-1.5 rounded-lg bg-espresso-900/10 text-espresso-700" aria-label="Hủy">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
