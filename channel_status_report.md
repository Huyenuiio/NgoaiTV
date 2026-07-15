# Báo Cáo Tình Trạng Kênh IPTV - Dự Án ElderTV (Đã Dọn Kênh Chết & Thử Lại Robust)

Báo cáo này được cập nhật sau khi chạy kiểm thử toàn diện danh sách kênh từ IP thực tế tại Việt Nam vào lúc **01:30, ngày 16/07/2026** (kèm theo cơ chế tự động thử lại 3 lần trên mỗi luồng để tránh lỗi mạng ảo).

---

## 📊 Tóm Tắt Chung

| Chỉ Số | Số Lượng | Trạng Thái |
| :--- | :---: | :--- |
| **Tổng số kênh quét (gồm cả kênh custom)** | **76** | Danh sách đầu vào từ dữ liệu gốc + 7 kênh custom |
| **Kênh hoạt động tốt thực tế** | **30** | Đã ghi nhận vào [channels-verified.json](file:///D:/huyenTV/ElderTV/channels-verified.json) |
| **Kênh lỗi/đã chết** | **46** | Đã tự động loại bỏ khỏi danh sách |

---

## 🟢 Danh Sách Kênh Sống & Hoạt Động Tốt (30 Kênh)

Đây là các kênh đã vượt qua tối thiểu 3 lần thử lại và kết nối thành công 100% tại Việt Nam:

### 1. Nhóm Kênh VTV
* **VTV1** (3 luồng hoạt động tốt)
* **VTV4** (3 luồng hoạt động tốt)
* **VTV5** (3 luồng hoạt động tốt)
* **VTV5 TÂY NAM BỘ** (1 luồng hoạt động tốt - **đã cứu**)
* **VTV5 TÂY NGUYÊN** (1 luồng hoạt động tốt)
* **VTV10** (1 luồng hoạt động tốt)

### 2. Nhóm Kênh HTV & THVL
* **HTV9** (1 luồng hoạt động tốt)
* **HTV KEY** (1 luồng hoạt động tốt)
* **HTV SPORTS** (1 luồng hoạt động tốt)
* **THVL1** (1 luồng hoạt động tốt)
* **THVL2** (2 luồng hoạt động tốt)

### 3. Nhóm Kênh Địa Phương & Kênh Khác
* **AN NINH TV** (2 luồng hoạt động tốt)
* **CAN THO TV** (1 luồng hoạt động tốt)
* **DONG NAI TV1** (1 luồng hoạt động tốt)
* **DONG NAI TV2** (1 luồng hoạt động tốt)
* **HANOITV1** (2 luồng hoạt động tốt)
* **SCTV2** (1 luồng hoạt động tốt - đã khôi phục)
* **SCTV6** (1 luồng hoạt động tốt - **đã cứu**)
* **THUA THIEN HUE TV** (1 luồng hoạt động tốt)
* **UNIQUELY THAI** (1 luồng hoạt động tốt)
* **VIETNAM TODAY** (2 luồng hoạt động tốt)
* **LTV1** (1 luồng hoạt động tốt - **đã cứu**)
* **KTV** (1 luồng hoạt động tốt - **đã cứu**)
* **AXN** (1 luồng hoạt động tốt)
* **STV** (1 luồng hoạt động tốt - **đã cứu**)
* **PTV** (1 luồng hoạt động tốt - **đã cứu**)
* **QTV1** (1 luồng hoạt động tốt - **đã cứu**)
* **KTV1** (2 luồng hoạt động tốt - **đã cứu**)
* **CTV** (2 luồng hoạt động tốt - **đã cứu**)
* **CRTV** (1 luồng hoạt động tốt - **đã cứu**)
* **ĐỒNG THÁP TV2** (1 luồng hoạt động tốt - **đã cứu**)
* **TAY NINH TV** (1 luồng hoạt động tốt - **đã cứu**)
* **TIEN GIANG TV** (1 luồng hoạt động tốt - **đã cứu**)
* **THAI NGUYEN TV** (1 luồng hoạt động tốt - **đã cứu**)
* **TEA TV** (1 luồng hoạt động tốt)

---

## 🔴 Các Kênh Custom/Legacy Đã Xác Nhận Chết & Loại Bỏ (6 Kênh)

Các kênh tự thêm thủ công này đều bị lỗi kết nối hoặc luồng phát đã hết hạn/ngừng hoạt động:

1. **SCTV10** (Đã chết - luồng phát vtvprime bị lỗi)
2. **SCTV16** (Đã chết - luồng phát vtvprime bị lỗi)
3. **SCTV7** (Đã chết - luồng phát vtvprime bị lỗi)
4. **SCTV8** (Đã chết - luồng phát vtvprime bị lỗi)
5. **SCTV PHIM TONG HOP** (Đã chết - luồng phát vtvprime bị lỗi)
6. **CINEMAWORLD** (Đã chết - luồng phát bị sập)
