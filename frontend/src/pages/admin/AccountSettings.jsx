import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Store,
  CreditCard,
  History,
  MapPin,
  HelpCircle,
  Info,
  LogOut,
  Copy,
  Check,
  Plus,
  X,
  RefreshCw,
  Phone,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useBusiness } from "../../context/BusinessContext";
import { getPlanLimits, PLAN_LABELS } from "../../utils/planLimits";

const APP_VERSION = "1.1.0";

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-espresso-900/5 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-espresso-800" />
        <h2 className="text-sm font-semibold text-espresso-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function AccountSettings() {
  const { admin, logout } = useAuth();
  const { business, updateBusinessLocal } = useBusiness();
  const navigate = useNavigate();

  const [name, setName] = useState(admin?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [newBranch, setNewBranch] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");

  useEffect(() => {
    if (!business) return;
    api.get(`/business/${business._id}/history`).then((res) => setHistory(res.data)).catch(() => {});
  }, [business]);

  if (!business) return null;
  const limits = getPlanLimits(business.plan);
  const publicUrl = `${window.location.origin}/p/${business.slug}`;

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      await api.put("/auth/me", { name });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg("");
    try {
      await api.put("/auth/me/password", pw);
      setPw({ currentPassword: "", newPassword: "" });
      setPwMsg("✓ Đã đổi mật khẩu thành công");
    } catch (err) {
      setPwMsg(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setPwSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleAddBranch = async () => {
    if (!newBranch.trim()) return;
    const res = await api.put(`/business/${business._id}`, { branches: [...business.branches, newBranch.trim()] });
    updateBusinessLocal(res.data);
    setNewBranch("");
  };

  const handleRemoveBranch = async (branch) => {
    const res = await api.put(`/business/${business._id}`, { branches: business.branches.filter((b) => b !== branch) });
    updateBusinessLocal(res.data);
  };

  const handleCheckUpdate = async () => {
    setUpdateMsg("Đang kiểm tra...");
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          setUpdateMsg("Đã kiểm tra — bạn đang dùng bản mới nhất.");
        } else {
          setUpdateMsg("Chưa cài đặt như PWA nên không có bản cập nhật nền để kiểm tra.");
        }
      } else {
        setUpdateMsg("Trình duyệt này không hỗ trợ kiểm tra cập nhật nền.");
      }
    } catch {
      setUpdateMsg("Không kiểm tra được lúc này, thử lại sau.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 md:px-8 md:py-8 space-y-4">
      <h1 className="font-display text-2xl text-espresso-950">Cài đặt tài khoản</h1>

      <Section icon={User} title="Thông tin cá nhân">
        <div className="space-y-2">
          <label className="text-xs text-espresso-700/60">Họ tên</label>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 rounded-xl border border-espresso-900/15 px-3 py-2 text-sm" />
            <button onClick={handleSaveName} disabled={savingName} className="rounded-xl bg-espresso-800 text-cream-50 px-3 text-sm disabled:opacity-60">
              Lưu
            </button>
          </div>
          <p className="text-xs text-espresso-700/50">{admin?.email}</p>
        </div>
      </Section>

      <Section icon={Lock} title="Đổi mật khẩu">
        <form onSubmit={handleChangePassword} className="space-y-2">
          <input
            type="password"
            required
            placeholder="Mật khẩu hiện tại"
            value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
            className="w-full rounded-xl border border-espresso-900/15 px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
            value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            className="w-full rounded-xl border border-espresso-900/15 px-3 py-2 text-sm"
          />
          {pwMsg && <p className="text-xs text-espresso-700/70">{pwMsg}</p>}
          <button type="submit" disabled={pwSaving} className="w-full rounded-xl bg-espresso-800 text-cream-50 py-2 text-sm font-medium disabled:opacity-60">
            {pwSaving ? "Đang lưu..." : "Đổi mật khẩu"}
          </button>
        </form>
      </Section>

      <Section icon={Store} title="Thông tin doanh nghiệp">
        <p className="text-sm text-espresso-900 font-medium mb-1">{business.name}</p>
        <div className="flex items-center gap-2 bg-espresso-900/5 rounded-lg px-3 py-2">
          <p className="text-xs text-espresso-700/70 truncate flex-1">{publicUrl}</p>
          <button onClick={handleCopyLink} className="shrink-0 text-espresso-800">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </Section>

      <Section icon={CreditCard} title="Gói dịch vụ hiện tại">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-espresso-900">{PLAN_LABELS[business.plan]}</p>
            <p className="text-xs text-espresso-700/60">
              {business.planExpiresAt ? `Hết hạn: ${new Date(business.planExpiresAt).toLocaleDateString("vi-VN")}` : "Không giới hạn thời gian"}
            </p>
          </div>
          <button onClick={() => navigate("/admin/store")} className="text-sm text-espresso-800 font-medium underline">
            Quản lý gói
          </button>
        </div>
      </Section>

      <Section icon={History} title="Lịch sử nâng cấp">
        {history.length === 0 ? (
          <p className="text-xs text-espresso-700/50">Chưa có lịch sử thay đổi gói.</p>
        ) : (
          <div className="space-y-1.5">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-espresso-900 font-medium">{PLAN_LABELS[h.plan]}</span>
                <span className="text-espresso-700/50">{new Date(h.changedAt).toLocaleString("vi-VN")}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {limits.hasMultiBranch && (
        <Section icon={MapPin} title="Quản lý chi nhánh">
          <div className="space-y-2 mb-2">
            {business.branches.map((b) => (
              <div key={b} className="flex items-center justify-between bg-espresso-900/5 rounded-lg px-3 py-1.5">
                <span className="text-sm text-espresso-900">{b}</span>
                <button onClick={() => handleRemoveBranch(b)} className="text-clay-500">
                  <X size={14} />
                </button>
              </div>
            ))}
            {business.branches.length === 0 && <p className="text-xs text-espresso-700/50">Chưa có chi nhánh nào.</p>}
          </div>
          <div className="flex gap-2">
            <input
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              placeholder="Tên chi nhánh mới"
              className="flex-1 rounded-lg border border-espresso-900/15 px-3 py-1.5 text-sm"
            />
            <button onClick={handleAddBranch} className="rounded-lg bg-espresso-800 text-cream-50 px-3">
              <Plus size={15} />
            </button>
          </div>
        </Section>
      )}

      <Section icon={HelpCircle} title="Trung tâm Trợ giúp">
        <ul className="text-xs text-espresso-700/70 space-y-2 list-disc pl-4 mb-3">
          <li>Chạm mặt sau điện thoại (có NFC) vào vị trí chip trên mô hình decor, giữ 1-2 giây.</li>
          <li>Không có NFC? Dùng camera quét mã QR dán kèm trên mô hình.</li>
          <li>Đặt mô hình decor ở nơi khách dễ thấy, dễ với tay tới — quầy thu ngân hoặc đầu bàn là vị trí tốt.</li>
        </ul>
        {business.hotline && (
          <a href={`tel:${business.hotline}`} className="flex items-center gap-2 text-sm text-espresso-800">
            <Phone size={14} /> Hotline hỗ trợ: {business.hotline}
          </a>
        )}
      </Section>

      <Section icon={Info} title="Phiên bản ứng dụng">
        <div className="flex items-center justify-between">
          <p className="text-sm text-espresso-700/70">O2O Brand v{APP_VERSION}</p>
          <button onClick={handleCheckUpdate} className="flex items-center gap-1.5 text-sm text-espresso-800 font-medium">
            <RefreshCw size={14} /> Kiểm tra cập nhật
          </button>
        </div>
        {updateMsg && <p className="text-xs text-espresso-700/50 mt-2">{updateMsg}</p>}
      </Section>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-xl bg-clay-500/10 text-clay-500 py-3 text-sm font-medium">
        <LogOut size={16} /> Đăng xuất
      </button>
    </div>
  );
}
