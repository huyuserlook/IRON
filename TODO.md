# TODO - Hệ thống thông báo Admin

## Backend (BE)

- [x] 1. Tạo `dto/response/NotificationResponse.java`
- [x] 2. Tạo `service/interfaces/NotificationService.java`
- [x] 3. Tạo `service/impl/NotificationServiceImpl.java`
- [x] 4. Tạo `controller/admin/AdminNotificationController.java`
- [x] 5. Thêm truy vấn vào `OrderRepository`
- [x] 6. Thêm truy vấn vào `BookingRepository`
- [x] 7. Thêm truy vấn vào `ContactRepository`
- [x] 8. Thêm truy vấn vào `UserRepository`

## Frontend (FE)

- [x] 9. Tạo `FE/src/api/notificationApi.js`
- [x] 10. Cập nhật `AdminLayout.jsx` - thay logic thông báo chỉ-đánh-giá bằng nguồn thông báo hợp nhất

## Kiểm thử

- [x] 11. Rebuild backend & khởi động lại
- [x] 12. Kiểm tra `/api/admin/notifications` và chuông thông báo admin

## Biểu đồ thống kê

- [x] 13. Tạo `FE/src/components/admin/StatisticChart.jsx` (biểu đồ cột bán hàng)
- [x] 14. Cập nhật `StatisticsPage.jsx` - dùng `StatisticChart` thay biểu đồ inline
