package com.talentflow.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;

@Entity
@Table(name = "time_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @ToString.Exclude
    private Employee employee;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "clock_in")
    private LocalTime clockIn;

    @Column(name = "lunch_out")
    private LocalTime lunchOut;

    @Column(name = "lunch_in")
    private LocalTime lunchIn;

    @Column(name = "clock_out")
    private LocalTime clockOut;

    @Column(name = "worked_minutes")
    private Integer workedMinutes;

    @Column(name = "overtime_minutes")
    private Integer overtimeMinutes;

    @Column(name = "late_minutes")
    private Integer lateMinutes;

    @Column(name = "early_departure_minutes")
    private Integer earlyDepartureMinutes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecordType type = RecordType.NORMAL;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecordStatus status = RecordStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String justification;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column
    private String location;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @ToString.Exclude
    private Employee approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum RecordType {
        NORMAL,       // Dia normal
        HOME_OFFICE,  // Trabalho remoto
        EXTERNAL,     // Trabalho externo
        HOLIDAY,      // Feriado trabalhado
        WEEKEND       // Fim de semana trabalhado
    }

    public enum RecordStatus {
        PENDING,   // Pendente de aprovação
        APPROVED,  // Aprovado
        REJECTED,  // Rejeitado
        JUSTIFIED  // Justificado
    }
}


