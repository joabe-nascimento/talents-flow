package com.talentflow.api.service;

import com.talentflow.api.dto.EmployeeDTO;
import com.talentflow.api.entity.Department;
import com.talentflow.api.entity.Employee;
import com.talentflow.api.entity.Role;
import com.talentflow.api.entity.User;
import com.talentflow.api.exception.BusinessException;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.DepartmentRepository;
import com.talentflow.api.repository.EmployeeRepository;
import com.talentflow.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public List<EmployeeDTO> findAll() {
        return employeeRepository.findAll().stream()
                .map(EmployeeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public EmployeeDTO findById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
        return EmployeeDTO.fromEntity(employee);
    }

    public List<EmployeeDTO> findByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId).stream()
                .map(EmployeeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeDTO create(EmployeeDTO dto, String password) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email já cadastrado");
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(password))
                .role(dto.getRole() != null ? dto.getRole() : Role.EMPLOYEE)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado"));
        }

        Employee employee = Employee.builder()
                .user(user)
                .position(dto.getPosition())
                .department(department)
                .hireDate(dto.getHireDate())
                .salary(dto.getSalary())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .birthDate(dto.getBirthDate())
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();

        employee = employeeRepository.save(employee);
        return EmployeeDTO.fromEntity(employee);
    }

    @Transactional
    public EmployeeDTO update(Long id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

        User user = employee.getUser();
        user.setName(dto.getName());
        
        if (!user.getEmail().equals(dto.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new BusinessException("Email já cadastrado");
            }
            user.setEmail(dto.getEmail());
        }
        
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }

        employee.setPosition(dto.getPosition());
        employee.setPhone(dto.getPhone());
        employee.setAddress(dto.getAddress());
        employee.setBirthDate(dto.getBirthDate());
        employee.setSalary(dto.getSalary());
        employee.setHireDate(dto.getHireDate());
        
        if (dto.getStatus() != null) {
            employee.setStatus(dto.getStatus());
        }

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado"));
            employee.setDepartment(department);
        }

        userRepository.save(user);
        employee = employeeRepository.save(employee);
        return EmployeeDTO.fromEntity(employee);
    }

    @Transactional
    public void delete(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
        
        employee.setStatus(Employee.EmployeeStatus.TERMINATED);
        employee.getUser().setActive(false);
        
        employeeRepository.save(employee);
    }

    public Long count() {
        return employeeRepository.count();
    }
}


