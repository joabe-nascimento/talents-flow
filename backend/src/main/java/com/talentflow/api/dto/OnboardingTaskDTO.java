package com.talentflow.api.dto;

import com.talentflow.api.entity.OnboardingTask;
import com.talentflow.api.entity.OnboardingTaskTemplate;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingTaskDTO {

    private Long id;
    private Long onboardingId;
    
    private String title;
    private String description;
    private OnboardingTaskTemplate.TaskCategory category;
    private String categoryLabel;
    
    private Integer orderIndex;
    private LocalDate dueDate;
    private Boolean isOverdue;
    
    private Boolean isRequired;
    private OnboardingTask.TaskStatus status;
    
    private Long assignedToId;
    private String assignedToName;
    
    private Long completedById;
    private String completedByName;
    private LocalDateTime completedAt;
    
    private String notes;

    public static OnboardingTaskDTO fromEntity(OnboardingTask task) {
        boolean isOverdue = task.getDueDate() != null && 
                           task.getStatus() != OnboardingTask.TaskStatus.COMPLETED &&
                           task.getStatus() != OnboardingTask.TaskStatus.SKIPPED &&
                           task.getDueDate().isBefore(LocalDate.now());
        
        return OnboardingTaskDTO.builder()
                .id(task.getId())
                .onboardingId(task.getOnboarding().getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .category(task.getCategory())
                .categoryLabel(getCategoryLabel(task.getCategory()))
                .orderIndex(task.getOrderIndex())
                .dueDate(task.getDueDate())
                .isOverdue(isOverdue)
                .isRequired(task.getIsRequired())
                .status(task.getStatus())
                .assignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .assignedToName(task.getAssignedTo() != null ? getEmployeeName(task.getAssignedTo()) : null)
                .completedById(task.getCompletedBy() != null ? task.getCompletedBy().getId() : null)
                .completedByName(task.getCompletedBy() != null ? getEmployeeName(task.getCompletedBy()) : null)
                .completedAt(task.getCompletedAt())
                .notes(task.getNotes())
                .build();
    }
    
    private static String getEmployeeName(com.talentflow.api.entity.Employee employee) {
        if (employee == null) return null;
        if (employee.getUser() != null) {
            return employee.getUser().getName();
        }
        return "Funcionário #" + employee.getId();
    }

    private static String getCategoryLabel(OnboardingTaskTemplate.TaskCategory category) {
        return switch (category) {
            case DOCUMENTATION -> "Documentação";
            case IT_SETUP -> "TI / Sistemas";
            case TRAINING -> "Treinamento";
            case INTRODUCTION -> "Apresentação";
            case COMPLIANCE -> "Compliance";
            case EQUIPMENT -> "Equipamentos";
            case ACCESS -> "Acessos";
            case OTHER -> "Outros";
        };
    }
}

