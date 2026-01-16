package com.talentflow.api.dto;

import com.talentflow.api.entity.Offboarding;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OffboardingDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String employeePosition;
    private String departmentName;
    
    private Offboarding.TerminationType terminationType;
    private String terminationTypeLabel;
    
    private LocalDate terminationDate;
    private LocalDate lastWorkingDay;
    private LocalDate noticeDate;
    
    private Offboarding.OffboardingStatus status;
    
    private Boolean exitInterviewScheduled;
    private LocalDateTime exitInterviewDate;
    private Boolean exitInterviewCompleted;
    private String exitInterviewNotes;
    
    private String terminationReason;
    private Boolean rehireEligible;
    private String rehireNotes;
    
    // Checklist
    private Boolean equipmentReturned;
    private Boolean accessRevoked;
    private Boolean finalPaymentProcessed;
    private Boolean documentsCollected;
    private Boolean knowledgeTransferred;
    private Integer checklistProgress;
    
    private String processedByName;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public static OffboardingDTO fromEntity(Offboarding offboarding) {
        int checklistItems = 5;
        int completed = 0;
        if (Boolean.TRUE.equals(offboarding.getEquipmentReturned())) completed++;
        if (Boolean.TRUE.equals(offboarding.getAccessRevoked())) completed++;
        if (Boolean.TRUE.equals(offboarding.getFinalPaymentProcessed())) completed++;
        if (Boolean.TRUE.equals(offboarding.getDocumentsCollected())) completed++;
        if (Boolean.TRUE.equals(offboarding.getKnowledgeTransferred())) completed++;
        
        return OffboardingDTO.builder()
                .id(offboarding.getId())
                .employeeId(offboarding.getEmployee().getId())
                .employeeName(getEmployeeName(offboarding.getEmployee()))
                .employeeEmail(getEmployeeEmail(offboarding.getEmployee()))
                .employeePosition(offboarding.getEmployee().getPosition())
                .departmentName(offboarding.getEmployee().getDepartment() != null ?
                               offboarding.getEmployee().getDepartment().getName() : null)
                .terminationType(offboarding.getTerminationType())
                .terminationTypeLabel(getTerminationTypeLabel(offboarding.getTerminationType()))
                .terminationDate(offboarding.getTerminationDate())
                .lastWorkingDay(offboarding.getLastWorkingDay())
                .noticeDate(offboarding.getNoticeDate())
                .status(offboarding.getStatus())
                .exitInterviewScheduled(offboarding.getExitInterviewScheduled())
                .exitInterviewDate(offboarding.getExitInterviewDate())
                .exitInterviewCompleted(offboarding.getExitInterviewCompleted())
                .exitInterviewNotes(offboarding.getExitInterviewNotes())
                .terminationReason(offboarding.getTerminationReason())
                .rehireEligible(offboarding.getRehireEligible())
                .rehireNotes(offboarding.getRehireNotes())
                .equipmentReturned(offboarding.getEquipmentReturned())
                .accessRevoked(offboarding.getAccessRevoked())
                .finalPaymentProcessed(offboarding.getFinalPaymentProcessed())
                .documentsCollected(offboarding.getDocumentsCollected())
                .knowledgeTransferred(offboarding.getKnowledgeTransferred())
                .checklistProgress((completed * 100) / checklistItems)
                .processedByName(offboarding.getProcessedBy() != null ? getEmployeeName(offboarding.getProcessedBy()) : null)
                .createdAt(offboarding.getCreatedAt())
                .completedAt(offboarding.getCompletedAt())
                .build();
    }
    
    private static String getEmployeeName(com.talentflow.api.entity.Employee employee) {
        if (employee == null) return null;
        if (employee.getUser() != null) {
            return employee.getUser().getName();
        }
        return "Funcionário #" + employee.getId();
    }
    
    private static String getEmployeeEmail(com.talentflow.api.entity.Employee employee) {
        if (employee == null) return null;
        if (employee.getUser() != null) {
            return employee.getUser().getEmail();
        }
        return null;
    }

    private static String getTerminationTypeLabel(Offboarding.TerminationType type) {
        return switch (type) {
            case VOLUNTARY -> "Pedido de Demissão";
            case INVOLUNTARY -> "Demissão Sem Justa Causa";
            case JUST_CAUSE -> "Demissão Por Justa Causa";
            case MUTUAL_AGREEMENT -> "Acordo Mútuo";
            case CONTRACT_END -> "Fim de Contrato";
            case RETIREMENT -> "Aposentadoria";
            case DEATH -> "Falecimento";
        };
    }
}

