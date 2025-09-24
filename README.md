# Giao diện quản trị (Demo)

Dự án này dựng nhanh giao diện giống ảnh yêu cầu: sidebar nhiều module, thanh tab động phía trên, nội dung trung tâm.

## Cấu trúc
```
index.html              // Khung layout chính
assets/css/styles.css   // CSS (giao diện mặc định)
assets/js/app.js        // JS quản lý tab & điều hướng
assets/img/             // Chứa logo, hình ảnh (chưa thêm)
```

## Tính năng chính
- Sidebar thu gọn/mở rộng.
- Nhóm menu con (Mục chung) có thể thu gọn.
- Click menu -> mở tab (không tạo tab trùng, có thể đóng tab).
- Khu vực tab có nút cuộn trái/phải khi quá nhiều.
-- Không có chế độ giao diện chuyển đổi; chỉ dùng giao diện mặc định.
- Nút Home xóa tất cả tab quay về màn hình chào.
- Nút Back quay lại tab trước trong lịch sử hoạt động.

## Thêm trang mới
1. Thêm anchor trong sidebar: `<a data-page="ma_trang">Tên hiển thị</a>`
2. Mở `assets/js/app.js`, trong hàm `renderPage(pageId)` thêm `case 'ma_trang': return card('Tiêu đề','<p>Nội dung</p>');`
3. (Tùy chọn) Viết riêng HTML rồi fetch: `fetch('pages/ma_trang.html').then(r=>r.text()).then(html=>...)`

## Tùy biến giao diện
Sửa các biến CSS trong `:root` ở đầu `styles.css`.

## Ghi chú
Đây là demo tĩnh, chưa có build tool. Có thể tích hợp vào framework (Laravel, React, Vue...) bằng cách tách component.

## Gợi ý tiếp theo
- Thêm icon cho từng menu (FontAwesome / RemixIcon).
- Thêm hệ thống phân quyền hiển thị menu.
- Module hoá nội dung bằng ES Modules.
- Bảng dữ liệu dùng DataTables hoặc AgGrid.
- Form "Tạo đơn xin phép" có validation + gửi AJAX.
