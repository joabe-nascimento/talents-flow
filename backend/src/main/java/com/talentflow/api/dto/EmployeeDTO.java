package com.talentflow.api.dto;

import com.talentflow.api.entity.Employee;
import com.talentflow.api.entity.Role;
import jakarta.validation.constraints.Email;
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
public class EmployeeDTO {
    
    private Long id;
    
    @NotBlank(message = "Nome é obrigatório")
    private String name;
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;
    
    @NotBlank(message = "Cargo é obrigatório")
    private String position;
    
    private Long departmentId;
    private String departmentName;
    
    private LocalDate hireDate;
    private BigDecimal salary;
    private String phone;
    private String address;
    private LocalDate birthDate;
    
    private Employee.EmployeeStatus status;
    private Role role;
    
    public static EmployeeDTO fromEntity(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .name(employee.getUser().getName())
                .email(employee.getUser().getEmail())
                .position(employee.getPosition())
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .hireDate(employee.getHireDate())
                .salary(employee.getSalary())
                .phone(employee.getPhone())
                .address(employee.getAddress())
                .birthDate(employee.getBirthDate())
                .status(employee.getStatus())
                .role(employee.getUser().getRole())
                .build();
    }
}


