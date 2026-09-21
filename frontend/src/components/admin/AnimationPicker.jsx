const OPTIONS = [
  { value: "stationary", label: "Mặc định", hint: "Icon đứng yên" },
  { value: "marquee", label: "Chạy ngang", hint: "Marquee liên tục" },
  { value: "orbit", label: "Orbit", hint: "Xoay quanh Avatar" },
  { value: "bouncing", label: "Nảy nhẹ", hint: "Bouncing" },
];

const PreviewIcon = ({ value }) => (
  <div className="w-9 h-9 rounded-full bg-espresso-900/5 flex items-center justify-center overflow-hidden shrink-0">
    <span
      className={
        value === "marquee"
          ? "animate-marquee inline-block"
          : value === "orbit"
          ? "animate-orbit inline-block"
          : value === "bouncing"
          ? "animate-bounce-soft inline-block"
          : "inline-block"
      }
      style={value === "orbit" ? { "--orbit-radius": "8px" } : undefined}
    >
      🔗
    </span>
  </div>
);

export default function AnimationPicker({ value, onChange }) {
  return (
    <div>
      <p className="text-xs text-espresso-700/60 mb-2">Hiệu ứng (Animations)</p>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors ${
              value === opt.value
                ? "border-espresso-800 bg-espresso-800/5"
                : "border-espresso-900/10 hover:border-espresso-900/20"
            }`}
          >
            <PreviewIcon value={opt.value} />
            <span>
              <span className="block text-xs font-medium text-espresso-900">{opt.label}</span>
              <span className="block text-[10px] text-espresso-700/50">{opt.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
