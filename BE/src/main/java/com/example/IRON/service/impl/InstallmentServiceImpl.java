package com.example.IRON.service.impl;

import com.example.IRON.dto.request.InstallmentRequest;
import com.example.IRON.dto.response.InstallmentResponse;
import com.example.IRON.entity.Installment;
import com.example.IRON.entity.Motorcycle;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.User;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.InstallmentRepository;
import com.example.IRON.repository.MotorcycleRepository;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.InstallmentService;
import com.example.IRON.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InstallmentServiceImpl implements InstallmentService {

    private final InstallmentRepository installmentRepository;
    private final UserRepository userRepository;
    private final MotorcycleRepository motorcycleRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public InstallmentResponse createInstallment(Long userId, InstallmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Motorcycle motorcycle = motorcycleRepository.findById(request.getMotorcycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle", "id", request.getMotorcycleId()));

        Installment installment = new Installment();
        installment.setFullName(request.getFullName());
        installment.setPhone(request.getPhone());
        installment.setEmail(request.getEmail());
        installment.setIdCardNumber(request.getIdCardNumber());
        installment.setMonthlyIncome(request.getMonthlyIncome());
        installment.setDownPayment(request.getDownPayment());
        installment.setInstallmentMonths(request.getInstallmentMonths());
        installment.setMotorcycleId(request.getMotorcycleId());
        installment.setMotorcycleName(motorcycle.getName());
        installment.setCustomerNote(request.getCustomerNote());
        installment.setStatus(Installment.Status.PENDING);
        installment.setUser(user);

        if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));
            installment.setOrder(order);
        }

        Installment saved = installmentRepository.save(installment);

        notificationService.createNotification(
                "INSTALLMENT",
                "Yêu cầu trả góp mới",
                request.getFullName() + " đăng ký trả góp " + motorcycle.getName(),
                "/admin/installment-requests",
                saved.getId()
        );

        return toResponse(saved);
    }

    @Override
    public Page<InstallmentResponse> getMyInstallments(Long userId, Pageable pageable) {
        return installmentRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    @Override
    public InstallmentResponse getMyInstallment(Long installmentId, Long userId) {
        Installment installment = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment", "id", installmentId));
        if (!installment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xem yêu cầu này");
        }
        return toResponse(installment);
    }

    @Override
    public Page<InstallmentResponse> getAllInstallments(Pageable pageable, String status) {
        if (status != null && !status.isEmpty()) {
            Installment.Status enumStatus = Installment.Status.valueOf(status);
            return installmentRepository.findByStatus(enumStatus, pageable).map(this::toResponse);
        }
        return installmentRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public InstallmentResponse getInstallmentById(Long id) {
        Installment installment = installmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Installment", "id", id));
        return toResponse(installment);
    }

    @Override
    @Transactional
    public InstallmentResponse updateStatus(Long installmentId, String status, String note) {
        Installment installment = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment", "id", installmentId));
        installment.setStatus(Installment.Status.valueOf(status));
        installment.setAdminNote(note);
        Installment saved = installmentRepository.save(installment);
        return toResponse(saved);
    }

    @Override
    public void deleteInstallment(Long installmentId) {
        Installment installment = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment", "id", installmentId));
        installmentRepository.delete(installment);
    }

    private InstallmentResponse toResponse(Installment installment) {
        InstallmentResponse res = new InstallmentResponse();
        res.setId(installment.getId());
        res.setOrderId(installment.getOrder() != null ? installment.getOrder().getId() : null);
        res.setFullName(installment.getFullName());
        res.setPhone(installment.getPhone());
        res.setEmail(installment.getEmail());
        res.setIdCardNumber(installment.getIdCardNumber());
        res.setMonthlyIncome(installment.getMonthlyIncome());
        res.setDownPayment(installment.getDownPayment());
        res.setInstallmentMonths(installment.getInstallmentMonths());
        res.setMotorcycleId(installment.getMotorcycleId());
        res.setMotorcycleName(installment.getMotorcycleName());
        res.setCustomerNote(installment.getCustomerNote());
        res.setStatus(installment.getStatus().name());
        res.setAdminNote(installment.getAdminNote());
        res.setCreatedAt(installment.getCreatedAt());
        return res;
    }
}
