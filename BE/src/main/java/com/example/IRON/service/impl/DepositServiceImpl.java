package com.example.IRON.service.impl;

import com.example.IRON.dto.request.CreateDepositRequest;
import com.example.IRON.dto.response.DepositResponse;
import com.example.IRON.entity.*;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.*;
import com.example.IRON.service.interfaces.DepositService;
import com.example.IRON.service.interfaces.NotificationService;
import com.example.IRON.service.PayOSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepositServiceImpl implements DepositService {

    private final DepositRepository depositRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final MotorcycleRepository motorcycleRepository;
    private final DepositChangeLogRepository depositChangeLogRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final PayOSService payOSService;

    @Value("${deposit.default-percentage:10}")
    private double defaultPercentage;

    @Value("${deposit.minimum-amount:2000000}")
    private BigDecimal minimumAmount;

    @Value("${deposit.maximum-percentage:30}")
    private double maximumPercentage;

    @Value("${deposit.deadline-days:7}")
    private int deadlineDays;

    @Override
    @Transactional
    public DepositResponse createDeposit(Long userId, Long orderId, CreateDepositRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền đặt cọc cho đơn hàng này");
        }

        if (depositRepository.existsByUserIdAndOrderId(userId, orderId)) {
            throw new RuntimeException("Bạn đã đặt cọc cho đơn hàng này rồi");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Đơn hàng này không thể đặt cọc");
        }

        BigDecimal totalAmount = order.getTotalAmount();
        BigDecimal depositAmount = request.getDepositAmount();
        String paymentMethod = request.getPaymentMethod() != null
                ? request.getPaymentMethod().toUpperCase()
                : "CASH";

        if (depositAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền cọc phải lớn hơn 0");
        }
        if (depositAmount.compareTo(totalAmount) > 0) {
            throw new RuntimeException("Số tiền cọc không được vượt quá tổng giá trị đơn hàng");
        }

        BigDecimal remainingAmount = totalAmount.subtract(depositAmount);

        Deposit.PaymentMethod depositPaymentMethod;
        Payment.PaymentMethod paymentEntityMethod;
        if ("PAYOS".equalsIgnoreCase(paymentMethod)) {
            depositPaymentMethod = Deposit.PaymentMethod.PAYOS;
            paymentEntityMethod = Payment.PaymentMethod.PAYOS;
        } else {
            depositPaymentMethod = Deposit.PaymentMethod.CASH;
            paymentEntityMethod = Payment.PaymentMethod.CASH;
        }

        Deposit deposit = new Deposit();
        deposit.setOrder(order);
        deposit.setUser(user);
        deposit.setDepositAmount(depositAmount);
        deposit.setTotalAmount(totalAmount);
        deposit.setRemainingAmount(remainingAmount);
        deposit.setStatus(Deposit.DepositStatus.PENDING);
        deposit.setPaymentMethod(depositPaymentMethod);
        deposit.setDeadlineDate(LocalDateTime.now().plusDays(deadlineDays));

        Deposit savedDeposit = depositRepository.save(deposit);

        order.setStatus(Order.OrderStatus.DEPOSITED);
        orderRepository.save(order);

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment == null) {
            payment = new Payment();
            payment.setOrder(order);
        }
        payment.setAmount(depositAmount);
        payment.setPaymentMethod(paymentEntityMethod);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);

        if (paymentEntityMethod == Payment.PaymentMethod.PAYOS) {
            try {
                Map<String, Object> payosResult = payOSService.createPaymentLink(
                        order.getId(),
                        depositAmount,
                        "Dat coc don " + order.getOrderCode()
                );
                String checkoutUrl = (String) payosResult.get("checkoutUrl");
                String qrCode = (String) payosResult.get("qrCode");
                String qrCodeUrl = (String) payosResult.get("qrCodeUrl");
                String payosOrderCode = (String) payosResult.get("orderCode");

                payment.setPaymentUrl(checkoutUrl);
                payment.setQrCodeUrl(qrCodeUrl);
                payment.setPayosOrderCode(payosOrderCode);
                paymentRepository.save(payment);

                return toResponse(savedDeposit, checkoutUrl, qrCodeUrl, payosOrderCode);
            } catch (Exception e) {
                log.error("Failed to create PayOS payment link for deposit " + savedDeposit.getId(), e);
                throw new RuntimeException("Không thể tạo link thanh toán PayOS: " + e.getMessage());
            }
        }

        depositChangeLogRepository.save(new DepositChangeLog(
                savedDeposit.getId(),
                userId,
                user.getEmail(),
                null,
                Deposit.DepositStatus.PENDING.name(),
                "Tạo yêu cầu đặt cọc"
        ));

        notificationService.createNotification(
                "DEPOSIT",
                "Đặt cọc mới",
                "Bạn đã đặt cọc " + depositAmount + " VND cho đơn hàng " + order.getOrderCode(),
                "/my-deposits",
                savedDeposit.getId()
        );

        emailService.sendDepositCreated(
                user.getEmail(),
                user.getFullName(),
                order.getOrderCode(),
                depositAmount.toPlainString(),
                remainingAmount.toPlainString(),
                savedDeposit.getDeadlineDate().toString()
        );

        return toResponse(savedDeposit, null, null, null);
    }

    @Override
    public DepositResponse getDepositByOrderId(Long orderId) {
        Deposit deposit = depositRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit", "orderId", orderId));
        return toResponse(deposit);
    }

    @Override
    public DepositResponse getMyDeposit(Long depositId, Long userId) {
        Deposit deposit = depositRepository.findById(depositId)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit", "id", depositId));

        if (!deposit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xem thông tin này");
        }

        return toResponse(deposit);
    }

    @Override
    public Page<DepositResponse> getMyDeposits(Long userId, Pageable pageable) {
        return depositRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public DepositResponse payRemaining(Long depositId, Long userId) {
        Deposit deposit = depositRepository.findById(depositId)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit", "id", depositId));

        if (!deposit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thanh toán đơn này");
        }

        if (deposit.getStatus() != Deposit.DepositStatus.DEPOSITED) {
            throw new RuntimeException("Đơn hàng này không thể thanh toán phần còn lại");
        }

        Order order = deposit.getOrder();
        order.setStatus(Order.OrderStatus.AWAITING_FINAL_PAYMENT);
        orderRepository.save(order);

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment == null) {
            payment = new Payment();
            payment.setOrder(order);
        }
        payment.setAmount(deposit.getRemainingAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.PAYOS);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);

        depositChangeLogRepository.save(new DepositChangeLog(
                deposit.getId(),
                userId,
                deposit.getUser().getEmail(),
                deposit.getStatus().name(),
                Deposit.DepositStatus.DEPOSITED.name(),
                "Yêu cầu thanh toán phần còn lại"
        ));

        return toResponse(deposit);
    }

    @Override
    @Transactional
    public DepositResponse updateStatus(Long depositId, String status, String note, Long actorId, String actorEmail) {
        Deposit deposit = depositRepository.findById(depositId)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit", "id", depositId));

        String oldStatus = deposit.getStatus().name();
        Deposit.DepositStatus newStatus = Deposit.DepositStatus.valueOf(status);

        if (newStatus == Deposit.DepositStatus.CANCELLED && deposit.getStatus() == Deposit.DepositStatus.COMPLETED) {
            throw new RuntimeException("Không thể hủy đơn đã hoàn tất");
        }

        deposit.setStatus(newStatus);
        deposit.setNote(note);
        Deposit savedDeposit = depositRepository.save(deposit);

        Order order = deposit.getOrder();
        if (newStatus == Deposit.DepositStatus.CANCELLED) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);

            int restoredStock = restoreMotorcycleStock(order);
        } else if (newStatus == Deposit.DepositStatus.COMPLETED) {
            order.setStatus(Order.OrderStatus.COMPLETED);
            orderRepository.save(order);
        }

        depositChangeLogRepository.save(new DepositChangeLog(
                depositId,
                actorId,
                actorEmail,
                oldStatus,
                newStatus.name(),
                note
        ));

        return toResponse(savedDeposit);
    }

    @Override
    public Page<DepositResponse> getAllDeposits(Pageable pageable) {
        return depositRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public DepositResponse getDepositById(Long id) {
        Deposit deposit = depositRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit", "id", id));
        return toResponse(deposit);
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cancelExpiredDeposits() {
        List<Deposit> expiredDeposits = depositRepository.findByDeadlineDateBeforeAndStatus(
                LocalDateTime.now(),
                Deposit.DepositStatus.DEPOSITED
        );

        for (Deposit deposit : expiredDeposits) {
            try {
                deposit.setStatus(Deposit.DepositStatus.CANCELLED);
                deposit.setNote("Tự động hủy do quá hạn thanh toán");
                depositRepository.save(deposit);

                Order order = deposit.getOrder();
                order.setStatus(Order.OrderStatus.CANCELLED);
                orderRepository.save(order);

                restoreMotorcycleStock(order);

                depositChangeLogRepository.save(new DepositChangeLog(
                        deposit.getId(),
                        0L,
                        "SYSTEM",
                        Deposit.DepositStatus.DEPOSITED.name(),
                        Deposit.DepositStatus.CANCELLED.name(),
                        "Tự động hủy do quá hạn"
                ));

                notificationService.createNotification(
                        "DEPOSIT",
                        "Đơn đặt cọc đã hủy",
                        "Đơn hàng " + order.getOrderCode() + " đã bị hủy do quá hạn thanh toán",
                        "/my-deposits",
                        deposit.getId()
                );

                emailService.sendDepositExpired(
                        deposit.getUser().getEmail(),
                        deposit.getUser().getFullName(),
                        order.getOrderCode()
                );
            } catch (Exception e) {
                System.err.println("Failed to cancel deposit " + deposit.getId() + ": " + e.getMessage());
            }
        }
    }

    private int restoreMotorcycleStock(Order order) {
        int restored = 0;
        for (OrderDetail detail : order.getOrderDetails()) {
            Motorcycle motorcycle = detail.getMotorcycle();
            if (motorcycle.getStock() != null) {
                motorcycle.setStock(motorcycle.getStock() + detail.getQuantity());
                motorcycleRepository.save(motorcycle);
                restored++;
            }
        }
        return restored;
    }

    private DepositResponse toResponse(Deposit deposit) {
        return toResponse(deposit, null, null, null);
    }

    private DepositResponse toResponse(Deposit deposit, String paymentUrl, String qrCodeUrl, String payosOrderCode) {
        DepositResponse res = new DepositResponse();
        res.setId(deposit.getId());
        res.setOrderId(deposit.getOrder().getId());
        res.setOrderCode(deposit.getOrder().getOrderCode());
        res.setUserId(deposit.getUser().getId());
        res.setUserEmail(deposit.getUser().getEmail());
        res.setUserName(deposit.getUser().getFullName());
        res.setDepositAmount(deposit.getDepositAmount());
        res.setTotalAmount(deposit.getTotalAmount());
        res.setRemainingAmount(deposit.getRemainingAmount());
        res.setStatus(deposit.getStatus().name());
        res.setDeadlineDate(deposit.getDeadlineDate());
        res.setCreatedAt(deposit.getCreatedAt());
        res.setNote(deposit.getNote());
        res.setPaymentMethod(deposit.getPaymentMethod() != null ? deposit.getPaymentMethod().name() : null);
        res.setPaymentUrl(paymentUrl);
        res.setQrCodeUrl(qrCodeUrl);
        res.setPayosOrderCode(payosOrderCode);
        return res;
    }
}
