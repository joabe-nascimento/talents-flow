package com.talentflow.api.service;

import com.talentflow.api.dto.NotificationDTO;
import com.talentflow.api.entity.Notification;
import com.talentflow.api.entity.User;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.NotificationRepository;
import com.talentflow.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public List<NotificationDTO> findByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<NotificationDTO> findByUser(Long userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable)
                .map(NotificationDTO::fromEntity);
    }

    public List<NotificationDTO> findUnreadByUser(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Long countUnread(Long userId) {
        return notificationRepository.countUnreadByUser(userId);
    }

    @Transactional
    public NotificationDTO create(Long userId, String title, String message,
                                   Notification.NotificationType type,
                                   Notification.NotificationPriority priority,
                                   String entityType, Long entityId, String actionUrl,
                                   boolean sendEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .priority(priority != null ? priority : Notification.NotificationPriority.NORMAL)
                .entityType(entityType)
                .entityId(entityId)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        // Enviar email se solicitado
        if (sendEmail && user.getEmail() != null) {
            try {
                emailService.sendNotificationEmail(user.getEmail(), title, message);
                notification.setEmailSent(true);
                notification.setEmailSentAt(LocalDateTime.now());
                notification = notificationRepository.save(notification);
            } catch (Exception e) {
                // Log error but don't fail the notification creation
            }
        }

        return NotificationDTO.fromEntity(notification);
    }

    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada"));

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());

        notification = notificationRepository.save(notification);
        return NotificationDTO.fromEntity(notification);
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsReadByUser(userId, LocalDateTime.now());
    }

    @Transactional
    public void delete(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada"));
        notificationRepository.delete(notification);
    }

    @Transactional
    public int deleteExpired() {
        return notificationRepository.deleteExpiredNotifications(LocalDateTime.now());
    }

    // Métodos de conveniência para tipos específicos de notificação
    public NotificationDTO notifyVacationApproved(Long userId, String employeeName) {
        return create(userId, "Férias Aprovadas",
                "As férias de " + employeeName + " foram aprovadas.",
                Notification.NotificationType.VACATION_APPROVED,
                Notification.NotificationPriority.NORMAL,
                "Vacation", null, "/dashboard/vacations", true);
    }

    public NotificationDTO notifyVacationRejected(Long userId, String employeeName, String reason) {
        return create(userId, "Férias Recusadas",
                "As férias de " + employeeName + " foram recusadas. Motivo: " + reason,
                Notification.NotificationType.VACATION_REJECTED,
                Notification.NotificationPriority.HIGH,
                "Vacation", null, "/dashboard/vacations", true);
    }

    public NotificationDTO notifyDocumentExpiring(Long userId, String documentName, int daysUntilExpiry) {
        return create(userId, "Documento Expirando",
                "O documento " + documentName + " expira em " + daysUntilExpiry + " dias.",
                Notification.NotificationType.DOCUMENT_EXPIRING,
                Notification.NotificationPriority.HIGH,
                "Document", null, "/dashboard/documents", true);
    }

    public NotificationDTO notifyPayrollReady(Long userId, String period) {
        return create(userId, "Holerite Disponível",
                "Seu holerite de " + period + " está disponível.",
                Notification.NotificationType.PAYROLL_READY,
                Notification.NotificationPriority.NORMAL,
                "Payroll", null, "/dashboard/payroll", true);
    }

    public NotificationDTO notifyOnboardingTask(Long userId, String taskTitle) {
        return create(userId, "Nova Tarefa de Onboarding",
                "Você tem uma nova tarefa: " + taskTitle,
                Notification.NotificationType.ONBOARDING_TASK,
                Notification.NotificationPriority.NORMAL,
                "OnboardingTask", null, "/dashboard/onboarding", false);
    }
}

