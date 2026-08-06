# Hướng Dẫn Tích Hợp Thanh Toán Ngân Hàng, Momo Bằng QR Vào Website WordPress

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Cài Đặt Backend API](#cài-đặt-backend-api)
4. [Tích H�p Vào WordPress](#tích-hợp-vào-wordpress)
5. [Tích Hợp Momo QR](#tích-hợp-momo-qr)
6. [Tích Hợp Ngân Hàng QR](#tích-hợp-ngân-hàng-qr)
7. [Giao Diện Frontend WordPress](#giao-diện-frontend-wordpress)
8. [Xử Lý Callback & Webhook](#xử-lý-callback--webhook)
9. [Cấu Hình SSL & Bảo Mật](#cấu-hình-ssl--bảo-mật)
10. [Kiểm Thử & Triển Khai](#kiểm-thử--triển-khai)

---

## Tổng Quan

Hệ thống thanh toán hỗ trợ 2 phương thức thanh toán qua QR:

| Phương thức | Mô tả | Ưu điểm |
|-------------|--------|----------|
| **Momo QR** | Quét mã QR MoMo để thanh toán trực tiếp từ ví MoMo | Nhanh, phổ biến, không cần thẻ ngân hàng |
| **Bank Transfer QR** | Quét mã QR để chuyển khoản ngân hàng (Vietcombank) | Phổ biến, tin cậy, phù hợp số tiền lớn |

---

## Kiến Trúc Hệ Thống

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│  WordPress      │──────▶│  Spring Boot Backend  │──────▶│  MySQL Database  │
│  Frontend       │◀──────│  API /payments        │◀──────│  payments table  │
│  (React/PHP)    │       │  PaymentService       │       │  payment_methods │
└─────────────────┘       └──────────────────────┘       └─────────────────┘
        │                           │
        │  1. User chọn thanh toán  │
        │  2. Gọi API create QR    │
        │  3. Hiển thị QR code     │
        │  4. User quét QR         │
        │  5. Momo/Bank callback   │
        │  6. Xác nhận thanh toán  │
        │                           │
```

---

## Cài Đặt Backend API

### 1. Clone và cấu hình dự án

```bash
cd D:\IRON\BE
copy .env.example .env
```

Chỉnh sửa `application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/iron_showroom?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Ho_Chi_Minh
spring.datasource.username=root
spring.datasource.password=your_password

# App
app.base-url=https://yourdomain.com

# Payment QR (static images)
payment.qr.momo=/qr/qrmomo.jpg
payment.qr.bank-transfer=/qr/qrmb.jpg

# Bank info
payment.bank.account=1234567890
payment.bank.name=Vietcombank
payment.bank.branch=Chi nhanh Ha Noi
```

### 2. Chạy backend

```bash
.\mvnw spring-boot:run
```

Backend sẽ chạy tại `http://localhost:8080`.

### 3. Các API Endpoint

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/payments/order/{orderId}` | Lấy thông tin thanh toán theo đơn hàng |
| POST | `/api/payments/{orderId}/qr` | Tạo QR code thanh toán |
| GET | `/api/payments/{orderId}/qr` | Lấy QR code đã tạo |
| GET | `/api/payments/{orderId}/bank-transfer` | Lấy thông tin chuyển khoản ngân hàng |
| GET | `/api/payments/{orderId}/vnpay-url` | Lấy URL thanh toán VNPay |
| POST | `/api/payments/{orderId}/submit-transaction` | Gửi mã giao dịch tham chiếu |
| POST | `/api/payments/callback` | Callback từ Momo/VNPAY |
| GET | `/api/admin/payment-methods` | Lấy danh sách phương thức thanh toán (admin) |
| POST | `/api/admin/payment-methods` | Thêm phương thức thanh toán mới (admin) |
| PUT | `/api/admin/payment-methods/{id}` | Cập nhật phương thức thanh toán (admin) |
| DELETE | `/api/admin/payment-methods/{id}` | Xóa phương thức thanh toán (admin) |

---

## Tích Hợp Vào WordPress

### Cách 1: Sử Dụng WordPress REST API + Shortcode

#### Bước 1: Tạo plugin WordPress

Tạo thư mục `wp-content/plugins/iron-payment/` và tạo file `iron-payment.php`:

```php
<?php
/**
 * Plugin Name: IRON Payment Integration
 * Description: Tích hợp thanh toán Momo QR và Ngân hàng QR vào WordPress
 * Version: 1.0.0
 * Author: IRON
 */

if (!defined('ABSPATH')) {
    exit;
}

define('IRON_PAYMENT_API_URL', 'http://localhost:8080/api');
define('IRON_PAYMENT_BASE_URL', 'http://localhost:8080');

// Enqueue styles and scripts
function iron_payment_enqueue_assets() {
    wp_enqueue_style(
        'iron-payment-css',
        plugin_dir_url(__FILE__) . 'assets/css/iron-payment.css',
        array(),
        '1.0.0'
    );
    wp_enqueue_script(
        'iron-payment-js',
        plugin_dir_url(__FILE__) . 'assets/js/iron-payment.js',
        array('jquery'),
        '1.0.0',
        true
    );
    wp_localize_script('iron-payment-js', 'ironPaymentAjax', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'apiUrl' => IRON_PAYMENT_API_URL,
        'nonce' => wp_create_nonce('iron_payment_nonce'),
        'baseUrl' => IRON_PAYMENT_BASE_URL
    ));
}
add_action('wp_enqueue_scripts', 'iron_payment_enqueue_assets');
```

#### Bước 2: Tạo Shortcode

Thêm vào file `iron-payment.php`:

```php
// Shortcode hiển thị trang thanh toán
function iron_payment_checkout_shortcode($atts) {
    $atts = shortcode_atts(array(
        'order_id' => 0,
        'amount' => 0,
        'order_code' => ''
    ), $atts, 'iron_payment');

    ob_start();
    ?>
    <div id="iron-payment-container" 
         data-order-id="<?php echo esc_attr($atts['order_id']); ?>" 
         data-amount="<?php echo esc_attr($atts['amount']); ?>" 
         data-order-code="<?php echo esc_attr($atts['order_code']); ?>">
        
        <div class="iron-payment-methods">
            <h3>Chọn phương thức thanh toán</h3>
            <div class="iron-payment-options">
                <div class="iron-payment-option" data-method="MOMO">
                    <img src="<?php echo plugin_dir_url(__FILE__); ?>assets/images/momo-icon.png" alt="MoMo">
                    <span>Thanh toán MoMo</span>
                </div>
                <div class="iron-payment-option" data-method="BANK_TRANSFER">
                    <img src="<?php echo plugin_dir_url(__FILE__); ?>assets/images/bank-icon.png" alt="Ngân hàng">
                    <span>Chuyển khoản ngân hàng</span>
                </div>
            </div>
        </div>
        
        <div id="iron-qr-container" style="display:none;">
            <div id="iron-qr-image"></div>
            <p id="iron-qr-description"></p>
            <div id="iron-bank-info" style="display:none;">
                <p><strong>Tài khoản:</strong> <span id="iron-bank-account"></span></p>
                <p><strong>Ngân hàng:</strong> <span id="iron-bank-name"></span></p>
                <p><strong>Chi nhánh:</strong> <span id="iron-bank-branch"></span></p>
            </div>
            <button id="iron-submit-transaction" class="iron-btn">
                Đã thanh toán - Gửi mã giao dịch
            </button>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('iron_payment', 'iron_payment_checkout_shortcode');
```

#### Bước 3: Tạo JavaScript xử lý

Tạo file `assets/js/iron-payment.js`:

```javascript
(function($) {
    'use strict';

    var container = $('#iron-payment-container');
    if (container.length === 0) return;

    var orderId = container.data('order-id');
    var amount = container.data('amount');
    var orderCode = container.data('order-code');
    var apiUrl = ironPaymentAjax.apiUrl;

    // Khi user chọn phương thức thanh toán
    $('.iron-payment-option').on('click', function() {
        var method = $(this).data('method');
        createQrPayment(orderId, method);
    });

    function createQrPayment(orderId, method) {
        $.ajax({
            url: apiUrl + '/payments/' + orderId + '/qr',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                paymentMethod: method,
                amount: amount,
                orderId: orderId
            }),
            success: function(response) {
                if (response.success) {
                    displayQr(response.data, method);
                }
            },
            error: function(xhr, status, error) {
                console.error('Lỗi tạo QR:', error);
                alert('Lỗi khi tạo QR thanh toán. Vui lòng thử lại.');
            }
        });
    }

    function displayQr(data, method) {
        $('#iron-qr-container').show();
        $('#iron-qr-image').html('<img src="' + data.qrCodeUrl + '" alt="QR Code" class="iron-qr-image">');
        $('#iron-qr-description').text(data.qrDescription);

        if (method === 'BANK_TRANSFER' && data.bankAccount) {
            $('#iron-bank-info').show();
            $('#iron-bank-account').text(data.bankAccount);
            $('#iron-bank-name').text(data.bankName);
            $('#iron-bank-branch').text(data.bankBranch || '');
        } else {
            $('#iron-bank-info').hide();
        }

        // Scroll đến QR code
        $('#iron-qr-container')[0].scrollIntoView({ behavior: 'smooth' });
    }

    // Gửi mã giao dịch khi user đã thanh toán
    $('#iron-submit-transaction').on('click', function() {
        var transactionRef = prompt('Vui lòng nhập mã giao dịch/đề tham chiếu:');
        if (!transactionRef) return;

        $.ajax({
            url: apiUrl + '/payments/' + orderId + '/submit-transaction',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                transactionRef: transactionRef
            }),
            success: function(response) {
                if (response.success) {
                    alert('Gửi mã giao dịch thành công! Thanh toán đang được xử lý.');
                    // Reload hoặc redirect
                    window.location.href = '/thank-you';
                }
            },
            error: function(xhr, status, error) {
                console.error('Lỗi gửi giao dịch:', error);
                alert('Lỗi khi gửi mã giao dịch. Vui lòng liên hệ admin.');
            }
        });
    });

})(jQuery);
```

#### Bước 4: Tạo CSS styles

Tạo file `assets/css/iron-payment.css`:

```css
#iron-payment-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.iron-payment-methods h3 {
    margin-bottom: 15px;
    color: #333;
}

.iron-payment-options {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.iron-payment-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fff;
}

.iron-payment-option:hover {
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.iron-payment-option img {
    width: 60px;
    height: 60px;
    margin-bottom: 10px;
}

.iron-payment-option span {
    font-size: 14px;
    font-weight: 500;
    color: #555;
}

#iron-qr-container {
    text-align: center;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fafafa;
}

.iron-qr-image {
    max-width: 300px;
    margin: 0 auto 15px;
}

.iron-qr-image img {
    width: 100%;
    height: auto;
    border: 2px solid #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

#iron-bank-info {
    background: #f0f7ff;
    padding: 15px;
    border-radius: 6px;
    margin: 15px 0;
    text-align: left;
}

.iron-btn {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 12px 30px;
    font-size: 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.iron-btn:hover {
    background-color: #0056b3;
}
```

#### Bước 5: Sử dụng shortcode trong trang

Trong WordPress Editor, thêm shortcode:

```
[iron_payment order_id="1" amount="500000" order_code="ORD-001"]
```

---

## Tích Hợp Momo QR

### Cách hoạt động

1. Backend tạo QR code với URL/đường dẫn hình ảnh QR MoMo
2. Frontend hiển thị QR code cho user
3. User quét QR bằng app MoMo trên điện thoại
4. User xác nhận thanh toán trong app MoMo
5. MoMo gửi callback về backend để xác nhận thanh toán

### Cấu hình Momo

Trong `application.properties`:

```properties
# Momo QR (sử dụng static QR image hoặc dynamic QR)
payment.qr.momo=/qr/qrmomo.jpg
```

### Tích hợp từ frontend WordPress

```javascript
// Chọn thanh toán Momo
$('.iron-payment-option[data-method="MOMO"]').on('click', function() {
    var orderId = $('#iron-payment-container').data('order-id');
    var amount = $('#iron-payment-container').data('amount');

    // Gọi API tạo QR Momo
    $.ajax({
        url: ironPaymentAjax.apiUrl + '/payments/' + orderId + '/qr',
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + ironPaymentAjax.nonce // nếu cần auth
        },
        data: JSON.stringify({
            paymentMethod: 'MOMO',
            amount: amount
        }),
        success: function(response) {
            if (response.success) {
                // Hiển thị QR code Momo
                $('#iron-qr-image').html(
                    '<img src="' + response.data.qrCodeUrl + '" alt="MoMo QR Code">'
                );
                $('#iron-qr-description').text(response.data.qrDescription);
                $('#iron-bank-info').hide(); // Ẩn info ngân hàng cho Momo
                $('#iron-qr-container').show();
            }
        }
    });
});
```

---

## Tích Hợp Ngân Hàng QR

### Cách hoạt động

1. Backend tạo QR code chuyển khoản ngân hàng
2. Frontend hiển thị QR code kèm thông tin tài khoản ngân hàng
3. User mở app ngân hàng trên điện thoại
4. User quét QR và xác nhận chuyển khoản
5. Backend xác nhận thanh toán (qua callback hoặc user gửi mã giao dịch)

### Cấu hình Ngân hàng

Trong `application.properties`:

```properties
# Bank Transfer QR
payment.qr.bank-transfer=/qr/qrmb.jpg
payment.bank.account=1234567890
payment.bank.name=Vietcombank
payment.bank.branch=Chi nhanh Ha Noi
```

### Tích hợp từ frontend WordPress

```javascript
// Chọn thanh toán Ngân hàng
$('.iron-payment-option[data-method="BANK_TRANSFER"]').on('click', function() {
    var orderId = $('#iron-payment-container').data('order-id');
    var amount = $('#iron-payment-container').data('amount');

    // Gọi API tạo QR Bank Transfer
    $.ajax({
        url: ironPaymentAjax.apiUrl + '/payments/' + orderId + '/qr',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            paymentMethod: 'BANK_TRANSFER',
            amount: amount
        }),
        success: function(response) {
            if (response.success) {
                // Hiển thị QR code ngân hàng
                $('#iron-qr-image').html(
                    '<img src="' + response.data.qrCodeUrl + '" alt="Bank Transfer QR Code">'
                );
                $('#iron-qr-description').text(response.data.qrDescription);

                // Hiển thị thông tin ngân hàng
                if (response.data.bankAccount) {
                    $('#iron-bank-info').show();
                    $('#iron-bank-account').text(response.data.bankAccount);
                    $('#iron-bank-name').text(response.data.bankName);
                    $('#iron-bank-branch').text(response.data.bankBranch || '');
                }

                $('#iron-qr-container').show();
            }
        }
    });
});
```

---

## Xử Lý Callback & Webhook

### Callback từ MoMo

Khi user thanh toán thành công qua MoMo, MoMo sẽ gửi callback về backend:

```java
// Đã có trong PaymentController.java
@PostMapping("/callback")
public ResponseEntity<ApiResponse<?>> paymentCallback(
        @RequestParam Long orderId,
        @RequestParam String status,
        @RequestParam(required = false) String transactionId) {
    
    paymentService.updateStatus(orderId, Payment.PaymentStatus.valueOf(status), transactionId);
    return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái thanh toán thành công"));
}
```

### Xử lý callback trong WordPress

Thêm vào file `iron-payment.php`:

```php
// AJAX handler để kiểm tra trạng thái thanh toán
function iron_payment_check_status() {
    check_ajax_referer('iron_payment_nonce', 'nonce');
    
    $order_id = intval($_POST['order_id']);
    $api_url = IRON_PAYMENT_API_URL . '/payments/order/' . $order_id;
    
    $response = wp_remote_get($api_url);
    
    if (is_wp_error($response)) {
        wp_send_json_error(['message' => 'Lỗi kết nối API']);
        return;
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    
    if ($body['success'] && isset($body['data'])) {
        $payment = $body['data'];
        wp_send_json_success([
            'status' => $payment['status'],
            'transactionId' => $payment['transactionId'],
            'paidAt' => $payment['paidAt']
        ]);
    } else {
        wp_send_json_error(['message' => 'Không tìm thấy thanh toán']);
    }
}
add_action('wp_ajax_iron_payment_check_status', 'iron_payment_check_status');
add_action('wp_ajax_nopriv_iron_payment_check_status', 'iron_payment_check_status');
```

### Polling trạng thái thanh toán (JavaScript)

```javascript
function checkPaymentStatus(orderId) {
    var checkInterval = setInterval(function() {
        $.ajax({
            url: ironPaymentAjax.ajaxUrl,
            method: 'POST',
            data: {
                action: 'iron_payment_check_status',
                nonce: ironPaymentAjax.nonce,
                order_id: orderId
            },
            success: function(response) {
                if (response.success && response.data.status === 'PAID') {
                    clearInterval(checkInterval);
                    alert('Thanh toán thành công! Cảm ơn bạn.');
                    window.location.href = '/thank-you';
                }
            }
        });
    }, 5000); // Kiểm tra mỗi 5 giây
}

// Bắt đầu polling sau khi hiển thị QR
// Gọi checkPaymentStatus(orderId) sau khi user quét QR
```

---

## Cấu Hình SSL & Bảo Mật

### 1. Bắt buộc sử dụng HTTPS

```properties
# Trong application.properties
app.base-url=https://yourdomain.com
```

### 2. CORS Configuration

Backend đã có `CorsConfig.java`. Đảm bảo cấu hình đúng cho domain WordPress:

```java
// CorsConfig.java - đã có sẵn trong dự án
// Đảm bảo cho phép domain WordPress
```

### 3. Xác thực API (nếu cần)

Thêm JWT hoặc API Key cho các endpoint thanh toán:

```php
// Trong WordPress, thêm header xác thực
$.ajax({
    url: apiUrl + '/payments/' + orderId + '/qr',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + apiToken,
        'X-API-Key': 'your_api_key'
    },
    // ...
});
```

---

## Kiểm Thử & Triển Khai

### 1. Kiểm thử cục bộ

```bash
# 1. Khởi động MySQL
# 2. Khởi động Backend
cd D:\IRON\BE
.\mvnw spring-boot:run

# 3. Khởi động WordPress (Docker hoặc XAMPP)
# 4. Kích hoạt plugin "IRON Payment Integration"
# 5. Tạo trang thanh toán với shortcode [iron_payment]
```

### 2. Checklist trước khi triển khai

- [ ] Cấu hình `app.base-url` thành domain production
- [ ] Bật SSL (HTTPS) trên cả WordPress và Backend
- [ ] Cập nhật CORS để cho phép domain WordPress
- [ ] Cấu hình đúng thông tin ngân hàng (account, name, branch)
- [ ] Upload QR images lên đúng đường dẫn `/qr/`
- [ ] Test thanh toán Momo QR thành công
- [ ] Test thanh toán Bank Transfer QR thành công
- [ ] Test callback/webhook từ Momo
- [ ] Test xử lý lỗi (thanh toán thất bại, timeout)
- [ ] Test responsive trên mobile
- [ ] Kiểm tra bảo mật (SQL injection, XSS, CSRF)

### 3. Triển khai production

```bash
# Build backend
cd D:\IRON\BE
.\mvnw clean package -DskipTests

# Copy JAR ra server
copy target\IRON-0.0.1-SNAPSHOT.jar /var/www/iron-backend/

# Chạy backend với systemd hoặc PM2
# Cấu hình Nginx reverse proxy
```

### 4. Cấu hình Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # WordPress
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
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

## Sơ đồ luồng thanh toán

```
User đặt hàng trên WordPress
        │
        ▼
WordPress tạo đơn hàng (Order)
        │
        ▼
Gửi orderId đến Backend API
        │
        ▼
Backend tạo Payment record (status: PENDING)
        │
        ▼
User chọn phương thức (Momo / Bank)
        │
        ▼
Gọi POST /api/payments/{orderId}/qr
        │
        ▼
Backend trả về QR code URL + thông tin
        │
        ▼
WordPress hiển thị QR code cho User
        │
        ▼
User quét QR bằng app MoMo / Ngân hàng
        │
        ▼
User xác nhận thanh toán
        │
        ▼
Momo / Bank gửi callback về Backend
        │
        ▼
Backend cập nhật Payment status = PAID
        │
        ▼
Backend cập nhật Order status = CONFIRMED
        │
        ▼
WordPress hiển thị trang "Thanh toán thành công"
```

---

## Troubleshooting

### Lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| QR không hiển thị | Sai đường dẫn URL QR | Kiểm tra `payment.qr.momo` và `payment.qr.bank-transfer` trong `application.properties` |
| Callback không nhận được | CORS hoặc URL callback sai | Kiểm tra `app.base-url` và CORS config |
| Thanh toán không cập nhật | Database không sync | Kiểm tra callback endpoint có hoạt động không |
| Lỗi 403 Forbidden | CORS bị chặn | Thêm domain WordPress vào CORS whitelist |
| Lỗi 500 Internal Server Error | Exception chưa handle | Xem logs của Spring Boot |

### Kiểm tra logs

```bash
# Backend logs
tail -f /var/log/iron-backend/app.log

# MySQL logs
tail -f /var/log/mysql/error.log

# Nginx logs
tail -f /var/log/nginx/error.log
```

---

## Liên hệ hỗ trợ

- Email: support@yourdomain.com
- Phone: 0123-456-789
- Documentation: https://yourdomain.com/docs/payment
