import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, Star, ScanLine, AlertTriangle, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useBusiness } from "../../context/BusinessContext";

export default function Home() {
  const { admin } = useAuth();
  const { business } = useBusiness();
  const [reviews, setReviews] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!business) return;
    const [reviewsRes, leadsRes, tagsRes] = await Promise.all([
      api.get(`/reviews/business/${business._id}`),
      api.get(`/leads/business/${business._id}`),
      api.get(`/nfc/business/${business._id}`),
    ]);
    setReviews(reviewsRes.data);
    setLeads(leadsRes.data);
    setTags(tagsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  const internalFeedback = reviews.filter((r) => r.channel === "internal");
  const newFeedback = internalFeedback.filter((r) => r.status === "new");
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const totalScans = tags.reduce((s, t) => s + (t.scanCount || 0), 0);

  const chartData = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((d) => {
      const dayKey = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      const count = leads.filter((l) => new Date(l.createdAt).toDateString() === d.toDateString()).length;
      return { day: dayKey, "Thành viên mới": count };
    });
  }, [leads]);

  const resolveFeedback = async (id) => {
    await api.put(`/reviews/${id}/status`, { status: "resolved" });
    loadData();
  };

  if (loading) return <div className="p-6 text-espresso-700 text-sm">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 md:px-8 md:py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-espresso-950">Tổng quan</h1>
          <p className="text-sm text-espresso-700/60">{business?.name}</p>
        </div>
        {/* Avatar tài khoản — chỉ hiện trên mobile (desktop đã có mục trong sidebar) */}
        <Link
          to="/admin/account"
          className="md:hidden w-10 h-10 rounded-full bg-espresso-800 text-cream-50 flex items-center justify-center text-sm font-medium shrink-0"
          aria-label="Cài đặt tài khoản"
        >
          {admin?.name?.charAt(0)?.toUpperCase() || "?"}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={ScanLine} label="Tổng lượt quét" value={totalScans} />
        <StatCard icon={Users} label="Khách thân thiết" value={leads.length} />
        <StatCard icon={Star} label="Đánh giá TB" value={avgRating} />
        <StatCard icon={AlertTriangle} label="Góp ý cần xử lý" value={newFeedback.length} accent={newFeedback.length > 0} />
      </div>

      {newFeedback.length > 0 && (
        <div className="rounded-2xl bg-clay-500/10 ring-1 ring-clay-500/25 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-clay-500 mb-3">
            <AlertTriangle size={16} /> Đánh giá 1-3 sao mới — cần phản hồi khách
          </p>
          <div className="space-y-2">
            {newFeedback.slice(0, 5).map((r) => (
              <div key={r._id} className="bg-white rounded-xl px-3 py-2.5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-espresso-900">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </p>
                  <p className="text-xs text-espresso-700/70 mt-0.5">{r.feedbackText || "(không có nội dung)"}</p>
                </div>
                <button onClick={() => resolveFeedback(r._id)} className="shrink-0 text-sage-500 p-1" aria-label="Đánh dấu đã xử lý">
                  <CheckCircle2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white ring-1 ring-espresso-900/5 p-4 shadow-sm">
        <p className="text-sm font-medium text-espresso-900 mb-3">Thành viên đăng ký mới (7 ngày)</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A2E1F14" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#4A2E1F99" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#4A2E1F99" }} axisLine={false} tickLine={false} width={24} />
              <Tooltip />
              <Line type="monotone" dataKey="Thành viên mới" stroke="#B8562F" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm ring-1 ${accent ? "bg-clay-500/10 ring-clay-500/20" : "bg-white ring-espresso-900/5"}`}>
      <Icon size={18} className={accent ? "text-clay-500" : "text-espresso-800"} />
      <p className="text-2xl font-display mt-2 text-espresso-950">{value}</p>
      <p className="text-[11px] text-espresso-700/60">{label}</p>
    </div>
  );
}
