package com.talentflow.api.service;

import com.talentflow.api.dto.OffboardingDTO;
import com.talentflow.api.entity.Employee;
import com.talentflow.api.entity.Notification;
import com.talentflow.api.entity.Offboarding;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.EmployeeRepository;
import com.talentflow.api.repository.OffboardingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OffboardingService {

    private final OffboardingRepository offboardingRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public List<OffboardingDTO> findAll() {
        return offboardingRepository.findAll().stream()
                .map(OffboardingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public OffboardingDTO findById(Long id) {
        Offboarding offboarding = offboardingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offboarding não encontrado"));
        return OffboardingDTO.fromEntity(offboarding);
    }

    public OffboardingDTO findByEmployee(Long employeeId) {
        Offboarding offboarding = offboardingRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Offboarding não encontrado"));
        return OffboardingDTO.fromEntity(offboarding);
    }

    public List<OffboardingDTO> findActive() {
        return offboardingRepository.findActiveOffboardings().stream()
                .map(OffboardingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public OffboardingDTO startOffboarding(Long employeeId, Offboarding.TerminationType terminationType,
                                            LocalDate terminationDate, LocalDate lastWorkingDay,
                                            String reason, Long processedById) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

        Employee processedBy = processedById != null ?
                employeeRepository.findById(processedById).orElse(null) : null;

        Offboarding offboarding = Offboarding.builder()
                .employee(employee)
                .terminationType(terminationType)
                .terminationDate(terminationDate)
                .lastWorkingDay(lastWorkingDay != null ? lastWorkingDay : terminationDate)
                .noticeDate(LocalDate.now())
                .status(Offboarding.OffboardingStatus.INITIATED)
                .terminationReason(reason)
                .processedBy(processedBy)
                .build();

        offboarding = offboardingRepository.save(offboarding);

        // Notificar RH
        notificationService.create(employee.getUser().getId(),
                "Processo de Desligamento Iniciado",
                "O processo de desligamento foi iniciado para " + employee.getUser().getName(),
                Notification.NotificationType.SYSTEM,
                Notification.NotificationPriority.HIGH,
                "Offboarding", offboarding.getId(), "/dashboard/offboarding", true);

        return OffboardingDTO.fromEntity(offboarding);
    }

    @Transactional
    public OffboardingDTO scheduleExitInterview(Long id, LocalDateTime interviewDate) {
        Offboarding offboarding = offboardingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offboarding não encontrado"));

        offboarding.setExitInterviewScheduled(true);
        offboarding.setExitInterviewDate(interviewDate);
        offboarding.setStatus(Offboarding.OffboardingStatus.PENDING_EXIT_INTERVIEW);

        offboarding = offboardingRepository.save(offboarding);
        return OffboardingDTO.fromEntity(offboarding);
    }

    @Transactional
    public OffboardingDTO completeExitInterview(Long id, String notes, Boolean rehireEligible, String rehireNotes) {
        Offboarding offboarding = offboardingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offboarding não encontrado"));

        offboarding.setExitInterviewCompleted(true);
        offboarding.setExitInterviewNotes(notes);
        offboarding.setRehireEligible(rehireEligible);
        offboarding.setRehireNotes(rehireNotes);
        offboarding.setStatus(Offboarding.OffboardingStatus.IN_PROGRESS);

        offboarding = offboardingRepository.save(offboarding);
        return OffboardingDTO.fromEntity(offboarding);
    }

    @Transactional
    public OffboardingDTO updateChecklist(Long id, Boolean equipmentReturned, Boolean accessRevoked,
                                           Boolean finalPaymentProcessed, Boolean documentsCollected,
                                           Boolean knowledgeTransferred) {
        Offboarding offboarding = offboardingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offboarding não encontrado"));

        if (equipmentReturned != null) offboarding.setEquipmentReturned(equipmentReturned);
        if (accessRevoked != null) offboarding.setAccessRevoked(accessRevoked);
        if (finalPaymentProcessed != null) offboarding.setFinalPaymentProcessed(finalPaymentProcessed);
        if (documentsCollected != null) offboarding.setDocumentsCollected(documentsCollected);
        if (knowledgeTransferred != null) offboarding.setKnowledgeTransferred(knowledgeTransferred);

        // Verificar se todas as tarefas estão completas
        if (Boolean.TRUE.equals(offboarding.getEquipmentReturned()) &&
            Boolean.TRUE.equals(offboarding.getAccessRevoked()) &&
            Boolean.TRUE.equals(offboarding.getFinalPaymentProcessed()) &&
            Boolean.TRUE.equals(offboarding.getDocumentsCollected()) &&
            Boolean.TRUE.equals(offboarding.getKnowledgeTransferred()) &&
            Boolean.TRUE.equals(offboarding.getExitInterviewCompleted())) {
            offboarding.setStatus(Offboarding.OffboardingStatus.COMPLETED);
            offboarding.setCompletedAt(LocalDateTime.now());

            // Inativar funcionário
            Employee employee = offboarding.getEmployee();
            employee.setStatus(Employee.EmployeeStatus.TERMINATED);
            employeeRepository.save(employee);
        }

        offboarding = offboardingRepository.save(offboarding);
        return OffboardingDTO.fromEntity(offboarding);
    }

    @Transactional
    public OffboardingDTO complete(Long id) {
        Offboarding offboarding = offboardingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offboarding não encontrado"));

        offboarding.setStatus(Offboarding.OffboardingStatus.COMPLETED);
        offboarding.setCompletedAt(LocalDateTime.now());

        // Inativar funcionário
        Employee employee = offboarding.getEmployee();
        employee.setStatus(Employee.EmployeeStatus.TERMINATED);
        employeeRepository.save(employee);

        offboarding = offboardingRepository.save(offboarding);
        return OffboardingDTO.fromEntity(offboarding);
    }

    public Long countActive() {
        return offboardingRepository.countActiveOffboardings();
    }

    public List<Object[]> getTerminationStats(LocalDate startDate, LocalDate endDate) {
        return offboardingRepository.countByTerminationTypeAndPeriod(startDate, endDate);
    }
}


