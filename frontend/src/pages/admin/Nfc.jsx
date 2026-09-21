import { useEffect, useState } from "react";
import { Nfc as NfcIcon, Lock, LockOpen, Plus } from "lucide-react";
import api from "../../api/axios";
import { useBusiness } from "../../context/BusinessContext";
import NfcActivationModal from "../../components/admin/NfcActivationModal";

export default function Nfc() {
  const { business } = useBusiness();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    if (!business) return;
    api
      .get(`/nfc/business/${business._id}`)
      .then((res) => setTags(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [business]);

  const handleClose = () => {
    setModalOpen(false);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 md:px-8 md:py-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-espresso-950">Kích hoạt chip NFC</h1>
          <p className="text-sm text-espresso-700/60">Guided Workflow: chọn vật phẩm → nhập UID → chọn chi nhánh → chạm để ghi & khóa chip.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-espresso-800 text-cream-50 px-3.5 py-2 text-sm font-medium shrink-0">
          <Plus size={16} /> Kích hoạt chip mới
        </button>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-espresso-800 to-espresso-950 text-cream-50 p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-cream-50/10 flex items-center justify-center text-3xl shrink-0">☕</div>
        <div>
          <p className="font-display text-lg">Mô hình linh vật hạt cà phê</p>
          <p className="text-sm text-cream-100/70">Chip NFC/QR đặt kín đáo dưới đế mô hình — khách chạm điện thoại hoặc quét mã để mở trang thương hiệu của bạn.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-espresso-900/5 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center text-sm text-espresso-700/50 py-10">Đang tải...</p>
        ) : tags.length === 0 ? (
          <div className="text-center py-10 px-4">
            <NfcIcon className="mx-auto mb-2 text-espresso-900/20" size={32} />
            <p className="text-sm text-espresso-700/50">Chưa có chip nào được kích hoạt.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-espresso-900/5 text-espresso-700/70 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-medium">UID</th>
                <th className="text-left px-4 py-3 font-medium">Vật phẩm</th>
                <th className="text-left px-4 py-3 font-medium">Chi nhánh</th>
                <th className="text-left px-4 py-3 font-medium">Lượt quét</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag._id} className="border-t border-espresso-900/5">
                  <td className="px-4 py-3 font-mono text-xs text-espresso-900">{tag.uid}</td>
                  <td className="px-4 py-3 text-espresso-700/80">{tag.itemType}</td>
                  <td className="px-4 py-3 text-espresso-700/80">{tag.branch || "—"}</td>
                  <td className="px-4 py-3 text-espresso-700/80">{tag.scanCount}</td>
                  <td className="px-4 py-3">
                    {tag.locked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-sage-400/15 text-sage-500 px-2 py-1 rounded-full">
                        <Lock size={11} /> Đã khóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-amber-400/15 text-amber-600 px-2 py-1 rounded-full">
                        <LockOpen size={11} /> Chưa khóa
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && <NfcActivationModal onClose={handleClose} />}
    </div>
  );
}
