package com.talentflow.api.dto;

import com.talentflow.api.entity.Department;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDTO {
    
    private Long id;
    
    @NotBlank(message = "Nome é obrigatório")
    private String name;
    
    private String description;
    private Long managerId;
    private String managerName;
    private Integer employeeCount;
    
    public static DepartmentDTO fromEntity(Department department) {
        return DepartmentDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .managerId(department.getManager() != null ? department.getManager().getId() : null)
                .managerName(department.getManager() != null ? department.getManager().getUser().getName() : null)
                .employeeCount(department.getEmployees() != null ? department.getEmployees().size() : 0)
                .build();
    }
}


