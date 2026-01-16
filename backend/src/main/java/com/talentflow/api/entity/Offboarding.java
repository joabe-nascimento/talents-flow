package com.talentflow.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "offboardings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offboarding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @ToString.Exclude
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TerminationType terminationType;

    @Column(name = "termination_date", nullable = false)
    private LocalDate terminationDate;

    @Column(name = "last_working_day")
    private LocalDate lastWorkingDay;

    @Column(name = "notice_date")
    private LocalDate noticeDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OffboardingStatus status = OffboardingStatus.INITIATED;

    @Column(name = "exit_interview_scheduled")
    @Builder.Default
    private Boolean exitInterviewScheduled = false;

    @Column(name = "exit_interview_date")
    private LocalDateTime exitInterviewDate;

    @Column(name = "exit_interview_completed")
    @Builder.Default
    private Boolean exitInterviewCompleted = false;

    @Column(name = "exit_interview_notes", columnDefinition = "TEXT")
    private String exitInterviewNotes;

    @Column(name = "termination_reason", columnDefinition = "TEXT")
    private String terminationReason;

    @Column(name = "rehire_eligible")
    private Boolean rehireEligible;

    @Column(name = "rehire_notes", columnDefinition = "TEXT")
    private String rehireNotes;

    // Checklist items
    @Column(name = "equipment_returned")
    @Builder.Default
    private Boolean equipmentReturned = false;

    @Column(name = "access_revoked")
    @Builder.Default
    private Boolean accessRevoked = false;

    @Column(name = "final_payment_processed")
    @Builder.Default
    private Boolean finalPaymentProcessed = false;

    @Column(name = "documents_collected")
    @Builder.Default
    private Boolean documentsCollected = false;

    @Column(name = "knowledge_transferred")
    @Builder.Default
    private Boolean knowledgeTransferred = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    @ToString.Exclude
    private Employee processedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TerminationType {
        VOLUNTARY,           // Pedido de demissão
        INVOLUNTARY,         // Demissão sem justa causa
        JUST_CAUSE,          // Demissão por justa causa
        MUTUAL_AGREEMENT,    // Acordo mútuo
        CONTRACT_END,        // Fim de contrato
        RETIREMENT,          // Aposentadoria
        DEATH                // Falecimento
    }

    public enum OffboardingStatus {
        INITIATED,
        IN_PROGRESS,
        PENDING_EXIT_INTERVIEW,
        PENDING_DOCUMENTS,
        PENDING_PAYMENT,
        COMPLETED,
        CANCELLED
    }
}


