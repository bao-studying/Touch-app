import { useEffect, useState } from "react";

// Theo dõi hướng cuộn trang để ẩn/hiện thanh điều hướng kiểu app mobile (YouTube, Instagram...):
// lướt XUỐNG (đọc nội dung) → ẩn đi nhường chỗ hiển thị; lướt LÊN → hiện lại ngay.
// - threshold: số px phải cuộn liên tục theo 1 hướng mới tính là "đổi hướng", tránh rung/giật
//   khi tay chỉ đang giữ màn hình hoặc cuộn rất nhẹ.
// - topOffset: trong phạm vi này tính từ đầu trang, LUÔN hiện thanh điều hướng (kể cả đang cuộn
//   xuống), để không bị ẩn ngay khi người dùng vừa mở trang.
// Trả về `true` khi nên ẩn (translate ra khỏi khung hiển thị), `false` khi nên hiện.
export default function useScrollDirection({ threshold = 8, topOffset = 24 } = {}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      if (y <= topOffset) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(delta) > threshold) {
        setHidden(delta > 0);
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topOffset]);

  return hidden;
}
