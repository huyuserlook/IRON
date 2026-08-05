# TODO - Thêm tính năng Quản lý liên hệ (Contact Management)

## Mục tiêu

Tạo tính năng quản lý liên hệ khách hàng cho showroom IRON: gửi yêu cầu từ trang Liên hệ (public) và quản lý các yêu cầu trong trang Admin.

## Trạng thái: HOÀN THÀNH

## Các bước đã thực hiện

- [x] **B1. Backend - Entity & Column mapping**
  - `Contact.java`: `name` map sang cột `full_name` (khớp schema DB).
  - Thêm field `subject` (nullable).
  - `message` bắt buộc (NOT NULL), default `""` khi null.
  - `status` enum khớp DB: `NEW, IN_PROGRESS, RESOLVED, SPAM`.

- [x] **B2. Backend - DTO, Service, Repository, Controller**
  - `ContactRequest`: thêm `subject`.
  - `ContactResponse`: thêm `subject`.
  - `ContactServiceImpl`: set `subject`, default message `""`.
  - `ContactRepository`, `ContactService`, `ContactController`, `AdminContactController` đã có.

- [x] **B3. Frontend - API & Pages**
  - `contactApi.js`: các hàm gọi API.
  - `ContactPage.jsx`: form gửi liên hệ.
  - `ContactManagement.jsx`: quản lý liên hệ (status options cập nhật theo enum DB).
  - `Sidebar.jsx`, `AppRoutes.jsx`: thêm route `/admin/contacts`.

- [x] **B4. Build & Kiểm tra**
  - Backend: `mvnw clean compile` → BUILD SUCCESS (110 files).
  - Frontend: `npm run build` → built in 1.83s.

## Ghi chú

- Đã khắc phục lỗi `Field 'full_name' doesn't have a default value` bằng cách map `name` → `full_name`.
- Đồng bộ enum `status` với DB (`IN_PROGRESS`, `SPAM` thay `CONTACTED`, `CLOSED`).
