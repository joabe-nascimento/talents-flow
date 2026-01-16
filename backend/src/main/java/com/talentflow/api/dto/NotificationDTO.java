package com.talentflow.api.dto;

import com.talentflow.api.entity.Notification;
import lombok.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private Long id;
    private Long userId;
    
    private String title;
    private String message;
    private Notification.NotificationType type;
    private Notification.NotificationPriority priority;
    
    private Boolean isRead;
    private LocalDateTime readAt;
    
    private String entityType;
    private Long entityId;
    private String actionUrl;
    
    private LocalDateTime createdAt;
    private String timeAgo;

    public static NotificationDTO fromEntity(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .priority(notification.getPriority())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .entityType(notification.getEntityType())
                .entityId(notification.getEntityId())
                .actionUrl(notification.getActionUrl())
                .createdAt(notification.getCreatedAt())
                .timeAgo(formatTimeAgo(notification.getCreatedAt()))
                .build();
    }

    private static String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        
        if (minutes < 1) return "agora";
        if (minutes < 60) return minutes + " min atrás";
        
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        if (hours < 24) return hours + "h atrás";
        
        long days = ChronoUnit.DAYS.between(dateTime, now);
        if (days < 7) return days + " dias atrás";
        
        if (days < 30) return (days / 7) + " semanas atrás";
        
        return (days / 30) + " meses atrás";
    }
}

