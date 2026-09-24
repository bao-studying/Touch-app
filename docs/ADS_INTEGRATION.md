# Ghi chú: Tích hợp quảng cáo thật (dành cho khi triển khai)

Mô hình kinh doanh của O2O Brand: gói **Free** và **Level 1** hiển thị quảng cáo trên Landing Page công khai
để bù chi phí máy chủ; từ **Level 2** trở đi khách trả phí để loại bỏ quảng cáo. Hiện tại code đã có sẵn chỗ
gắn quảng cáo (placeholder), NHƯNG CHƯA nối mạng quảng cáo thật — tài liệu này ghi lại các bước cần làm khi
bạn sẵn sàng triển khai thật.

## 1. Trạng thái hiện tại trong code

- `backend/config/planLimits.js` → cờ `showsAds` (`true` cho `free`/`level1`, `false` từ `level2`). Đây là
  nguồn xác thực duy nhất — logic phải luôn đọc từ đây, không hardcode lại ở nơi khác.
- API public `GET /api/business/public/:slug` trả về `features.showsAds` để frontend biết có hiện hay không.
- `frontend/src/pages/public/LandingPage.jsx` → có sẵn 1 khối `<div>` placeholder (border nét đứt, chữ "Vị trí
  quảng cáo") hiển thị khi `features.showsAds === true`. **Đây chính là chỗ bạn sẽ thay bằng ad unit thật.**

## 2. Các lựa chọn mạng quảng cáo (chọn 1, hoặc kết hợp)

### A. Google AdSense
- Phù hợp nhất về mặt kỹ thuật (chỉ cần dán 1 đoạn script + 1 thẻ `<ins>`), nhưng **cần xét duyệt**: trang web
  phải có nội dung đủ dày, tuân thủ chính sách nội dung của Google, và có lượng truy cập nhất định trước khi
  được duyệt (chính sách này Google có thể thay đổi theo thời gian — kiểm tra lại yêu cầu mới nhất trước khi
  đăng ký tại https://www.google.com/adsense).
- ⚠️ Rủi ro cần lưu ý: mỗi Landing Page trong O2O Brand là trang hồ sơ 1 doanh nghiệp nhỏ (nội dung khá mỏng —
  chỉ có bio, link, đánh giá). Google AdSense có chính sách chặt về "nội dung mỏng" (thin content). Nên đăng ký
  AdSense trên 1 domain/tài khoản gốc của O2O Brand (không phải domain riêng của từng khách hàng), và cân nhắc
  thêm nội dung giá trị (bài viết, hướng dẫn...) ở trang chủ O2O Brand để tăng khả năng được duyệt.
- Tích hợp kỹ thuật: đăng ký tài khoản → được cấp `data-ad-client` (dạng `ca-pub-xxxxxxxx`) → tạo 1 "ad unit"
  → dán script `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=..." />`
  1 lần trong `index.html`, rồi thay khối placeholder trong `LandingPage.jsx` bằng thẻ `<ins class="adsbygoogle">`
  tương ứng.

### B. Mạng quảng cáo trong nước (Admicro - VCCorp, Adtima - VNG, CocCoc Ads...)
- Cơ chế xét duyệt tương tự AdSense (đăng ký site, chờ duyệt), nhưng thường thân thiện hơn với site tiếng Việt,
  traffic nhỏ. Liên hệ trực tiếp đội sales của từng mạng để biết yêu cầu & mức chia doanh thu hiện tại (các
  con số này thay đổi thường xuyên, không nên tin theo thông tin cũ).

### C. Bán banner trực tiếp (không qua mạng quảng cáo) — dễ bắt đầu nhất
- Không cần xét duyệt, không cần đạt ngưỡng traffic. O2O Brand tự tìm nhà tài trợ phù hợp (nhà rang xay cà phê,
  nhà cung cấp thiết bị quán...) và tự chèn 1 ảnh banner + link tài trợ vào đúng vị trí placeholder.
- Về mặt code: chỉ cần 1 bảng `Sponsor` đơn giản (ảnh + link + hạn hiển thị) ở backend, frontend fetch và hiện
  ra đúng chỗ `showsAds`. Đây là cách nhanh nhất để có doanh thu sớm trong lúc traffic còn thấp, chưa đủ điều
  kiện được các mạng lớn duyệt.

## 3. Gợi ý lộ trình

1. Giai đoạn đầu (traffic thấp): dùng phương án **C** (bán banner trực tiếp) để có doanh thu ngay, không phụ
   thuộc xét duyệt.
2. Khi đã có traffic ổn định trên nhiều Landing Page: nộp đơn **AdSense** hoặc mạng trong nước, chạy song song
   với banner trực tiếp nếu cần.
3. Luôn giữ nguyên tắc: logic ẩn/hiện quảng cáo bám theo `showsAds` trong `planLimits.js` — không tách rời khỏi
   hệ thống gói, để khi có khách nâng cấp lên Level 2, quảng cáo biến mất ngay lập tức mà không cần sửa code.

## 4. Việc CẦN làm khi bắt tay triển khai thật

- [ ] Chọn phương án (A/B/C ở trên) và đăng ký tài khoản nếu cần
- [ ] Xin/ghi lại mã nhúng (publisher ID, ad unit ID, hoặc dữ liệu sponsor)
- [ ] Thay khối placeholder trong `frontend/src/pages/public/LandingPage.jsx` (tìm comment `Vị trí quảng cáo`)
      bằng ad unit thật
- [ ] Kiểm tra lại chính sách nội dung/traffic mới nhất của mạng đã chọn trước khi đăng ký (chính sách hay đổi)
- [ ] Thêm khai báo quảng cáo vào Điều khoản dịch vụ / Chính sách quyền riêng tư nếu mạng yêu cầu (đa số các
      mạng lớn đều yêu cầu site có Privacy Policy nhắc tới việc dùng cookie quảng cáo)
