package com.example.IRON.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "deposit_change_logs")
@Getter
@Setter
public class DepositChangeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "deposit_id", nullable = false)
    private Long depositId;

    @Column(name = "actor_id", nullable = false)
    private Long actorId;

    @Column(name = "actor_email", length = 100)
    private String actorEmail;

    @Column(name = "old_status", length = 20)
    private String oldStatus;

    @Column(name = "new_status", length = 20)
    private String newStatus;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String note;

    public DepositChangeLog() {}

    public DepositChangeLog(Long depositId, Long actorId, String actorEmail, String oldStatus, String newStatus, String note) {
        this.depositId = depositId;
        this.actorId = actorId;
        this.actorEmail = actorEmail;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.note = note;
        this.changedAt = LocalDateTime.now();
    }
}
