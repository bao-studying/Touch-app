# O2O Brand Promotion & Customer Capture — MERN Stack

Hệ thống O2O (Online-to-Offline) tích hợp NFC/QR: khách chạm/quét vật phẩm decor (gắn chip NTAG213)
để mở Landing Page thương hiệu, đánh giá thông minh (Smart Review), theo dõi mạng xã hội, và đăng ký
thành viên thân thiết. Chủ doanh nghiệp quản lý mọi thứ qua Admin Dashboard (mobile + desktop).

Stack: **M**ongoDB + **E**xpress + **R**eact (Vite) + **N**ode.js, Tailwind CSS, JWT Auth, Web NFC API.

## Cấu trúc thư mục

```
o2o-mern-app/
├── backend/          # Express API + MongoDB (Mongoose)
│   ├── config/        # kết nối DB
│   ├── models/        # Business, Admin, Link, Review, Lead, NfcTag
│   ├── controllers/    # logic xử lý request
│   ├── routes/         # định nghĩa API endpoint
│   ├── middleware/     # xác thực JWT
│   └── server.js
└── frontend/          # React (Vite) + Tailwind
    └── src/
        ├── pages/public   # Landing Page khách hàng (/p/:slug)
        ├── pages/admin    # Dashboard quản trị
        ├── pages/auth     # Đăng nhập / Đăng ký
        └── components/    # Component tái sử dụng
```

## Cài đặt & chạy thử

### 1. Backend
```bash
cd backend
cp .env.example .env      # điền MONGO_URI, JWT_SECRET của bạn
npm install
npm run dev                # chạy ở http://localhost:5000
```

Bạn cần một MongoDB (local hoặc [MongoDB Atlas](https://www.mongodb.com/atlas) — free tier là đủ để test).

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                # chạy ở http://localhost:5173
```

Frontend gọi API qua biến `VITE_API_URL` (mặc định `http://localhost:5000/api`), có thể chỉnh trong `frontend/.env`.

## Luồng sử dụng chính

1. **Đăng ký chủ doanh nghiệp** → tạo hồ sơ `Business` (logo, bio, link mạng xã hội, link Google Maps/Shopee).
2. **Setup Tab (Admin)** → chỉnh sửa trực tiếp (live edit) Cover/Avatar/Bio/Social Links, chọn hiệu ứng
   Animation cho từng link (Đứng yên / Marquee / Orbit).
3. **Kích hoạt chip NFC** → nút FAB (mobile) hoặc Guided Workflow (desktop): nhập UID → chọn chi nhánh →
   chạm điện thoại (Web NFC API) để ghi URL `/p/{slug}` vào chip và khóa chip.
4. **Khách chạm/quét chip** → mở Landing Page → đánh giá sao (4-5⭐ redirect Google Maps/Shopee, 1-3⭐
   gửi góp ý nội bộ) → xem Social Links (có hiệu ứng động) → đăng ký Khách hàng thân thiết (Loyalty).
5. **CRM (Admin)** → xem danh sách khách hàng đã đăng ký, danh sách góp ý nội bộ 1-3⭐, xuất file CSV.

## Lộ trình đưa lên App Store / CH Play

Dự án hiện tại là **PWA (Progressive Web App)** — đã cấu hình `vite-plugin-pwa` (service worker + manifest), nên
người dùng Android có thể "Thêm vào Màn hình chính" ngay từ Chrome mà không cần cửa hàng ứng dụng. Đây là bước
nền tảng bắt buộc trước khi đóng gói app thật.

Để **thật sự lên được App Store (iOS) và CH Play (Android)**, bước tiếp theo (chưa nằm trong lần build này vì
cần Android Studio/Xcode mà môi trường hiện tại không có) là bọc frontend bằng **Capacitor**:

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "O2O Brand" "com.yourcompany.o2obrand"
npm run build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android   # mở bằng Android Studio để build file .aab nộp CH Play
npx cap open ios       # mở bằng Xcode (cần máy Mac) để build nộp App Store
```

Vì Web NFC API chỉ chạy trong WebView Android (không chạy trên iOS WebView), bản build iOS sẽ cần thêm plugin
Capacitor NFC riêng (`@capacitor-community/nfc`) nếu muốn kích hoạt chip ngay trong app thay vì qua trình duyệt.
Hỏi tôi bất cứ lúc nào nếu bạn muốn tôi hỗ trợ bước đóng gói Capacitor này.

## Cập nhật vòng 2 — Nâng cấp gói, Cài đặt tài khoản, Setup kiểu Facebook

- **Khóa/mở tính năng theo gói (thực thi ở BACKEND, không chỉ giao diện)**: xem `backend/config/planLimits.js`
  (ma trận tính năng) và `backend/utils/planGate.js` (tự hạ về Free khi hết hạn — dữ liệu cũ vẫn giữ nguyên,
  chỉ khóa việc tạo mới/xuất file). Free giới hạn 2 Social Links, animation chỉ Đứng yên/Nảy nhẹ; Level 1 mở
  Loyalty + CRM/Export; Level 2 mở Smart Review + Marquee/Orbit; Level 3 mở đa chi nhánh.
- **Đổi gói & Lịch sử nâng cấp**: `PUT /api/business/:id/plan` (đặt hạn 30 ngày, ghi lịch sử) và
  `GET /api/business/:id/history`. Đây vẫn là đổi gói trực tiếp (demo) — thanh toán SePay sẽ nối vào bước
  "Chọn gói này" ở Store trong vòng sau.
- **Cài đặt tài khoản** (`/admin/account`): thông tin cá nhân, đổi mật khẩu, thông tin doanh nghiệp, gói hiện
  tại + lịch sử, quản lý chi nhánh (Level 3), Trung tâm Trợ giúp, phiên bản app + kiểm tra cập nhật (PWA thật).
  Trên mobile, vào từ avatar góc trên phải trang Home; trên desktop, từ sidebar.
- **Setup Tab kiểu Facebook**: `Setup.jsx` giờ render thẳng `LandingPage` thật với các nút "✎ Edit" nổi trên
  từng khối (Cover, Logo, Bio, Social Links, Smart Review, Membership Widget, Theme) — bấm vào mở popup chỉnh
  đúng phần đó, áp dụng cho cả mobile lẫn desktop (đã bỏ layout split-screen cũ).
- **Upload ảnh từ máy**: `POST /api/uploads` (multer, lưu `backend/uploads/`, phục vụ qua `/uploads/...`).
  ⚠️ Chỉ phù hợp demo/local — nếu deploy lên hosting có ổ đĩa tạm (Render, Heroku...) ảnh sẽ mất khi restart,
  cần chuyển sang Cloudinary/S3 trước khi launch thật. Khung xem trước ảnh (Logo/Cover/Mascot) cố định kích
  thước, không phụ thuộc link dài ngắn.
- **Social Links**: tự nhận diện nền tảng từ URL dán vào (`utils/detectPlatform.js`), dùng icon thương hiệu
  thật (Simple Icons qua `react-icons`) thay vì icon chung chung, có nút Lưu rõ ràng.
- **Branding & Theme**: chọn màu chủ đạo + kiểu nút bấm — CHỈ áp dụng Landing Page công khai, Admin Dashboard
  giữ tông nâu cố định.
- **Mã QR thay thế NFC**: trong màn Kích hoạt, ngoài "Chạm để kích hoạt (NFC)" có thêm "Tạo mã QR" — hữu ích
  khi demo/chưa có chip vật lý, vẫn gắn cùng UID nên lượt quét được đếm như chip thật.
- **Đánh giá đi thẳng vào khung "Viết đánh giá" Google Maps**: thêm trường Google Place ID trong popup Đánh
  giá thông minh — có Place ID thì dùng `search.google.com/local/writereview?placeid=...`, chưa có thì fallback
  về link Maps thường.

## Cập nhật vòng 3 — SePay, popup chi tiết chip, font thương hiệu, quảng cáo, UI polish

- **Thanh toán nâng cấp gói qua SePay** (`backend/controllers/paymentController.js`,
  `frontend/src/components/admin/PaymentModal.jsx`): tạo đơn (15 phút), hiện mã VietQR + thông tin chuyển khoản
  (có nút Copy từng dòng), poll trạng thái mỗi 3 giây, tự đánh dấu hết hạn nếu quá giờ. Có nút **"Giả lập thanh
  toán thành công"** ngay trong modal để bạn test luồng UI khi chưa nối SePay thật.
  - Cấu hình trong `backend/.env`: `SEPAY_BANK_ID`, `SEPAY_ACCOUNT_NO`, `SEPAY_ACCOUNT_NAME` (thông tin tài
    khoản nhận tiền — dùng để hiện trong modal VÀ tạo QR qua `img.vietqr.io`, không cần API key vì đây là dịch
    vụ tạo ảnh QR công khai theo chuẩn VietQR).
  - Để nhận webhook thật từ SePay khi test local: chạy `ngrok http 5000`, lấy URL public Ngrok cấp, khai báo
    `https://<ngrok-url>/api/payments/webhook/sepay` làm Webhook URL trong dashboard SePay. Có thể đặt thêm
    `SEPAY_WEBHOOK_TOKEN` trong `.env` và cấu hình cùng giá trị bên SePay để xác thực webhook 2 chiều.
  - Nội dung chuyển khoản tự sinh theo format `O2O<mã doanh nghiệp><TÊN GÓI><mã ngẫu nhiên>`, dùng để đối soát
    khi webhook gọi về — xem `generateOrderCode()` trong `paymentController.js`.
- **Popup chi tiết chip/QR**: bấm vào 1 dòng trong trang Kích hoạt NFC để xem loại vật phẩm, UID, chi nhánh,
  ngày tạo/kích hoạt, tổng lượt quét, URL đích (copy nhanh), và **ghi chú vị trí đặt** (tự do, không giới hạn
  enum). Nếu kích hoạt bằng QR thì hiện lại ảnh QR để tải lại; nếu là chip NFC thật thì có nút đánh dấu "đã ghi
  lại chip" (phòng khi chip hỏng cần thay).
- **FAB mobile** giờ điều hướng sang trang quản lý chip (`/admin/nfc`) thay vì mở thẳng modal kích hoạt.
- **Chọn kiểu chữ thương hiệu** (Level 1+): Fraunces / Poppins / Quicksand, gộp trong popup "Tên & Giới thiệu".
  Ảnh Cover/Logo/Mascot gộp chung 1 popup "Ảnh thương hiệu" (trước đây tách rời, gây khó tìm nút sửa Avatar).
- **Quảng cáo (đặt nền cho sau này)**: gói Free & Level 1 hiện có 1 khối placeholder "Vị trí quảng cáo" trên
  Landing Page — CHƯA nối mạng quảng cáo thật. Xem hướng dẫn chi tiết khi triển khai tại
  [`docs/ADS_INTEGRATION.md`](./docs/ADS_INTEGRATION.md).
- **UI polish**: linh vật hạt cà phê minh họa SVG gốc (`components/common/MascotIllustration.jsx`) thay thế
  emoji ☕ ở màn kích hoạt NFC và các empty-state; popup có hiệu ứng mượt khi mở/đóng; khung tải dữ liệu dùng
  skeleton thay vì chữ "Đang tải..." trơn; màu Theme giờ luôn thấy rõ ngay (thanh kéo + viền avatar trong thẻ
  Membership Widget của Setup Tab dùng màu thương hiệu).

## Cập nhật vòng 4 — UI/UX polish, Góp ý riêng, thanh toán SePay thật, bảng màu chi tiết

- **Thanh toán SePay đã kết nối thật (không còn là demo)**: người dùng đã tự cấu hình SePay + ngrok và xác
  nhận quét mã hoạt động trơn tru. `PaymentModal.jsx` giờ **ẩn nút "Giả lập thanh toán"** bất cứ khi nào đơn
  hàng đã có mã QR thật (`order.qrUrl`) — thay bằng dòng xác nhận hệ thống tự đối soát qua webhook SePay.
  Nút giả lập chỉ còn xuất hiện làm phương án dự phòng khi môi trường CHƯA cấu hình `SEPAY_BANK_ID` (dev/test
  local). Logic BE tại `backend/controllers/paymentController.js` không đổi vì webhook đối soát đã đúng từ
  vòng 3 — chỉ cần đúng Webhook URL trỏ về ngrok/domain thật là chạy được, không cần sửa code.
- **Popup/modal đóng khi bấm ra ngoài + hiệu ứng ẩn mượt**: thêm hook dùng chung
  `frontend/src/hooks/useDismissablePopup.js` — bấm vào lớp nền (backdrop) sẽ đóng popup, có animation
  fade-out/pop-out trước khi biến mất (không còn "biến mất đột ngột"). Áp dụng cho `EditPopup` (dùng chung
  cho hầu hết popup ở Setup Tab + chi tiết chip NFC), `PaymentModal`, `NfcActivationModal` (chặn đóng khi đang
  chạm chip để tránh hủy nhầm thao tác), và `LoyaltyForm` ở Landing Page.
- **Landing Page — hiệu ứng cuộn "chìm nền"**: khi khách lướt lên, khối thông tin đè lên ảnh bìa (đã có từ
  trước), nay ảnh nền còn **chìm nhẹ xuống dưới + phóng to nhẹ (parallax sink)** đồng thời với lớp phủ tối mờ
  dần — xem `pages/public/LandingPage.jsx`.
- **Bảng màu chọn chính xác hơn ở Setup Tab**: `components/common/ColorPicker.jsx` — bảng HSV kéo chọn độ
  bão hòa/độ sáng + thanh trượt Hue + ô nhập mã Hex trực tiếp, không phụ thuộc `input[type=color]` mặc định
  của trình duyệt (vốn hiển thị khác nhau giữa Windows/macOS/Android). Vẫn giữ dải màu gợi ý nhanh bên trên.
  Dùng trong `ThemeEditPopup.jsx`.
- **Cài đặt tài khoản trên mobile — hiệu ứng trượt đè lên trang chủ**: áp dụng pattern "modal route" của
  React Router (`location.state.backgroundLocation`, xem `App.jsx`). Khi bấm avatar trên Home (mobile),
  `AccountSettings` mở dưới dạng panel trượt vào từ phải, đè lên trang chủ đang hiển thị mờ phía sau qua lớp
  backdrop tối — thay vì chuyển hẳn sang trang mới như trước. Bấm ra ngoài hoặc mũi tên quay lại đều có hiệu
  ứng trượt ra trước khi thật sự quay lại Home. Vào thẳng URL `/admin/account` hoặc bấm từ sidebar desktop vẫn
  hiển thị như trang bình thường (không đổi hành vi cũ).
- **Tính năng "Góp ý riêng"** (khách gửi thẳng cho chủ quán, không qua luồng chấm sao, không public):
  - Backend: `POST /api/reviews/public/private` (không cần đăng nhập) — cho phép gửi góp ý không chấm sao
    (`rating` mặc định 0, model `Review.js` đã nới `min` từ 1 xuống 0). Luôn lưu kênh `internal`.
  - Landing Page: nút "Gửi góp ý riêng cho chúng tôi" bên dưới Social Links
    (`components/public/PrivateFeedbackForm.jsx`) — mở popup nhỏ, chấm sao tùy chọn + ô nhập nội dung.
  - Admin: card **"Góp ý hôm nay"** mới trên Home (đếm góp ý nội bộ tạo trong ngày), bấm vào mở trang đầy đủ
    `pages/admin/Feedback.jsx` (`/admin/feedback`) — liệt kê TOÀN BỘ góp ý (cả từ chấm sao 1-3 lẫn "Góp ý
    riêng"), lọc theo trạng thái, tìm theo nội dung, đánh dấu đã xử lý. Có thêm mục "Góp ý khách hàng" trong
    sidebar desktop. Khối "Đánh giá 1-3 sao mới — cần phản hồi khách" trên Home giữ nguyên, chỉ thêm link
    "Xem tất cả" trỏ sang trang Góp ý.
- **Card "Khách hàng thân thiết" trên Home** giờ bấm được → điều hướng sang tab CRM (`/admin/crm`).
- **Card "Đánh giá TB" trên Home** giờ chỉ tính trung bình trên review CÓ chấm sao thật (bỏ qua "Góp ý riêng"
  không sao) và bấm vào sẽ mở địa chỉ Google Maps của doanh nghiệp (`business.googleMapsLink`) ở tab mới —
  nếu doanh nghiệp chưa khai báo link Maps thì card này không bấm được (mờ nhẹ, không có hiệu ứng nhấn).

### Bổ sung thêm trong vòng 4 — Bảo mật & ổn định + UI/UX

- **Helmet**: thêm `helmet` (đã khai báo trong `backend/package.json`, cần `npm install` lại ở backend)
  vào `server.js` — bật các header bảo mật chuẩn (chống MIME sniffing, clickjacking...). Tắt
  `contentSecurityPolicy` (API JSON thuần không cần CSP nhắm tới HTML) và mở
  `crossOriginResourcePolicy: "cross-origin"` để ảnh tĩnh ở `/uploads` vẫn load được khi frontend
  và backend khác domain.
- **Giới hạn kích thước body JSON**: `express.json({ limit: "1mb" })` — chặn request payload khổng lồ.
- **Validate & giới hạn độ dài input** cho các endpoint dễ bị lợi dụng nhất (không cần đăng nhập):
  - `authController.js`: validate định dạng email, độ dài tên (≥2 ký tự, ≤80), độ dài mật khẩu
    (6-72 ký tự — bcrypt chỉ dùng 72 byte đầu nên dài hơn không có ý nghĩa bảo mật thêm).
  - `reviewController.js` (`submitReview`, `submitPrivateFeedback`): cap `feedbackText` tối đa 1000
    ký tự, `branch` tối đa 100 ký tự, validate `businessId` đúng định dạng ObjectId (chặn kiểu tấn
    công NoSQL injection gửi object thay vì chuỗi ID để bỏ qua điều kiện query).
  - `leadController.js` (`submitLead`): cap độ dài `name`/`phone`/`email`/`zalo`/`branch`, validate
    định dạng email nếu có nhập, validate `businessId`.
  - Thêm tiện ích dùng chung `backend/utils/sanitize.js` (`capString`, `isValidEmail`, `isPlainIdString`).
  - *(Token xác thực webhook SePay `SEPAY_WEBHOOK_TOKEN` người dùng đã tự cấu hình sẵn, không cần
    sửa gì thêm ở phần này.)*
- **Toast thông báo dùng chung** (`context/ToastContext.jsx`, bọc quanh toàn app trong `App.jsx`):
  mọi hành động lưu/xóa/cập nhật quan trọng giờ có phản hồi rõ ràng thành công hay thất bại (Setup
  Tab, liên kết mạng xã hội, xử lý góp ý ở Home lẫn trang Góp ý, cập nhật tên/chi nhánh ở Cài đặt
  tài khoản) thay vì chỉ lặng lẽ đóng popup như trước. Lưu thất bại sẽ báo lỗi và GIỮ NGUYÊN popup
  đang mở (không mất dữ liệu người dùng vừa nhập).
- **Bảng màu hỗ trợ bàn phím**: `ColorPicker.jsx` giờ có `role="slider"` + điều khiển bằng phím mũi
  tên (giữ Shift để bước nhảy lớn hơn) cho cả ô bão hòa/độ sáng và thanh trượt Hue — không còn phụ
  thuộc hoàn toàn vào chuột/chạm.
- **Empty state đẹp hơn**: trang CRM và trang Góp ý giờ có icon + câu gợi ý rõ ràng khi chưa có dữ
  liệu, thay vì một dòng chữ xám đơn điệu.

### Bổ sung thêm — Sửa lỗi thanh nav + hiệu ứng chuyển trang + Liquid Glass

- **Sửa lỗi gốc khiến thanh nav dưới "trôi lung tung"/mất khi cuộn**: nguyên nhân là class
  `.edge-accent-top` trong `index.css` bị set cứng `position: relative`, do đứng SAU các utility
  của Tailwind trong file CSS nên (cùng độ đặc hiệu, luật đứng sau thắng) nó ÂM THẦM GHI ĐÈ
  `position: fixed`/`md:fixed` thành `relative` trên cả thanh nav dưới lẫn sidebar desktop — khiến
  nav trôi theo dòng chảy nội dung thay vì dính cố định vào viewport. Đã xóa dòng `position:
  relative` đó (không cần thiết vì `fixed`/`sticky` trên chính phần tử đã tự tạo containing block
  cho `::before` rồi).
- **Hiệu ứng chuyển trang mượt hơn**: `AdminLayout.jsx` bọc `<Outlet/>` trong 1 `div` có
  `key={location.pathname}` + class `animate-page-in` (keyframe mới trong `tailwind.config.js`) —
  mỗi lần đổi tab (Home/Setup/CRM/Store/...), React remount khối này nên animation mờ dần + trượt
  nhẹ lên chạy lại từ đầu, thay vì nội dung mới xuất hiện đột ngột.
- **"Liquid Glass"** (kính mờ trong suốt kiểu Apple iOS 18) — 3 class dùng chung mới trong
  `index.css`: `.glass-panel` (popup/modal có bo góc — viền sáng mảnh + đổ bóng + backdrop-blur),
  `.glass-bar` (thanh dính mép màn hình — chỉ cần điểm sáng mép trên), `.glass-card` (card nổi
  trên nền có texture). Có fallback `@supports` cho trình duyệt cũ không hỗ trợ `backdrop-filter`.
  Áp dụng cho: thanh tab dưới cùng mobile (`AdminLayout.jsx`), toàn bộ popup dùng chung
  (`EditPopup.jsx`), `PaymentModal.jsx`, `NfcActivationModal.jsx`, `LoyaltyForm.jsx`,
  `PrivateFeedbackForm.jsx`, và 4 thẻ số liệu trên trang Home (`StatCard`).

## Ghi chú kỹ thuật quan trọng

- **Web NFC API** chỉ hoạt động trên **Chrome for Android** qua **HTTPS**. Trên iPhone, luồng kích hoạt
  chip hiện chưa khả dụng qua trình duyệt — cần app native/Flutter/React Native riêng cho nhân viên
  kích hoạt sau này (đã ghi chú `TODO` trong `NfcFab.jsx`).
- **Smart Review gating**: luồng "4-5⭐ mới redirect Google Maps" theo đúng yêu cầu trong bản Notion,
  nhưng đây là hành vi **review gating** — vi phạm chính sách của Google/Meta về đánh giá. Trước khi
  đưa ra thị trường thật, nên cân nhắc đổi thành: luôn hiển thị cả 2 lựa chọn (gửi Google Maps/Shopee
  HOẶC gửi góp ý nội bộ) một cách bình đẳng, không phụ thuộc số sao đã chọn.
- Toàn bộ phần Setup UI dùng chung 1 component `PublicLandingPage`/`SocialLinks` cho cả chế độ Preview
  (admin) và Public thật, đảm bảo "What You See Is What You Get".
