package com.talentflow.api.service;

import com.talentflow.api.dto.VacationRequestDTO;
import com.talentflow.api.entity.Employee;
import com.talentflow.api.entity.VacationRequest;
import com.talentflow.api.exception.BusinessException;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.EmployeeRepository;
import com.talentflow.api.repository.VacationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VacationRequestService {

    private final VacationRequestRepository vacationRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final ActivityLogService activityLogService;

    public List<VacationRequestDTO> findAll() {
        return vacationRequestRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(VacationRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<VacationRequestDTO> findAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return vacationRequestRepository.findAll(pageable)
                .map(VacationRequestDTO::fromEntity);
    }

    public Page<VacationRequestDTO> findWithFilters(
            VacationRequest.VacationStatus status,
            VacationRequest.VacationType type,
            Long employeeId,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return vacationRequestRepository.findWithFilters(status, type, employeeId, pageable)
                .map(VacationRequestDTO::fromEntity);
    }

    public VacationRequestDTO findById(Long id) {
        VacationRequest request = vacationRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada"));
        return VacationRequestDTO.fromEntity(request);
    }

    public List<VacationRequestDTO> findByEmployeeId(Long employeeId) {
        return vacationRequestRepository.findByEmployeeId(employeeId)
                .stream()
                .map(VacationRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<VacationRequestDTO> findByStatus(VacationRequest.VacationStatus status) {
        return vacationRequestRepository.findByStatus(status)
                .stream()
                .map(VacationRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<VacationRequestDTO> findActiveVacationsToday() {
        return vacationRequestRepository.findActiveVacationsOnDate(LocalDate.now())
                .stream()
                .map(VacationRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public VacationRequestDTO create(VacationRequestDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new BusinessException("Data de início não pode ser posterior à data de fim");
        }

        int days = (int) (dto.getEndDate().toEpochDay() - dto.getStartDate().toEpochDay()) + 1;

        VacationRequest request = VacationRequest.builder()
                .employee(employee)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .type(dto.getType())
                .status(VacationRequest.VacationStatus.PENDING)
                .reason(dto.getReason())
                .days(days)
                .build();

        request = vacationRequestRepository.save(request);

        activityLogService.logCreate("Vacation", request.getId(), 
                "Nova solicitação de " + getTypeLabel(dto.getType()) + " de " + employee.getUser().getName());

        return VacationRequestDTO.fromEntity(request);
    }

    @Transactional
    public VacationRequestDTO approve(Long id, Long approverEmployeeId) {
        VacationRequest request = vacationRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada"));

        if (request.getStatus() != VacationRequest.VacationStatus.PENDING) {
            throw new BusinessException("Apenas solicitações pendentes podem ser aprovadas");
        }

        Employee approver = employeeRepository.findById(approverEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Aprovador não encontrado"));

        request.setStatus(VacationRequest.VacationStatus.APPROVED);
        request.setApprovedBy(approver);
        request.setApprovedAt(LocalDateTime.now());

        request = vacationRequestRepository.save(request);

        activityLogService.logApproval("Vacation", request.getId(),
                "Solicitação de " + request.getEmployee().getUser().getName() + " aprovada");

        return VacationRequestDTO.fromEntity(request);
    }

    @Transactional
    public VacationRequestDTO reject(Long id, Long approverEmployeeId, String reason) {
        VacationRequest request = vacationRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada"));

        if (request.getStatus() != VacationRequest.VacationStatus.PENDING) {
            throw new BusinessException("Apenas solicitações pendentes podem ser rejeitadas");
        }

        Employee approver = employeeRepository.findById(approverEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Aprovador não encontrado"));

        request.setStatus(VacationRequest.VacationStatus.REJECTED);
        request.setApprovedBy(approver);
        request.setApprovedAt(LocalDateTime.now());
        request.setRejectionReason(reason);

        request = vacationRequestRepository.save(request);

        activityLogService.logRejection("Vacation", request.getId(),
                "Solicitação de " + request.getEmployee().getUser().getName() + " rejeitada");

        return VacationRequestDTO.fromEntity(request);
    }

    @Transactional
    public void cancel(Long id) {
        VacationRequest request = vacationRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada"));

        request.setStatus(VacationRequest.VacationStatus.CANCELLED);
        vacationRequestRepository.save(request);

        activityLogService.logStatusChange("Vacation", request.getId(),
                "Solicitação de " + request.getEmployee().getUser().getName() + " cancelada");
    }

    public Long countByStatus(VacationRequest.VacationStatus status) {
        return vacationRequestRepository.countByStatus(status);
    }

    public Long countOnVacationToday() {
        return (long) vacationRequestRepository.findActiveVacationsOnDate(LocalDate.now()).size();
    }

    private String getTypeLabel(VacationRequest.VacationType type) {
        return switch (type) {
            case VACATION -> "Férias";
            case SICK_LEAVE -> "Licença Médica";
            case PERSONAL -> "Licença Pessoal";
            case MATERNITY -> "Licença Maternidade";
            case PATERNITY -> "Licença Paternidade";
        };
    }
}


