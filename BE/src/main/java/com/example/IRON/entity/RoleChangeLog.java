package com.example.IRON.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_change_logs")
@Getter
@Setter
public class RoleChangeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id", nullable = false)
    private Long actorUserId;

    @Column(name = "actor_email", length = 100)
    private String actorEmail;

    @Column(name = "target_user_id", nullable = false)
    private Long targetUserId;

    @Column(name = "target_email", length = 100)
    private String targetEmail;

    @Column(name = "old_role", length = 50)
    private String oldRole;

    @Column(name = "new_role", length = 50)
    private String newRole;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String note;

    public RoleChangeLog() {}

    public RoleChangeLog(Long actorUserId, String actorEmail, Long targetUserId, String targetEmail, String oldRole, String newRole, String note) {
        this.actorUserId = actorUserId;
        this.actorEmail = actorEmail;
        this.targetUserId = targetUserId;
        this.targetEmail = targetEmail;
        this.oldRole = oldRole;
        this.newRole = newRole;
        this.note = note;
    }
}
