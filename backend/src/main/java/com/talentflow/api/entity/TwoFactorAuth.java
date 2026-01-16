package com.talentflow.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "two_factor_auth")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TwoFactorAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @ToString.Exclude
    private User user;

    @Column(name = "is_enabled")
    @Builder.Default
    private Boolean isEnabled = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "method")
    @Builder.Default
    private TwoFactorMethod method = TwoFactorMethod.EMAIL;

    @Column(name = "secret_key")
    private String secretKey;

    @Column(name = "backup_codes", columnDefinition = "TEXT")
    private String backupCodes;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TwoFactorMethod {
        EMAIL,
        SMS,
        AUTHENTICATOR
    }
}

