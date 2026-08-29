-- 1. Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS iron_showroom DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iron_showroom;

-- 2. Bảng Roles (Vai trò người dùng)
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 3. Bảng Users (Người dùng)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    provider ENUM('LOCAL', 'GOOGLE', 'FACEBOOK') DEFAULT 'LOCAL' NOT NULL,
    provider_id VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    avatar_url VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Bảng trung gian User_Roles (Nhiều - Nhiều)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Bảng Brands (Hãng xe)
CREATE TABLE brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    logo_url VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL
) ENGINE=InnoDB;

-- 6. Bảng Categories (Danh mục xe)
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE NOT NULL
) ENGINE=InnoDB;

-- 7. Bảng Motorcycles (Thông tin xe)
CREATE TABLE motorcycles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE,
    brand_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    engine_cc INT,
    horsepower DOUBLE,
    torque DOUBLE,
    year_model INT,
    thumbnail_url VARCHAR(255),
    stock INT DEFAULT 0 NOT NULL,
    description TEXT,
    specifications TEXT,
    status ENUM('AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED', 'COMING_SOON') DEFAULT 'AVAILABLE' NOT NULL,
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

-- 8. Bảng Motorcycle_Images (Bộ sưu tập ảnh xe)
CREATE TABLE motorcycle_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    motorcycle_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    color_name VARCHAR(50),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Bảng Inventories (Kho hàng / Màu sắc xe)
CREATE TABLE inventories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    motorcycle_id BIGINT NOT NULL,
    color_name VARCHAR(50),
    color_code VARCHAR(20),
    quantity INT DEFAULT 0 NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Bảng Orders (Đơn hàng)
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(20) UNIQUE,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING' NOT NULL,
    shipping_address TEXT,
    customer_note TEXT,
    admin_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 11. Bảng Order_Details (Chi tiết đơn hàng)
CREATE TABLE order_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    motorcycle_id BIGINT NOT NULL,
    motorcycle_name VARCHAR(255) NOT NULL,
    color_name VARCHAR(50),
    quantity INT DEFAULT 1 NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id)
) ENGINE=InnoDB;

-- 12. Bảng Bookings (Đặt lịch lái thử)
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    motorcycle_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(15) NOT NULL,
    note TEXT,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id)
) ENGINE=InnoDB;

-- 13. Bảng Payments (Thanh toán)
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method ENUM('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOMO', 'VNPAY') NOT NULL,
    status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING' NOT NULL,
    transaction_id VARCHAR(100),
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ==========================================================

-- Thêm vai trò
INSERT INTO roles (name) VALUES ('ROLE_USER'), ('ROLE_ADMIN');

-- Thêm Admin mặc định (Mật khẩu là: Admin@123)
-- Lưu ý: Password ở đây là BCrypt của "Admin@123"
INSERT INTO users (email, password, full_name, phone, enabled) 
VALUES ('admin@ironmoto.com', '$2a$10$rY7H7pU6ZqjP/vVlZz.I7.zO1y5kE0/nF0v7J8G8L8Z8Z8Z8Z8Z8Z', 'Quản trị viên', '0905000001', TRUE);

INSERT INTO user_roles (user_id, role_id) VALUES (1, 2);

-- Thêm Hãng xe
INSERT INTO brands (name, slug, active) VALUES 
('Honda', 'honda', TRUE),
('Kawasaki', 'kawasaki', TRUE),
('Yamaha', 'yamaha', TRUE),
('Ducati', 'ducati', TRUE),
('BMW Motorrad', 'bmw-motorrad', TRUE);

-- Thêm Danh mục
INSERT INTO categories (name, slug, active) VALUES 
('Sportbike', 'sportbike', TRUE),
('Naked Bike', 'naked-bike', TRUE),
('Adventure', 'adventure', TRUE),
('Cruiser', 'cruiser', TRUE);

-- 14. Bảng Reviews (Đánh giá sản phẩm)
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    motorcycle_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT,                      -- xác định đã mua hàng thật (verified purchase), có thể để NULL nếu cho phép đánh giá tự do
    rating TINYINT NOT NULL,               -- 1 đến 5 sao
    title VARCHAR(150),
    comment TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' NOT NULL,  -- admin duyệt review trước khi hiển thị
    admin_reply TEXT,                      -- admin có thể phản hồi review
    replied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
    UNIQUE KEY uq_user_motorcycle_order (user_id, motorcycle_id, order_id),  -- 1 user chỉ review 1 lần / 1 xe / 1 đơn hàng
    FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Index hỗ trợ truy vấn thống kê rating theo xe
CREATE INDEX idx_reviews_motorcycle ON reviews(motorcycle_id, status);

-- 15. Bảng Review_Images (Ảnh đính kèm đánh giá)
CREATE TABLE review_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. Bảng Contacts (Liên hệ khách hàng)
CREATE TABLE contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,                        -- NULL nếu khách chưa đăng nhập vẫn gửi được liên hệ
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM') DEFAULT 'NEW' NOT NULL,
    admin_reply TEXT,
    replied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Index hỗ trợ admin lọc theo trạng thái, sắp xếp theo thời gian
CREATE INDEX idx_contacts_status ON contacts(status, created_at);