package com.talentflow.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employee_onboardings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeOnboarding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @ToString.Exclude
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    @ToString.Exclude
    private OnboardingTemplate template;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expected_end_date")
    private LocalDate expectedEndDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OnboardingStatus status = OnboardingStatus.IN_PROGRESS;

    @Column(name = "progress_percentage")
    @Builder.Default
    private Integer progressPercentage = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    @ToString.Exclude
    private Employee mentor;

    @OneToMany(mappedBy = "onboarding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<OnboardingTask> tasks = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String notes;

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

    public enum OnboardingStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}

