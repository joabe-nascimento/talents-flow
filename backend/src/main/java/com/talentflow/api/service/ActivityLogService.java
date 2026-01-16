package com.talentflow.api.service;

import com.talentflow.api.dto.ActivityLogDTO;
import com.talentflow.api.entity.ActivityLog;
import com.talentflow.api.entity.User;
import com.talentflow.api.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void log(String action, String entityType, Long entityId, String description, ActivityLog.ActivityType type) {
        String userName = "Sistema";
        User user = null;
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                user = (User) auth.getPrincipal();
                userName = user.getName();
            } else if (auth != null && auth.getName() != null) {
                userName = auth.getName();
            }
        } catch (Exception e) {
            // Ignore - use default
        }

        ActivityLog log = ActivityLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .user(user)
                .userName(userName)
                .type(type)
                .build();

        activityLogRepository.save(log);
    }

    public void logCreate(String entityType, Long entityId, String description) {
        log("Criação", entityType, entityId, description, ActivityLog.ActivityType.CREATE);
    }

    public void logUpdate(String entityType, Long entityId, String description) {
        log("Atualização", entityType, entityId, description, ActivityLog.ActivityType.UPDATE);
    }

    public void logDelete(String entityType, Long entityId, String description) {
        log("Exclusão", entityType, entityId, description, ActivityLog.ActivityType.DELETE);
    }

    public void logStatusChange(String entityType, Long entityId, String description) {
        log("Mudança de Status", entityType, entityId, description, ActivityLog.ActivityType.STATUS_CHANGE);
    }

    public void logApproval(String entityType, Long entityId, String description) {
        log("Aprovação", entityType, entityId, description, ActivityLog.ActivityType.APPROVAL);
    }

    public void logRejection(String entityType, Long entityId, String description) {
        log("Rejeição", entityType, entityId, description, ActivityLog.ActivityType.REJECTION);
    }

    public List<ActivityLogDTO> getRecentActivities() {
        return activityLogRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(ActivityLogDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ActivityLogDTO> getActivitiesSince(LocalDateTime since) {
        return activityLogRepository.findRecentActivities(since)
                .stream()
                .map(ActivityLogDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<ActivityLogDTO> getAllActivities(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(ActivityLogDTO::fromEntity);
    }

    public List<ActivityLogDTO> getEntityHistory(String entityType, Long entityId) {
        return activityLogRepository.findByEntityTypeAndEntityId(entityType, entityId)
                .stream()
                .map(ActivityLogDTO::fromEntity)
                .collect(Collectors.toList());
    }
}


