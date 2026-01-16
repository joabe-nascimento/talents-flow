package com.talentflow.api.dto;

import com.talentflow.api.entity.Payroll;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeePosition;
    private String departmentName;
    
    private Integer referenceMonth;
    private Integer referenceYear;
    private String referencePeriod; // "Janeiro/2026"
    
    private BigDecimal baseSalary;
    
    // Proventos
    private BigDecimal overtimeHours;
    private BigDecimal overtimeValue;
    private BigDecimal bonus;
    private BigDecimal commission;
    private BigDecimal mealAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal healthAllowance;
    private BigDecimal otherEarnings;
    private BigDecimal grossSalary;
    
    // Descontos
    private BigDecimal inssValue;
    private BigDecimal inssRate;
    private BigDecimal irrfValue;
    private BigDecimal irrfRate;
    private BigDecimal fgtsValue;
    private BigDecimal healthDiscount;
    private BigDecimal dentalDiscount;
    private BigDecimal mealDiscount;
    private BigDecimal transportDiscount;
    private BigDecimal loanDiscount;
    private BigDecimal otherDeductions;
    private BigDecimal totalDeductions;
    
    private BigDecimal netSalary;
    
    private Payroll.PayrollStatus status;
    private LocalDate paymentDate;
    private String notes;
    
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private String processedByName;

    public static PayrollDTO fromEntity(Payroll payroll) {
        String[] months = {"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"};
        
        return PayrollDTO.builder()
                .id(payroll.getId())
                .employeeId(payroll.getEmployee().getId())
                .employeeName(getEmployeeName(payroll.getEmployee()))
                .employeePosition(payroll.getEmployee().getPosition())
                .departmentName(payroll.getEmployee().getDepartment() != null ? 
                               payroll.getEmployee().getDepartment().getName() : null)
                .referenceMonth(payroll.getReferenceMonth())
                .referenceYear(payroll.getReferenceYear())
                .referencePeriod(months[payroll.getReferenceMonth() - 1] + "/" + payroll.getReferenceYear())
                .baseSalary(payroll.getBaseSalary())
                .overtimeHours(payroll.getOvertimeHours())
                .overtimeValue(payroll.getOvertimeValue())
                .bonus(payroll.getBonus())
                .commission(payroll.getCommission())
                .mealAllowance(payroll.getMealAllowance())
                .transportAllowance(payroll.getTransportAllowance())
                .healthAllowance(payroll.getHealthAllowance())
                .otherEarnings(payroll.getOtherEarnings())
                .grossSalary(payroll.getGrossSalary())
                .inssValue(payroll.getInssValue())
                .inssRate(payroll.getInssRate())
                .irrfValue(payroll.getIrrfValue())
                .irrfRate(payroll.getIrrfRate())
                .fgtsValue(payroll.getFgtsValue())
                .healthDiscount(payroll.getHealthDiscount())
                .dentalDiscount(payroll.getDentalDiscount())
                .mealDiscount(payroll.getMealDiscount())
                .transportDiscount(payroll.getTransportDiscount())
                .loanDiscount(payroll.getLoanDiscount())
                .otherDeductions(payroll.getOtherDeductions())
                .totalDeductions(payroll.getTotalDeductions())
                .netSalary(payroll.getNetSalary())
                .status(payroll.getStatus())
                .paymentDate(payroll.getPaymentDate())
                .notes(payroll.getNotes())
                .createdAt(payroll.getCreatedAt())
                .processedAt(payroll.getProcessedAt())
                .processedByName(payroll.getProcessedBy() != null ? getEmployeeName(payroll.getProcessedBy()) : null)
                .build();
    }
    
    private static String getEmployeeName(com.talentflow.api.entity.Employee employee) {
        if (employee == null) return null;
        if (employee.getUser() != null) {
            return employee.getUser().getName();
        }
        return "Funcionário #" + employee.getId();
    }
}

