package com.talentflow.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "onboarding_id", nullable = false)
    @ToString.Exclude
    private EmployeeOnboarding onboarding;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OnboardingTaskTemplate.TaskCategory category;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "is_required")
    @Builder.Default
    private Boolean isRequired = true;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    @ToString.Exclude
    private Employee assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by")
    @ToString.Exclude
    private Employee completedBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

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

    public enum TaskStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        SKIPPED,
        BLOCKED
    }
}

