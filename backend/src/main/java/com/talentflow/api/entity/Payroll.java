package com.talentflow.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Entity
@Table(name = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @ToString.Exclude
    private Employee employee;

    @Column(name = "reference_month", nullable = false)
    private Integer referenceMonth;

    @Column(name = "reference_year", nullable = false)
    private Integer referenceYear;

    @Column(name = "base_salary", precision = 10, scale = 2, nullable = false)
    private BigDecimal baseSalary;

    // Proventos (adições)
    @Column(name = "overtime_hours", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Column(name = "overtime_value", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal overtimeValue = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal bonus = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal commission = BigDecimal.ZERO;

    @Column(name = "meal_allowance", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal mealAllowance = BigDecimal.ZERO;

    @Column(name = "transport_allowance", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal transportAllowance = BigDecimal.ZERO;

    @Column(name = "health_allowance", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal healthAllowance = BigDecimal.ZERO;

    @Column(name = "other_earnings", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal otherEarnings = BigDecimal.ZERO;

    @Column(name = "gross_salary", precision = 10, scale = 2)
    private BigDecimal grossSalary;

    // Descontos
    @Column(name = "inss_value", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal inssValue = BigDecimal.ZERO;

    @Column(name = "inss_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal inssRate = BigDecimal.ZERO;

    @Column(name = "irrf_value", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal irrfValue = BigDecimal.ZERO;

    @Column(name = "irrf_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal irrfRate = BigDecimal.ZERO;

    @Column(name = "fgts_value", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal fgtsValue = BigDecimal.ZERO;

    @Column(name = "health_discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal healthDiscount = BigDecimal.ZERO;

    @Column(name = "dental_discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal dentalDiscount = BigDecimal.ZERO;

    @Column(name = "meal_discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal mealDiscount = BigDecimal.ZERO;

    @Column(name = "transport_discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal transportDiscount = BigDecimal.ZERO;

    @Column(name = "loan_discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal loanDiscount = BigDecimal.ZERO;

    @Column(name = "other_deductions", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(name = "total_deductions", precision = 10, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_salary", precision = 10, scale = 2)
    private BigDecimal netSalary;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.DRAFT;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    @ToString.Exclude
    private Employee processedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PayrollStatus {
        DRAFT,       // Rascunho
        CALCULATED,  // Calculado
        APPROVED,    // Aprovado
        PAID,        // Pago
        CANCELLED    // Cancelado
    }
}

