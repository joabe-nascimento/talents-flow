package com.talentflow.api.dto;

import com.talentflow.api.entity.PerformanceReview;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class PerformanceReviewDTO {

    private Long id;

    @NotNull(message = "Funcionário é obrigatório")
    private Long employeeId;
    private String employeeName;
    private String employeePosition;
    private String departmentName;

    @NotNull(message = "Avaliador é obrigatório")
    private Long reviewerId;
    private String reviewerName;

    @NotNull(message = "Data da avaliação é obrigatória")
    private LocalDate reviewDate;

    private String reviewPeriod;

    @NotNull(message = "Nota é obrigatória")
    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    private Integer rating;

    private String strengths;
    private String areasForImprovement;
    private String goals;
    private String comments;

    private PerformanceReview.ReviewStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PerformanceReviewDTO fromEntity(PerformanceReview entity) {
        PerformanceReviewDTOBuilder builder = PerformanceReviewDTO.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .employeeName(entity.getEmployee().getUser().getName())
                .employeePosition(entity.getEmployee().getPosition())
                .reviewerId(entity.getReviewer().getId())
                .reviewerName(entity.getReviewer().getUser().getName())
                .reviewDate(entity.getReviewDate())
                .reviewPeriod(entity.getReviewPeriod())
                .rating(entity.getRating())
                .strengths(entity.getStrengths())
                .areasForImprovement(entity.getAreasForImprovement())
                .goals(entity.getGoals())
                .comments(entity.getComments())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt());

        if (entity.getEmployee().getDepartment() != null) {
            builder.departmentName(entity.getEmployee().getDepartment().getName());
        }

        return builder.build();
    }
}



