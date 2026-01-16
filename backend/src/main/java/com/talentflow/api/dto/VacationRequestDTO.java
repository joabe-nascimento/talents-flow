package com.talentflow.api.dto;

import com.talentflow.api.entity.VacationRequest;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VacationRequestDTO {

    private Long id;

    @NotNull(message = "Funcionário é obrigatório")
    private Long employeeId;
    
    private String employeeName;
    private String employeeEmail;
    private String departmentName;

    @NotNull(message = "Data de início é obrigatória")
    private LocalDate startDate;

    @NotNull(message = "Data de fim é obrigatória")
    private LocalDate endDate;

    @NotNull(message = "Tipo é obrigatório")
    private VacationRequest.VacationType type;

    private VacationRequest.VacationStatus status;
    private String reason;
    private Integer days;

    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectionReason;

    private LocalDateTime createdAt;

    public static VacationRequestDTO fromEntity(VacationRequest entity) {
        VacationRequestDTOBuilder builder = VacationRequestDTO.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .employeeName(entity.getEmployee().getUser().getName())
                .employeeEmail(entity.getEmployee().getUser().getEmail())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .type(entity.getType())
                .status(entity.getStatus())
                .reason(entity.getReason())
                .days(entity.getDays())
                .createdAt(entity.getCreatedAt());

        if (entity.getEmployee().getDepartment() != null) {
            builder.departmentName(entity.getEmployee().getDepartment().getName());
        }

        if (entity.getApprovedBy() != null) {
            builder.approvedById(entity.getApprovedBy().getId())
                   .approvedByName(entity.getApprovedBy().getUser().getName())
                   .approvedAt(entity.getApprovedAt());
        }

        if (entity.getRejectionReason() != null) {
            builder.rejectionReason(entity.getRejectionReason());
        }

        return builder.build();
    }
}


