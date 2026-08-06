# Hướng Dẫn Tích Hợp MoMo với Webhook Tự Động Xác Nhận

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Chuẩn Bị](#chuẩn-bị)
4. [Cấu Hình Backend](#cấu-hình-backend)
5. [Chạy Hệ Thống](#chạy-hệ-thống)
6. [Test Luồng Thanh Toán](#test-luồng-thanh-toán)
7. [Kiểm Tra Webhook](#kiểm-tra-webhook)
8. [Troubleshooting](#troubleshooting)

---

## Tổng Quan

Hệ thống đã tích hợp sẵn **MoMo Sandbox** (môi trường test) với cơ chế **webhook tự động xác nhận thanh toán**.

### Luồng hoạt động

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ Frontend │────▶│ Backend  │────▶│  MoMo   │────▶│  User   │
│ (React)  │     │ (Spring) │     │ (Sandbox)│     │ (App)   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │               │                │
     │  1. Tạo QR    │               │                │
     │───────────────▶│               │                │
     │                │  2. Request   │                │
     │                │──────────────▶│                │
     │                │               │  3. QR+PayUrl  │
     │                │◀──────────────│                │
     │  4. Hiển thị QR│               │                │
     │◀───────────────│               │                │
     │                │               │  5. Quét & TT  │
     │                │               │────────────────▶│
     │                │               │                │
     │                │  6. Webhook   │                │
     │                │◀──────────────│                │
     │                │  7. Update    │                │
     │                │  PAID+CONFIRM │                │
     │  8. Polling    │               │                │
     │───────────────▶│               │                │
     │  9. Redirect   │               │                │
     │◀───────────────│               │                │
```

### Các thành phần đã có sẵn

| Thành phần | File | Vai trò |
|-----------|------|---------|
| Backend API | `MomoController.java` | Tạo QR MoMo + nhận webhook |
| Service xử lý | `MomoService.java` | Tạo payment + verify signature + cập nhật trạng thái |
| Cấu hình | `MomoProperties.java` | Đọc config từ `application.properties` |
| Frontend | `PaymentPage.jsx` | Hiển thị QR MoMo + polling trạng thái |
| API client | `paymentApi.js` | Gọi endpoint tạo QR MoMo |

---

## Chuẩn Bị

### Yêu cầu

- **Backend**: Spring Boot 3.5.0, Java 25, MySQL 8
- **Frontend**: React 19 + Vite
- **Ngrok**: Để expose localhost ra public URL (webhook cần public IP)
- **App MoMo**: Tải từ App Store / Google Play (để test thanh toán)

### Cài đặt ngrok

Tải từ [ngrok.com](https://ngrok.com/download) hoặc dùng chocolatey:

```bash
choco install ngrok
```

---

## Cấu Hình Backend

### Bước 1: Chạy ngrok

Mở terminal và chạy:

```bash
ngrok http 8080
```

Sau khi chạy, ngrok sẽ hiển thị URL dạng:

```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080
```

**Copy URL ngrok** (ví dụ: `https://abc123.ngrok-free.app`)

### Bước 2: Cập nhật application.properties

Mở file `BE/src/main/resources/application.properties` và cập nhật phần MoMo:

```properties
# MoMo Configuration (Sandbox)
momo.partner-code=MOMO
momo.access-key=F8BBA842ECF85
momo.secret-key=K951B6PE1waDMi640xX08PD3vg6EkVlz
momo.endpoint=https://test-payment.momo.vn/v2/gateway/api/create
momo.ipn-url=https://abc123.ngrok-free.app/api/webhook/momo
momo.request-type=captureWallet
momo.redirect-url=https://abc123.ngrok-free.app/my-orders
```

**Thay thế `abc123.ngrok-free.app` bằng URL thực tế của bạn.**

> **Lưu ý quan trọng:** 
> - Mỗi lần restart ngrok, URL sẽ thay đổi → phải cập nhật lại `application.properties`
> - Backend cần restart sau khi thay đổi config

### Bước 3: Verify Security Config

Backend đã có sẵn security config cho webhook:

```java
// SecurityConfig.java
.requestMatchers(HttpMethod.POST, "/api/webhook/momo").permitAll()
```

Điều này cho phép MoMo gọi webhook mà không cần JWT authentication.

---

## Chạy Hệ Thống

### Terminal 1: Backend

```bash
cd D:\IRON\BE
.\mvnw.cmd spring-boot:run
```

Backend chạy tại `http://localhost:8080`.

### Terminal 2: Frontend

```bash
cd D:\IRON\FE
npm run dev
```

Frontend chạy tại `http://localhost:5173`.

### Terminal 3: Ngrok

```bash
ngrok http 8080
```

Giữ terminal này chạy trong suốt quá trình test.

---

## Test Luồng Thanh Toán

### Bước 1: Đặt hàng với MoMo

1. Mở trình duyệt, vào `http://localhost:5173`
2. Thêm sản phẩm vào giỏ hàng
3. Vào giỏ hàng → Thanh toán
4. Chọn phương thức **"MoMo"**
5. Điền địa chỉ nhận xe → Xác nhận đặt hàng

### Bước 2: Trang thanh toán MoMo

Sau khi đặt hàng, hệ thống tự động chuyển đến trang `/payment?orderId=...&amount=...`

Trang hiển thị:
- **Mã QR MoMo** để quét
- **Nút "Mở app MoMo"** (deeplink trực tiếp)
- **Link trang thanh toán MoMo**
- **Hướng dẫn** từng bước

### Bước 3: Thanh toán trên app MoMo

1. Mở app MoMo trên điện thoại
2. Quét mã QR hiển thị trên màn hình
3. Kiểm tra thông tin đơn hàng + số tiền
4. Xác nhận thanh toán (nhập mật khẩu/Face ID)

### Bước 4: Tự động xác nhận

Sau khi thanh toán thành công:

1. **MoMo gửi webhook** về backend (`/api/webhook/momo`)
2. Backend **verify signature** để đảm bảo request hợp lệ
3. Backend cập nhật:
   - `Payment.status = PAID`
   - `Payment.transactionId = transId từ MoMo`
   - `Payment.paidAt = thời gian hiện tại`
   - `Order.status = CONFIRMED`
4. Frontend **polling mỗi 3 giây** phát hiện thay đổi
5. Frontend hiển thị thông báo "Thanh toán thành công!"
6. Tự động chuyển về trang `/my-orders` sau 2 giây

---

## Kiểm Tra Webhook

### Cách 1: Xem logs backend

Backend sẽ log khi nhận webhook:

```
2024-01-15 10:30:45.123  INFO 12345 --- [nio-8080-exec-1] c.e.IRON.service.MomoService : MoMo webhook received for order ORD-20240115-0001
2024-01-15 10:30:45.124  INFO 12345 --- [nio-8080-exec-1] c.e.IRON.service.MomoService : Payment updated to PAID, Order updated to CONFIRMED
```

### Cách 2: Dùng MoMo Developer Portal

1. Đăng nhập [MoMo Developer Portal](https://developer.momo.vn/)
2. Vào phần **Test Case** hoặc **Transaction History**
3. Xem trạng thái giao dịch vừa tạo
4. Kiểm tra IPN URL đã được gọi thành công chưa

### Cách 3: Test webhook thủ công với curl

```bash
curl -X POST https://abc123.ngrok-free.app/api/webhook/momo \
  -H "Content-Type: application/json" \
  -d '{
    "partnerCode": "MOMO",
    "orderId": "ORD-20240115-0001",
    "requestId": "test-request-id",
    "amount": "100000",
    "orderInfo": "Thanh toan don hang ORD-20240115-0001",
    "resultCode": "0",
    "message": "Success",
    "transId": "123456789",
    "signature": "INVALID_SIGNATURE"
  }'
```

> **Lưu ý:** Signature trong ví dụ là invalid → webhook sẽ bị reject (403). Dùng để test security.

---

## Troubleshooting

### 1. Webhook không được gọi

**Nguyên nhân:**
- Backend không public (localhost không thể nhận webhook)
- Ngrok không chạy
- URL ipn-url sai hoặc đã thay đổi
- Backend không chạy

**Giải pháp:**
```bash
# Kiểm tra ngrok đang chạy
ngrok http 8080

# Kiểm tra backend đang chạy
curl http://localhost:8080/api/health

# Kiểm tra webhook endpoint có accessible không
curl https://abc123.ngrok-free.app/api/webhook/momo -X POST -H "Content-Type: application/json" -d "{}"
# Mong đợi nhận 204 No Content (không lỗi)
```

### 2. Webhook bị reject (Invalid signature)

**Nguyên nhân:**
- Secret key trong `application.properties` không khớp với MoMo config
- Request bị modify giữa chừng

**Giải pháp:**
- Kiểm tra `momo.secret-key` trong `application.properties`
- Đảm bảo không có proxy/firewall modify request body

### 3. Polling không phát hiện trạng thái đã thay đổi

**Nguyên nhân:**
- Frontend polling URL sai
- Backend trả về status không đúng format

**Giải pháp:**
- Kiểm tra `orderApi.getStatus(orderId)` trong console browser
- Backend endpoint `/api/orders/{id}/status` trả về `paymentStatus: "PAID"` khi thanh toán thành công

### 4. Ngrok URL thay đổi liên tục

**Giải pháp:**
- Đăng ký tài khoản ngrok miễn phí để có static domain
- Hoặc dùng script tự động cập nhật config:

```powershell
# Windows PowerShell script
$ngrokUrl = (Invoke-RestMethod http://localhost:4040/api/tunnels).tunnels[0].public_url
(Get-Content BE\src\main\resources\application.properties) -replace 'momo\.ipn-url=.*', "momo.ipn-url=$ngrokUrl/api/webhook/momo" -replace 'momo\.redirect-url=.*', "momo.redirect-url=$ngrokUrl/my-orders" | Set-Content BE\src\main\resources\application.properties
Write-Host "Updated MoMo URLs to: $ngrokUrl"
```

---

## Endpoints Đã Triển Khai

### Backend

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| POST | `/api/checkout/momo` | Tạo QR MoMo + lấy payUrl/deeplink | JWT |
| POST | `/api/webhook/momo` | Nhận webhook từ MoMo | None (permitAll) |
| POST | `/api/checkout/vietqr` | Tạo VietQR (chuyển khoản ngân hàng) | JWT |
| POST | `/api/checkout/orders/{orderId}/confirm` | Xác nhận thanh toán thủ công | JWT |
| GET | `/api/checkout/orders/{orderId}/status` | Lấy trạng thái đơn hàng | None |
| GET | `/api/orders/{id}/status` | Lấy trạng thái đơn hàng (có paymentStatus) | None |

### Frontend

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/checkout/momo` | Tạo QR MoMo |
| GET | `/orders/{id}/status` | Poll trạng thái |

---

## Chuyển Sang Production

Khi sẵn sàng chạy production:

### 1. Đăng ký MoMo Merchant

- Truy cập [MoMo Developer Portal](https://developer.momo.vn/)
- Đăng ký tài khoản merchant
- Lấy credentials thật: `partnerCode`, `accessKey`, `secretKey`
- Cập nhật endpoint sang production: `https://payment.momo.vn/v2/gateway/api/create`

### 2. Cấu hình Production

```properties
# MoMo Production
momo.partner-code=YOUR_MERCHANT_CODE
momo.access-key=YOUR_ACCESS_KEY
momo.secret-key=YOUR_SECRET_KEY
momo.endpoint=https://payment.momo.vn/v2/gateway/api/create
momo.ipn-url=https://yourdomain.com/api/webhook/momo
momo.request-type=captureWallet
momo.redirect-url=https://yourdomain.com/my-orders
```

### 3. Deploy Backend

```bash
cd D:\IRON\BE
.\mvnw.cmd clean package -DskipTests
# Copy JAR lên server
java -jar target/IRON-0.0.1-SNAPSHOT.jar
```

### 4. Cấu hình Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    # SSL config...

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Liên Hệ Hỗ Trợ

- **MoMo Developer Docs**: https://developers.momo.vn/
- **MoMo Support**: support@momo.vn
- **Project Issues**: Tạo issue trên repository
