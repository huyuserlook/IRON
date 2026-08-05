package com.example.IRON.service.impl;

import com.example.IRON.dto.response.NotificationResponse;
import com.example.IRON.entity.Booking;
import com.example.IRON.entity.Contact;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.Review;
import com.example.IRON.entity.User;
import com.example.IRON.repository.BookingRepository;
import com.example.IRON.repository.ContactRepository;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.ReviewRepository;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.NotificationService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;
    private final ContactRepository contactRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(OrderRepository orderRepository,
                                   BookingRepository bookingRepository,
                                   ContactRepository contactRepository,
                                   ReviewRepository reviewRepository,
                                   UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.bookingRepository = bookingRepository;
        this.contactRepository = contactRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @Override
    public long getUnreadCount() {
        LocalDateTime since = LocalDateTime.now().minusDays(1);
        return orderRepository.countNewOrders(since)
                + bookingRepository.countNewBookings(since)
                + contactRepository.countNewContacts(since)
                + reviewRepository.countNewReviews(since)
                + userRepository.countNewUsers(since);
    }

    @Override
    public List<NotificationResponse> getRecent(int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(1);
        List<NotificationResponse> notifications = new ArrayList<>();

        // Đơn hàng mới
        orderRepository.findNewOrders(since, PageRequest.of(0, limit))
                .forEach(o -> notifications.add(
                        NotificationResponse.builder()
                                .type("ORDER")
                                .title("Đơn hàng mới")
                                .message(generateOrderMessage(o))
                                .link("/admin/orders")
                                .createdAt(o.getCreatedAt())
                                .build()));

        // Lịch lái thử mới
        bookingRepository.findNewBookings(since, PageRequest.of(0, limit))
                .forEach(b -> notifications.add(
                        NotificationResponse.builder()
                                .type("BOOKING")
                                .title("Lịch lái thử mới")
                                .message(generateBookingMessage(b))
                                .link("/admin/bookings")
                                .createdAt(b.getCreatedAt())
                                .build()));

        // Liên hệ mới
        contactRepository.findNewContacts(since, PageRequest.of(0, limit))
                .forEach(c -> notifications.add(
                        NotificationResponse.builder()
                                .type("CONTACT")
                                .title("Liên hệ mới")
                                .message(generateContactMessage(c))
                                .link("/admin/contacts")
                                .createdAt(c.getCreatedAt())
                                .build()));

        // Đánh giá mới
        reviewRepository.findNewReviews(since, PageRequest.of(0, limit))
                .forEach(r -> notifications.add(
                        NotificationResponse.builder()
                                .type("REVIEW")
                                .title("Đánh giá mới")
                                .message(generateReviewMessage(r))
                                .link("/admin/reviews")
                                .createdAt(r.getCreatedAt())
                                .build()));

        // Người dùng mới
        userRepository.findNewUsers(since, PageRequest.of(0, limit))
                .forEach(u -> notifications.add(
                        NotificationResponse.builder()
                                .type("USER")
                                .title("Người dùng mới")
                                .message(u.getFullName() + " (" + u.getEmail() + ")")
                                .link("/admin/users")
                                .createdAt(u.getCreatedAt())
                                .build()));

        // Sắp xếp theo thời gian giảm dần và giới hạn
        notifications.sort(Comparator.comparing(
                NotificationResponse::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return notifications.stream().limit(limit).toList();
    }

    private String generateOrderMessage(Order o) {
        String customer = o.getUser() != null ? o.getUser().getFullName() : "Khách hàng";
        String code = o.getOrderCode() != null ? o.getOrderCode() : ("#" + o.getId());
        return "Đơn hàng " + code + " từ " + customer
                + (o.getTotalAmount() != null ? " - " + o.getTotalAmount().toPlainString() + " VND" : "");
    }

    private String generateBookingMessage(Booking b) {
        String customer = b.getCustomerName() != null ? b.getCustomerName() : "Khách hàng";
        String bike = b.getMotorcycle() != null ? b.getMotorcycle().getName() : "Xe";
        return customer + " đặt lịch lái thử " + bike;
    }

    private String generateContactMessage(Contact c) {
        String name = c.getFullName() != null ? c.getFullName() : c.getName();
        String subject = c.getSubject() != null ? c.getSubject() : "Liên hệ mới";
        return name + " gửi liên hệ: " + subject;
    }

    private String generateReviewMessage(Review r) {
        String customer = r.getCustomerName() != null ? r.getCustomerName() : "Khách hàng";
        String bike = r.getMotorcycle() != null ? r.getMotorcycle().getName() : "Sản phẩm";
        String stars = r.getRating() != null ? (" - " + r.getRating() + " sao") : "";
        return customer + " đánh giá " + bike + stars;
    }
}
