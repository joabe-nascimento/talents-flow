package com.talentflow.api.controller;

import com.talentflow.api.dto.ActivityLogDTO;
import com.talentflow.api.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
@Tag(name = "Atividades", description = "Log de atividades do sistema")
@SecurityRequirement(name = "bearerAuth")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    @Operation(summary = "Listar atividades com paginação")
    public ResponseEntity<Page<ActivityLogDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(activityLogService.getAllActivities(page, size));
    }

    @GetMapping("/recent")
    @Operation(summary = "Listar atividades recentes (últimas 10)")
    public ResponseEntity<List<ActivityLogDTO>> getRecentActivities() {
        return ResponseEntity.ok(activityLogService.getRecentActivities());
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Histórico de uma entidade específica")
    public ResponseEntity<List<ActivityLogDTO>> getEntityHistory(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(activityLogService.getEntityHistory(entityType, entityId));
    }
}


