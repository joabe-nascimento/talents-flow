package com.talentflow.api.controller;

import com.talentflow.api.dto.NotificationDTO;
import com.talentflow.api.entity.Notification;
import com.talentflow.api.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notificações", description = "Gestão de notificações")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Listar notificações do usuário")
    public ResponseEntity<List<NotificationDTO>> findByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.findByUser(userId));
    }

    @GetMapping("/user/{userId}/paged")
    @Operation(summary = "Listar notificações do usuário com paginação")
    public ResponseEntity<Page<NotificationDTO>> findByUserPaged(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(notificationService.findByUser(userId, pageable));
    }

    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "Listar notificações não lidas")
    public ResponseEntity<List<NotificationDTO>> findUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.findUnreadByUser(userId));
    }

    @GetMapping("/user/{userId}/unread/count")
    @Operation(summary = "Contar notificações não lidas")
    public ResponseEntity<Map<String, Long>> countUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(userId)));
    }

    @PostMapping
    @Operation(summary = "Criar notificação")
    public ResponseEntity<NotificationDTO> create(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam Notification.NotificationType type,
            @RequestParam(required = false) Notification.NotificationPriority priority,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) String actionUrl,
            @RequestParam(defaultValue = "false") boolean sendEmail) {
        return ResponseEntity.ok(notificationService.create(userId, title, message, type, 
                priority, entityType, entityId, actionUrl, sendEmail));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Marcar notificação como lida")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PostMapping("/user/{userId}/read-all")
    @Operation(summary = "Marcar todas as notificações como lidas")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@PathVariable Long userId) {
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("marked", count));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir notificação")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Notificação excluída"));
    }
}

