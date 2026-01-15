package com.talentflow.api.service;

import com.talentflow.api.dto.JobPositionDTO;
import com.talentflow.api.entity.Department;
import com.talentflow.api.entity.JobPosition;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.DepartmentRepository;
import com.talentflow.api.repository.JobPositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPositionService {

    private final JobPositionRepository jobPositionRepository;
    private final DepartmentRepository departmentRepository;

    public List<JobPositionDTO> findAll() {
        return jobPositionRepository.findAll().stream()
                .map(JobPositionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<JobPositionDTO> findOpenPositions() {
        return jobPositionRepository.findAllOpenPositions().stream()
                .map(JobPositionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public JobPositionDTO findById(Long id) {
        JobPosition jobPosition = jobPositionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaga não encontrada"));
        return JobPositionDTO.fromEntity(jobPosition);
    }

    @Transactional
    public JobPositionDTO create(JobPositionDTO dto) {
        JobPosition jobPosition = JobPosition.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .salaryMin(dto.getSalaryMin())
                .salaryMax(dto.getSalaryMax())
                .type(dto.getType() != null ? dto.getType() : JobPosition.JobType.FULL_TIME)
                .status(JobPosition.JobStatus.OPEN)
                .openingDate(dto.getOpeningDate())
                .closingDate(dto.getClosingDate())
                .build();

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado"));
            jobPosition.setDepartment(department);
        }

        jobPosition = jobPositionRepository.save(jobPosition);
        return JobPositionDTO.fromEntity(jobPosition);
    }

    @Transactional
    public JobPositionDTO update(Long id, JobPositionDTO dto) {
        JobPosition jobPosition = jobPositionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaga não encontrada"));

        jobPosition.setTitle(dto.getTitle());
        jobPosition.setDescription(dto.getDescription());
        jobPosition.setRequirements(dto.getRequirements());
        jobPosition.setSalaryMin(dto.getSalaryMin());
        jobPosition.setSalaryMax(dto.getSalaryMax());
        jobPosition.setType(dto.getType());
        jobPosition.setStatus(dto.getStatus());
        jobPosition.setClosingDate(dto.getClosingDate());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado"));
            jobPosition.setDepartment(department);
        }

        jobPosition = jobPositionRepository.save(jobPosition);
        return JobPositionDTO.fromEntity(jobPosition);
    }

    @Transactional
    public void delete(Long id) {
        JobPosition jobPosition = jobPositionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaga não encontrada"));
        jobPositionRepository.delete(jobPosition);
    }

    public Long countOpen() {
        return jobPositionRepository.countOpenPositions();
    }
}


