package com.talentflow.api.service;

import com.talentflow.api.dto.DepartmentDTO;
import com.talentflow.api.entity.Department;
import com.talentflow.api.entity.Employee;
import com.talentflow.api.exception.BusinessException;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.DepartmentRepository;
import com.talentflow.api.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public List<DepartmentDTO> findAll() {
        return departmentRepository.findAll().stream()
                .map(DepartmentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public DepartmentDTO findById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado"));
        return DepartmentDTO.fromEntity(department);
    }

    @Transactional
    public DepartmentDTO create(DepartmentDTO dto) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BusinessException("Já existe um departamento com este nome");
        }

        Department department = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gerente não encontrado"));
            department.setManager(manager);
        }

        department = departmentRepository.save(department);
        return DepartmentDTO.fromEntity(department);
    }

    @Transactional
    public DepartmentDTO update(Long id, DepartmentDTO dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado"));

        if (!department.getName().equals(dto.getName()) && departmentRepository.existsByName(dto.getName())) {
            throw new BusinessException("Já existe um departamento com este nome");
        }

        department.setName(dto.getName());
        department.setDescription(dto.getDescription());

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gerente não encontrado"));
            department.setManager(manager);
        } else {
            department.setManager(null);
        }

        department = departmentRepository.save(department);
        return DepartmentDTO.fromEntity(department);
    }

    @Transactional
    public void delete(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado"));
        
        if (!department.getEmployees().isEmpty()) {
            throw new BusinessException("Não é possível excluir um departamento com funcionários");
        }
        
        departmentRepository.delete(department);
    }

    public Long count() {
        return departmentRepository.count();
    }
}

