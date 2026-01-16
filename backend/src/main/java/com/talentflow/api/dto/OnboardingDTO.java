package com.talentflow.api.dto;

import com.talentflow.api.entity.EmployeeOnboarding;
import com.talentflow.api.entity.OnboardingTask;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String employeePosition;
    private String departmentName;
    
    private Long templateId;
    private String templateName;
    
    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private LocalDate actualEndDate;
    
    private EmployeeOnboarding.OnboardingStatus status;
    private Integer progressPercentage;
    
    private Long mentorId;
    private String mentorName;
    
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer pendingTasks;
    
    private List<OnboardingTaskDTO> tasks;
    
    private String notes;
    private LocalDateTime createdAt;

    public static OnboardingDTO fromEntity(EmployeeOnboarding onboarding) {
        List<OnboardingTaskDTO> taskDTOs = onboarding.getTasks() != null ?
                onboarding.getTasks().stream()
                        .map(OnboardingTaskDTO::fromEntity)
                        .collect(Collectors.toList()) : List.of();
        
        int completed = (int) taskDTOs.stream()
                .filter(t -> t.getStatus() == OnboardingTask.TaskStatus.COMPLETED)
                .count();
        
        return OnboardingDTO.builder()
                .id(onboarding.getId())
                .employeeId(onboarding.getEmployee().getId())
                .employeeName(getEmployeeName(onboarding.getEmployee()))
                .employeeEmail(getEmployeeEmail(onboarding.getEmployee()))
                .employeePosition(onboarding.getEmployee().getPosition())
                .departmentName(onboarding.getEmployee().getDepartment() != null ?
                               onboarding.getEmployee().getDepartment().getName() : null)
                .templateId(onboarding.getTemplate() != null ? onboarding.getTemplate().getId() : null)
                .templateName(onboarding.getTemplate() != null ? onboarding.getTemplate().getName() : null)
                .startDate(onboarding.getStartDate())
                .expectedEndDate(onboarding.getExpectedEndDate())
                .actualEndDate(onboarding.getActualEndDate())
                .status(onboarding.getStatus())
                .progressPercentage(onboarding.getProgressPercentage())
                .mentorId(onboarding.getMentor() != null ? onboarding.getMentor().getId() : null)
                .mentorName(onboarding.getMentor() != null ? getEmployeeName(onboarding.getMentor()) : null)
                .totalTasks(taskDTOs.size())
                .completedTasks(completed)
                .pendingTasks(taskDTOs.size() - completed)
                .tasks(taskDTOs)
                .notes(onboarding.getNotes())
                .createdAt(onboarding.getCreatedAt())
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
}

