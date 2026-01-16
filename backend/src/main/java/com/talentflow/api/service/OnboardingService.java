package com.talentflow.api.service;

import com.talentflow.api.dto.OnboardingDTO;
import com.talentflow.api.dto.OnboardingTaskDTO;
import com.talentflow.api.entity.*;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final EmployeeOnboardingRepository onboardingRepository;
    private final OnboardingTaskRepository taskRepository;
    private final OnboardingTemplateRepository templateRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public List<OnboardingDTO> findAll() {
        return onboardingRepository.findAll().stream()
                .map(OnboardingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public OnboardingDTO findById(Long id) {
        EmployeeOnboarding onboarding = onboardingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding não encontrado"));
        return OnboardingDTO.fromEntity(onboarding);
    }

    public OnboardingDTO findByEmployee(Long employeeId) {
        EmployeeOnboarding onboarding = onboardingRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding não encontrado para este funcionário"));
        return OnboardingDTO.fromEntity(onboarding);
    }

    public List<OnboardingDTO> findActive() {
        return onboardingRepository.findActiveOnboardings().stream()
                .map(OnboardingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public OnboardingDTO startOnboarding(Long employeeId, Long templateId, Long mentorId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

        OnboardingTemplate template = templateId != null ?
                templateRepository.findById(templateId)
                        .orElseThrow(() -> new ResourceNotFoundException("Template não encontrado")) :
                templateRepository.findByDepartmentIdAndIsActiveTrue(employee.getDepartment().getId())
                        .stream().findFirst()
                        .orElseGet(() -> templateRepository.findByDepartmentIdIsNullAndIsActiveTrue()
                                .orElse(null));

        Employee mentor = mentorId != null ?
                employeeRepository.findById(mentorId).orElse(null) : null;

        LocalDate startDate = LocalDate.now();
        LocalDate expectedEndDate = template != null && template.getEstimatedDays() != null ?
                startDate.plusDays(template.getEstimatedDays()) : startDate.plusDays(30);

        EmployeeOnboarding onboarding = EmployeeOnboarding.builder()
                .employee(employee)
                .template(template)
                .startDate(startDate)
                .expectedEndDate(expectedEndDate)
                .status(EmployeeOnboarding.OnboardingStatus.IN_PROGRESS)
                .progressPercentage(0)
                .mentor(mentor)
                .build();

        onboarding = onboardingRepository.save(onboarding);

        // Criar tarefas do template
        if (template != null && template.getTasks() != null) {
            for (OnboardingTaskTemplate taskTemplate : template.getTasks()) {
                OnboardingTask task = OnboardingTask.builder()
                        .onboarding(onboarding)
                        .title(taskTemplate.getTitle())
                        .description(taskTemplate.getDescription())
                        .category(taskTemplate.getCategory())
                        .orderIndex(taskTemplate.getOrderIndex())
                        .dueDate(taskTemplate.getDueDays() != null ?
                                startDate.plusDays(taskTemplate.getDueDays()) : null)
                        .isRequired(taskTemplate.getIsRequired())
                        .status(OnboardingTask.TaskStatus.PENDING)
                        .build();
                taskRepository.save(task);
            }
        }

        // Notificar funcionário
        notificationService.create(employee.getUser().getId(),
                "Bem-vindo ao TalentFlow!",
                "Seu processo de onboarding foi iniciado. Acesse para ver suas tarefas.",
                Notification.NotificationType.ONBOARDING_TASK,
                Notification.NotificationPriority.HIGH,
                "Onboarding", onboarding.getId(), "/dashboard/onboarding", true);

        return OnboardingDTO.fromEntity(onboardingRepository.findById(onboarding.getId()).get());
    }

    @Transactional
    public OnboardingTaskDTO completeTask(Long taskId, Long completedById, String notes) {
        OnboardingTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada"));

        Employee completedBy = completedById != null ?
                employeeRepository.findById(completedById).orElse(null) : null;

        task.setStatus(OnboardingTask.TaskStatus.COMPLETED);
        task.setCompletedBy(completedBy);
        task.setCompletedAt(LocalDateTime.now());
        task.setNotes(notes);

        task = taskRepository.save(task);

        // Atualizar progresso do onboarding
        updateOnboardingProgress(task.getOnboarding().getId());

        return OnboardingTaskDTO.fromEntity(task);
    }

    @Transactional
    public OnboardingTaskDTO skipTask(Long taskId, String reason) {
        OnboardingTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada"));

        if (Boolean.TRUE.equals(task.getIsRequired())) {
            throw new IllegalStateException("Tarefas obrigatórias não podem ser puladas");
        }

        task.setStatus(OnboardingTask.TaskStatus.SKIPPED);
        task.setNotes(reason);

        task = taskRepository.save(task);

        // Atualizar progresso
        updateOnboardingProgress(task.getOnboarding().getId());

        return OnboardingTaskDTO.fromEntity(task);
    }

    private void updateOnboardingProgress(Long onboardingId) {
        EmployeeOnboarding onboarding = onboardingRepository.findById(onboardingId)
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding não encontrado"));

        Long totalTasks = taskRepository.countByOnboarding(onboardingId);
        Long completedTasks = taskRepository.countCompletedByOnboarding(onboardingId);

        int progress = totalTasks > 0 ? (int) ((completedTasks * 100) / totalTasks) : 0;
        onboarding.setProgressPercentage(progress);

        // Verificar se completou
        if (progress == 100) {
            onboarding.setStatus(EmployeeOnboarding.OnboardingStatus.COMPLETED);
            onboarding.setActualEndDate(LocalDate.now());
        }

        onboardingRepository.save(onboarding);
    }

    @Transactional
    public OnboardingDTO assignMentor(Long onboardingId, Long mentorId) {
        EmployeeOnboarding onboarding = onboardingRepository.findById(onboardingId)
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding não encontrado"));

        Employee mentor = employeeRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor não encontrado"));

        onboarding.setMentor(mentor);
        onboarding = onboardingRepository.save(onboarding);

        return OnboardingDTO.fromEntity(onboarding);
    }

    public Long countActive() {
        return onboardingRepository.countActiveOnboardings();
    }

    public Double getAverageProgress() {
        Double avg = onboardingRepository.getAverageProgress();
        return avg != null ? avg : 0.0;
    }
}

