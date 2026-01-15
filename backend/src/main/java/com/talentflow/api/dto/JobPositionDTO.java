package com.talentflow.api.dto;

import com.talentflow.api.entity.JobPosition;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPositionDTO {
    
    private Long id;
    
    @NotBlank(message = "Título é obrigatório")
    private String title;
    
    private String description;
    private String requirements;
    
    private Long departmentId;
    private String departmentName;
    
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    
    private JobPosition.JobType type;
    private JobPosition.JobStatus status;
    
    private LocalDate openingDate;
    private LocalDate closingDate;
    
    private Integer candidateCount;
    
    public static JobPositionDTO fromEntity(JobPosition jobPosition) {
        return JobPositionDTO.builder()
                .id(jobPosition.getId())
                .title(jobPosition.getTitle())
                .description(jobPosition.getDescription())
                .requirements(jobPosition.getRequirements())
                .departmentId(jobPosition.getDepartment() != null ? jobPosition.getDepartment().getId() : null)
                .departmentName(jobPosition.getDepartment() != null ? jobPosition.getDepartment().getName() : null)
                .salaryMin(jobPosition.getSalaryMin())
                .salaryMax(jobPosition.getSalaryMax())
                .type(jobPosition.getType())
                .status(jobPosition.getStatus())
                .openingDate(jobPosition.getOpeningDate())
                .closingDate(jobPosition.getClosingDate())
                .candidateCount(jobPosition.getCandidates() != null ? jobPosition.getCandidates().size() : 0)
                .build();
    }
}


