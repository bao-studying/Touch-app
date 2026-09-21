import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Wifi,
  Phone,
  Globe,
  ShoppingBag,
  MessageCircle,
  Music2,
} from "lucide-react";

const PLATFORM_ICON = {
  facebook: Facebook,
  tiktok: Music2, // dùng note nhạc thay cho logo TikTok (tránh dùng IP)
  shopee: ShoppingBag,
  zalo: MessageCircle,
  website: Globe,
  wifi: Wifi,
  hotline: Phone,
  instagram: Instagram,
  youtube: Youtube,
  email: Mail,
};

const PLATFORM_LABEL = {
  facebook: "Facebook",
  tiktok: "TikTok",
  shopee: "Shopee",
  zalo: "Zalo",
  website: "Website",
  wifi: "Wifi quán",
  hotline: "Hotline",
  instagram: "Instagram",
  youtube: "YouTube",
  email: "Email",
};

function LinkIcon({ link, size = 22 }) {
  const Icon = PLATFORM_ICON[link.platform] || Globe;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1.5 shrink-0"
      aria-label={link.label || PLATFORM_LABEL[link.platform]}
    >
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm ring-1 ring-espresso-900/10 text-espresso-800">
        <Icon size={size} strokeWidth={1.8} />
      </span>
      <span className="text-[11px] text-espresso-700/80 max-w-[64px] truncate text-center">
        {link.label || PLATFORM_LABEL[link.platform]}
      </span>
    </a>
  );
}

// Hiển thị danh sách link mạng xã hội, mỗi link có hiệu ứng động riêng theo cấu hình admin đã chọn.
export default function SocialLinks({ links, mascotUrl }) {
  if (!links || links.length === 0) return null;

  const stationaryLinks = links.filter((l) => l.animation === "stationary" || !l.animation);
  const marqueeLinks = links.filter((l) => l.animation === "marquee");
  const orbitLinks = links.filter((l) => l.animation === "orbit");
  const bouncingLinks = links.filter((l) => l.animation === "bouncing");

  return (
    <div className="space-y-6">
      {(stationaryLinks.length > 0 || bouncingLinks.length > 0) && (
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-4">
          {stationaryLinks.map((link) => (
            <LinkIcon key={link._id} link={link} />
          ))}
          {bouncingLinks.map((link) => (
            <div key={link._id} className="animate-bounce-soft">
              <LinkIcon link={link} />
            </div>
          ))}
        </div>
      )}

      {marqueeLinks.length > 0 && (
        <div className="relative overflow-hidden no-scrollbar -mx-5">
          <div className="flex w-max gap-8 animate-marquee px-5">
            {[...marqueeLinks, ...marqueeLinks].map((link, i) => (
              <LinkIcon key={`${link._id}-${i}`} link={link} size={20} />
            ))}
          </div>
        </div>
      )}

      {orbitLinks.length > 0 && (
        <div className="relative mx-auto" style={{ width: 180, height: 180 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-cream-100">
              {mascotUrl ? (
                <img src={mascotUrl} alt="Mascot" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">☕</div>
              )}
            </div>
          </div>
          {orbitLinks.map((link, i) => {
            const angleOffset = (360 / orbitLinks.length) * i;
            return (
              <div
                key={link._id}
                className="absolute top-1/2 left-1/2 animate-orbit"
                style={{
                  "--orbit-radius": "72px",
                  animationDelay: `${-(i * (7 / orbitLinks.length)).toFixed(2)}s`,
                  transform: `rotate(${angleOffset}deg) translateX(72px)`,
                }}
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <LinkIcon link={link} size={18} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
