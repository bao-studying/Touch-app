import { useState } from "react";
import { X, Wifi, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import api from "../../api/axios";
import { useBusiness } from "../../context/BusinessContext";

const ITEM_TYPES = ["Gấu bông", "Mô hình 3D", "Thẻ gỗ/Acrylic decor", "Sticker để bàn"];

// Quy trình: 1) Chọn loại vật phẩm -> 2) Nhập UID -> 3) Chọn chi nhánh -> 4) Chạm để kích hoạt & khóa chip.
// Web NFC API (NDEFReader) chỉ chạy trên Chrome for Android qua HTTPS + cần thao tác chạm thật của người dùng.
export default function NfcActivationModal({ onClose }) {
  const { business } = useBusiness();
  const [step, setStep] = useState(1);
  const [itemType, setItemType] = useState(ITEM_TYPES[0]);
  const [uid, setUid] = useState("");
  const [branch, setBranch] = useState(business?.branches?.[0] || "");
  const [scanning, setScanning] = useState(false);
  const [tag, setTag] = useState(null);
  const [error, setError] = useState("");
  const [nfcUnsupported, setNfcUnsupported] = useState(false);
  const [success, setSuccess] = useState(false);

  const targetUrl = `${window.location.origin}/p/${business?.slug}?tag=${uid}`;

  const handleRegisterAndActivate = async () => {
    setError("");
    try {
      // Bước A: đăng ký UID trong hệ thống (server-side)
      const res = await api.post("/nfc", { business: business._id, uid, itemType, branch });
      setTag(res.data);
      setScanning(true);

      // Bước B: ghi thật vào chip qua Web NFC API (chỉ khả dụng trên Chrome Android + HTTPS)
      if ("NDEFReader" in window) {
        try {
          const ndef = new window.NDEFReader();
          await ndef.write({ records: [{ recordType: "url", data: targetUrl }] });
        } catch (nfcErr) {
          setScanning(false);
          setError(
            "Không ghi được vào chip: " + (nfcErr.message || "vui lòng chạm điện thoại vào chip và thử lại.")
          );
          return;
        }
      } else {
        // Fallback khi trình duyệt/thiết bị không hỗ trợ Web NFC (vd: iPhone, hoặc đang test trên desktop)
        setNfcUnsupported(true);
      }

      // Bước C: xác nhận & khóa chip trên server
      await api.put(`/nfc/${res.data._id}/activate`);
      setScanning(false);
      setSuccess(true);
    } catch (err) {
      setScanning(false);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi kích hoạt chip");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-cream-50 p-5 shadow-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-espresso-700/50" aria-label="Đóng">
          <X size={20} />
        </button>

        {!scanning && !success && (
          <>
            <h3 className="font-display text-lg text-espresso-950 mb-4">Kích hoạt chip NFC</h3>

            {step === 1 && (
              <div className="space-y-3">
                <label className="text-xs text-espresso-700/60">Loại vật phẩm decor</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full rounded-xl border border-espresso-900/15 px-3 py-2.5 text-sm"
                >
                  {ITEM_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-1 rounded-xl bg-espresso-800 text-cream-50 py-2.5 text-sm font-medium"
                >
                  Tiếp tục <ChevronRight size={16} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="text-xs text-espresso-700/60">Mã UID của chip (in trên bao bì chip)</label>
                <input
                  required
                  value={uid}
                  onChange={(e) => setUid(e.target.value.trim())}
                  placeholder="VD: GB-0001"
                  className="w-full rounded-xl border border-espresso-900/15 px-3 py-2.5 text-sm"
                />
                <button
                  disabled={!uid}
                  onClick={() => setStep(3)}
                  className="w-full flex items-center justify-center gap-1 rounded-xl bg-espresso-800 text-cream-50 py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  Tiếp tục <ChevronRight size={16} />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <label className="text-xs text-espresso-700/60">Chi nhánh áp dụng</label>
                <input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="VD: Chi nhánh Quận 1 (để trống nếu chỉ có 1 địa điểm)"
                  className="w-full rounded-xl border border-espresso-900/15 px-3 py-2.5 text-sm"
                />
                <div className="rounded-xl bg-espresso-900/5 px-3 py-2 text-xs text-espresso-700/70 break-all">
                  URL sẽ ghi vào chip: <span className="font-medium">{targetUrl}</span>
                </div>
                {error && (
                  <p className="text-xs text-clay-500 flex items-center gap-1">
                    <AlertTriangle size={14} /> {error}
                  </p>
                )}
                <button
                  onClick={handleRegisterAndActivate}
                  className="w-full flex items-center justify-center gap-1 rounded-xl bg-espresso-800 text-cream-50 py-2.5 text-sm font-medium"
                >
                  Chạm để kích hoạt
                </button>
              </div>
            )}
          </>
        )}

        {scanning && (
          <div className="py-8 text-center">
            <div className="relative mx-auto w-28 h-28 mb-4">
              <div className="absolute inset-0 rounded-full bg-sky-400/20 animate-ping" />
              <div className="absolute inset-3 rounded-full bg-sky-400/30 animate-ping [animation-delay:200ms]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-3xl">
                  ☕
                </span>
              </div>
              <Wifi className="absolute -top-1 -right-1 text-sky-500" size={22} />
            </div>
            <p className="text-sm font-medium text-espresso-900">Đưa điện thoại lại gần chip NFC...</p>
            <p className="text-xs text-espresso-700/60 mt-1">Giữ nguyên trong giây lát</p>
          </div>
        )}

        {success && (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto mb-2 text-sage-500" size={36} />
            <p className="font-medium text-espresso-900">Kích hoạt thành công!</p>
            <p className="text-xs text-espresso-700/70 mt-1">Chip đã được khóa, chống ghi đè URL độc hại.</p>
            {nfcUnsupported && (
              <p className="text-xs text-amber-600 mt-3 bg-amber-400/10 rounded-lg px-3 py-2">
                Thiết bị/trình duyệt này chưa hỗ trợ Web NFC (chỉ hỗ trợ Chrome for Android). Bản ghi đã được
                lưu trên hệ thống ở chế độ demo — hãy kích hoạt lại bằng điện thoại Android khi ra sản phẩm thật.
              </p>
            )}
            <button onClick={onClose} className="mt-4 w-full rounded-xl bg-espresso-800 text-cream-50 py-2.5 text-sm font-medium">
              Xong
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
