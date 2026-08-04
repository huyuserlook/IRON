# TODO - Tính năng "Thêm xe mới" nhiều ảnh + số lượng tồn kho

## Backend

- [x] 1. `MotorcycleRequest.java`: Thêm `List<String> images` và `List<InventoryItem>` (colorName, colorCode, quantity)
- [x] 2. `MotorcycleImage.java`: Đổi cột `image_url` sang TEXT (chứa base64)
- [x] 3. `Motorcycle.java`: Đổi cột `thumbnail_url` sang TEXT + thêm orphanRemoval vào inventories
- [x] 4. `MotorcycleServiceImpl.java`: Lưu danh sách ảnh (ảnh đầu = ảnh chính / thumbnail) + danh sách tồn kho trong create/update
- [x] 5. `MotorcycleResponse.java`: Thêm `totalInventory` (hiển thị tổng tồn kho)

## Frontend

- [x] 6. `MotorcycleForm.jsx`: Thay ô URL đơn bằng uploader nhiều ảnh (file, nén bằng canvas, preview, xóa từng ảnh) + bảng tồn kho động (màu, mã màu, số lượng) + nút thêm/xóa dòng + load lại khi sửa
- [ ] 7. `MotorcycleManagement.jsx`: Thêm cột "Tồn kho"

## Database

- [x] 8. ALTER TABLE `motorcycle_images.image_url` và `motorcycles.thumbnail_url` sang `LONGTEXT` (fix lỗi "Data too long for column 'image_url'")

## Kiểm thử

- [ ] 9. Build backend & chạy thử, xác nhận thêm xe nhiều ảnh + số lượng hoạt động
