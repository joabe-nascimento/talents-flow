package com.talentflow.api.dto;

import com.talentflow.api.entity.ActivityLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDTO {

    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String description;
    private Long userId;
    private String userName;
    private ActivityLog.ActivityType type;
    private LocalDateTime createdAt;
    private String timeAgo;

    public static ActivityLogDTO fromEntity(ActivityLog entity) {
        return ActivityLogDTO.builder()
                .id(entity.getId())
                .action(entity.getAction())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .description(entity.getDescription())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .userName(entity.getUserName())
                .type(entity.getType())
                .createdAt(entity.getCreatedAt())
                .timeAgo(calculateTimeAgo(entity.getCreatedAt()))
                .build();
    }

    private static String calculateTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();
        
        if (minutes < 1) return "agora";
        if (minutes < 60) return "há " + minutes + " min";
        
        long hours = minutes / 60;
        if (hours < 24) return "há " + hours + " hora" + (hours > 1 ? "s" : "");
        
        long days = hours / 24;
        if (days < 7) return "há " + days + " dia" + (days > 1 ? "s" : "");
        
        long weeks = days / 7;
        if (weeks < 4) return "há " + weeks + " semana" + (weeks > 1 ? "s" : "");
        
        return dateTime.toLocalDate().toString();
    }
}



