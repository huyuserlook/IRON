# Guide: Integrating Bank and Momo QR Payments into a WordPress Website

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Setting Up the Backend API](#setting-up-the-backend-api)
4. [Integrating with WordPress](#integrating-with-wordpress)
5. [Momo QR Integration](#momo-qr-integration)
6. [Bank Transfer QR Integration](#bank-transfer-qr-integration)
7. [WordPress Frontend Interface](#wordpress-frontend-interface)
8. [Callback & Webhook Handling](#callback--webhook-handling)
9. [SSL Configuration & Security](#ssl-configuration--security)
10. [Testing & Deployment](#testing--deployment)

---

## Overview

The payment system supports 2 QR-based payment methods:

| Method | Description | Advantages |
|--------|-------------|------------|
| **Momo QR** | Scan MoMo QR code to pay directly from MoMo wallet | Fast, popular, no bank card needed |
| **Bank Transfer QR** | Scan QR code to transfer via bank (Vietcombank) | Reliable, suitable for large amounts |

---

## System Architecture

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│  WordPress      │──────▶│  Spring Boot Backend  │──────▶│  MySQL Database  │
│  Frontend       │◀──────│  API /payments        │◀──────│  payments table  │
│  (React/PHP)    │       │  PaymentService       │       │  payment_methods │
└─────────────────┘       └──────────────────────┘       └─────────────────┘
        │                           │
        │  1. User selects payment  │
        │  2. Call create QR API   │
        │  3. Display QR code      │
        │  4. User scans QR        │
        │  5. Momo/Bank callback   │
        │  6. Confirm payment      │
        │                           │
```

---

## Setting Up the Backend API

### 1. Clone and configure the project

```bash
cd D:\IRON\BE
copy .env.example .env
```

Edit `application.properties`:

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

### 2. Run the backend

```bash
.\mvnw spring-boot:run
```

The backend will run at `http://localhost:8080`.

### 3. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/order/{orderId}` | Get payment info by order ID |
| POST | `/api/payments/{orderId}/qr` | Create payment QR code |
| GET | `/api/payments/{orderId}/qr` | Get created QR code |
| GET | `/api/payments/{orderId}/bank-transfer` | Get bank transfer info |
| GET | `/api/payments/{orderId}/vnpay-url` | Get VNPay payment URL |
| POST | `/api/payments/{orderId}/submit-transaction` | Submit transaction reference |
| POST | `/api/payments/callback` | Callback from Momo/VNPAY |
| GET | `/api/admin/payment-methods` | List payment methods (admin) |
| POST | `/api/admin/payment-methods` | Add new payment method (admin) |
| PUT | `/api/admin/payment-methods/{id}` | Update payment method (admin) |
| DELETE | `/api/admin/payment-methods/{id}` | Delete payment method (admin) |

---

## Integrating with WordPress

### Method 1: Using WordPress REST API + Shortcode

#### Step 1: Create a WordPress plugin

Create a folder `wp-content/plugins/iron-payment/` and create `iron-payment.php`:

```php
<?php
/**
 * Plugin Name: IRON Payment Integration
 * Description: Integrate Momo QR and Bank QR payments into WordPress
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

#### Step 2: Create a Shortcode

Add to `iron-payment.php`:

```php
// Shortcode to display the payment page
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
            <h3>Select payment method</h3>
            <div class="iron-payment-options">
                <div class="iron-payment-option" data-method="MOMO">
                    <img src="<?php echo plugin_dir_url(__FILE__); ?>assets/images/momo-icon.png" alt="MoMo">
                    <span>MoMo Payment</span>
                </div>
                <div class="iron-payment-option" data-method="BANK_TRANSFER">
                    <img src="<?php echo plugin_dir_url(__FILE__); ?>assets/images/bank-icon.png" alt="Bank">
                    <span>Bank Transfer</span>
                </div>
            </div>
        </div>
        
        <div id="iron-qr-container" style="display:none;">
            <div id="iron-qr-image"></div>
            <p id="iron-qr-description"></p>
            <div id="iron-bank-info" style="display:none;">
                <p><strong>Account:</strong> <span id="iron-bank-account"></span></p>
                <p><strong>Bank:</strong> <span id="iron-bank-name"></span></p>
                <p><strong>Branch:</strong> <span id="iron-bank-branch"></span></p>
            </div>
            <button id="iron-submit-transaction" class="iron-btn">
                Paid - Submit Transaction Code
            </button>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('iron_payment', 'iron_payment_checkout_shortcode');
```

#### Step 3: Create JavaScript handler

Create `assets/js/iron-payment.js`:

```javascript
(function($) {
    'use strict';

    var container = $('#iron-payment-container');
    if (container.length === 0) return;

    var orderId = container.data('order-id');
    var amount = container.data('amount');
    var orderCode = container.data('order-code');
    var apiUrl = ironPaymentAjax.apiUrl;

    // When user selects a payment method
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
                console.error('QR creation error:', error);
                alert('Error creating QR payment. Please try again.');
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

        // Scroll to QR code
        $('#iron-qr-container')[0].scrollIntoView({ behavior: 'smooth' });
    }

    // Submit transaction code when user has paid
    $('#iron-submit-transaction').on('click', function() {
        var transactionRef = prompt('Please enter the transaction/reference code:');
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
                    alert('Transaction code submitted successfully! Payment is being processed.');
                    // Reload or redirect
                    window.location.href = '/thank-you';
                }
            },
            error: function(xhr, status, error) {
                console.error('Transaction submission error:', error);
                alert('Error submitting transaction code. Please contact admin.');
            }
        });
    });

})(jQuery);
```

#### Step 4: Create CSS styles

Create `assets/css/iron-payment.css`:

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

#### Step 5: Use the shortcode on a page

In the WordPress Editor, add the shortcode:

```
[iron_payment order_id="1" amount="500000" order_code="ORD-001"]
```

---

## Momo QR Integration

### How It Works

1. Backend creates a QR code with MoMo QR URL/image path
2. Frontend displays the QR code to the user
3. User scans the QR using the MoMo app on their phone
4. User confirms payment in the MoMo app
5. MoMo sends a callback to the backend to confirm the payment

### Momo Configuration

In `application.properties`:

```properties
# Momo QR (using static QR image or dynamic QR)
payment.qr.momo=/qr/qrmomo.jpg
```

### Integration from WordPress Frontend

```javascript
// Select MoMo payment
$('.iron-payment-option[data-method="MOMO"]').on('click', function() {
    var orderId = $('#iron-payment-container').data('order-id');
    var amount = $('#iron-payment-container').data('amount');

    // Call API to create MoMo QR
    $.ajax({
        url: ironPaymentAjax.apiUrl + '/payments/' + orderId + '/qr',
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + ironPaymentAjax.nonce // if auth is needed
        },
        data: JSON.stringify({
            paymentMethod: 'MOMO',
            amount: amount
        }),
        success: function(response) {
            if (response.success) {
                // Display MoMo QR code
                $('#iron-qr-image').html(
                    '<img src="' + response.data.qrCodeUrl + '" alt="MoMo QR Code">'
                );
                $('#iron-qr-description').text(response.data.qrDescription);
                $('#iron-bank-info').hide(); // Hide bank info for MoMo
                $('#iron-qr-container').show();
            }
        }
    });
});
```

---

## Bank Transfer QR Integration

### How It Works

1. Backend creates a bank transfer QR code
2. Frontend displays the QR code along with bank account info
3. User opens their bank app on their phone
4. User scans the QR and confirms the transfer
5. Backend confirms the payment (via callback or user submits transaction code)

### Bank Configuration

In `application.properties`:

```properties
# Bank Transfer QR
payment.qr.bank-transfer=/qr/qrmb.jpg
payment.bank.account=1234567890
payment.bank.name=Vietcombank
payment.bank.branch=Chi nhanh Ha Noi
```

### Integration from WordPress Frontend

```javascript
// Select Bank Transfer payment
$('.iron-payment-option[data-method="BANK_TRANSFER"]').on('click', function() {
    var orderId = $('#iron-payment-container').data('order-id');
    var amount = $('#iron-payment-container').data('amount');

    // Call API to create Bank Transfer QR
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
                // Display bank QR code
                $('#iron-qr-image').html(
                    '<img src="' + response.data.qrCodeUrl + '" alt="Bank Transfer QR Code">'
                );
                $('#iron-qr-description').text(response.data.qrDescription);

                // Display bank info
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

## Callback & Webhook Handling

### Callback from MoMo

When a user successfully pays via MoMo, MoMo sends a callback to the backend:

```java
// Already in PaymentController.java
@PostMapping("/callback")
public ResponseEntity<ApiResponse<?>> paymentCallback(
        @RequestParam Long orderId,
        @RequestParam String status,
        @RequestParam(required = false) String transactionId) {
    
    paymentService.updateStatus(orderId, Payment.PaymentStatus.valueOf(status), transactionId);
    return ResponseEntity.ok(ApiResponse.success(null, "Payment status updated successfully"));
}
```

### Handling Callbacks in WordPress

Add to `iron-payment.php`:

```php
// AJAX handler to check payment status
function iron_payment_check_status() {
    check_ajax_referer('iron_payment_nonce', 'nonce');
    
    $order_id = intval($_POST['order_id']);
    $api_url = IRON_PAYMENT_API_URL . '/payments/order/' . $order_id;
    
    $response = wp_remote_get($api_url);
    
    if (is_wp_error($response)) {
        wp_send_json_error(['message' => 'API connection error']);
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
        wp_send_json_error(['message' => 'Payment not found']);
    }
}
add_action('wp_ajax_iron_payment_check_status', 'iron_payment_check_status');
add_action('wp_ajax_nopriv_iron_payment_check_status', 'iron_payment_check_status');
```

### Polling Payment Status (JavaScript)

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
                    alert('Payment successful! Thank you.');
                    window.location.href = '/thank-you';
                }
            }
        });
    }, 5000); // Check every 5 seconds
}

// Start polling after QR is displayed
// Call checkPaymentStatus(orderId) after user scans QR
```

---

## SSL Configuration & Security

### 1. HTTPS is Required

```properties
# In application.properties
app.base-url=https://yourdomain.com
```

### 2. CORS Configuration

The backend already has `CorsConfig.java`. Make sure to configure it for the WordPress domain:

```java
// CorsConfig.java - already exists in the project
// Make sure to allow the WordPress domain
```

### 3. API Authentication (if needed)

Add JWT or API Key for payment endpoints:

```php
// In WordPress, add authentication headers
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

## Testing & Deployment

### 1. Local Testing

```bash
# 1. Start MySQL
# 2. Start Backend
cd D:\IRON\BE
.\mvnw spring-boot:run

# 3. Start WordPress (Docker or XAMPP)
# 4. Activate the "IRON Payment Integration" plugin
# 5. Create a payment page with the [iron_payment] shortcode
```

### 2. Pre-Deployment Checklist

- [ ] Set `app.base-url` to production domain
- [ ] Enable SSL (HTTPS) on both WordPress and Backend
- [ ] Update CORS to allow the WordPress domain
- [ ] Configure correct bank info (account, name, branch)
- [ ] Upload QR images to the correct `/qr/` path
- [ ] Test MoMo QR payment successfully
- [ ] Test Bank Transfer QR payment successfully
- [ ] Test callback/webhook from MoMo
- [ ] Test error handling (failed payment, timeout)
- [ ] Test responsive design on mobile
- [ ] Check security (SQL injection, XSS, CSRF)

### 3. Production Deployment

```bash
# Build backend
cd D:\IRON\BE
.\mvnw clean package -DskipTests

# Copy JAR to server
copy target\IRON-0.0.1-SNAPSHOT.jar /var/www/iron-backend/

# Run backend with systemd or PM2
# Configure Nginx reverse proxy
```

### 4. Nginx Reverse Proxy Configuration

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

## Payment Flow Diagram

```
User places order on WordPress
        │
        ▼
WordPress creates an order
        │
        ▼
Send orderId to Backend API
        │
        ▼
Backend creates a Payment record (status: PENDING)
        │
        ▼
User selects a payment method (Momo / Bank)
        │
        ▼
Call POST /api/payments/{orderId}/qr
        │
        ▼
Backend returns QR code URL + info
        │
        ▼
WordPress displays QR code to User
        │
        ▼
User scans QR using MoMo / Bank app
        │
        ▼
User confirms payment
        │
        ▼
Momo / Bank sends callback to Backend
        │
        ▼
Backend updates Payment status = PAID
        │
        ▼
Backend updates Order status = CONFIRMED
        │
        ▼
WordPress displays "Payment Successful" page
```

---

## Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| QR not displaying | Wrong QR URL path | Check `payment.qr.momo` and `payment.qr.bank-transfer` in `application.properties` |
| Callback not received | CORS or wrong callback URL | Check `app.base-url` and CORS config |
| Payment not updating | Database sync issue | Check if callback endpoint is working |
| 403 Forbidden | CORS blocked | Add WordPress domain to CORS whitelist |
| 500 Internal Server Error | Unhandled exception | Check Spring Boot logs |

### Checking Logs

```bash
# Backend logs
tail -f /var/log/iron-backend/app.log

# MySQL logs
tail -f /var/log/mysql/error.log

# Nginx logs
tail -f /var/log/nginx/error.log
```

---

## Support

- Email: support@yourdomain.com
- Phone: 0123-456-789
- Documentation: https://yourdomain.com/docs/payment
