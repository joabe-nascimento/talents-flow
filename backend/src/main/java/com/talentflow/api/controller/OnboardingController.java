package com.talentflow.api.controller;

import com.talentflow.api.dto.OnboardingDTO;
import com.talentflow.api.dto.OnboardingTaskDTO;
import com.talentflow.api.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding", description = "Gestão de onboarding de funcionários")
@SecurityRequirement(name = "bearerAuth")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Listar todos os onboardings")
    public ResponseEntity<List<OnboardingDTO>> findAll() {
        return ResponseEntity.ok(onboardingService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar onboarding por ID")
    public ResponseEntity<OnboardingDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(onboardingService.findById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Buscar onboarding por funcionário")
    public ResponseEntity<OnboardingDTO> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(onboardingService.findByEmployee(employeeId));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Listar onboardings ativos")
    public ResponseEntity<List<OnboardingDTO>> findActive() {
        return ResponseEntity.ok(onboardingService.findActive());
    }

    @PostMapping("/start/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Iniciar onboarding para funcionário")
    public ResponseEntity<OnboardingDTO> startOnboarding(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Long templateId,
            @RequestParam(required = false) Long mentorId) {
        return ResponseEntity.ok(onboardingService.startOnboarding(employeeId, templateId, mentorId));
    }

    @PostMapping("/task/{taskId}/complete")
    @Operation(summary = "Completar tarefa de onboarding")
    public ResponseEntity<OnboardingTaskDTO> completeTask(
            @PathVariable Long taskId,
            @RequestParam(required = false) Long completedById,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(onboardingService.completeTask(taskId, completedById, notes));
    }

    @PostMapping("/task/{taskId}/skip")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Pular tarefa de onboarding")
    public ResponseEntity<OnboardingTaskDTO> skipTask(
            @PathVariable Long taskId,
            @RequestParam String reason) {
        return ResponseEntity.ok(onboardingService.skipTask(taskId, reason));
    }

    @PostMapping("/{id}/mentor")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Atribuir mentor ao onboarding")
    public ResponseEntity<OnboardingDTO> assignMentor(
            @PathVariable Long id,
            @RequestParam Long mentorId) {
        return ResponseEntity.ok(onboardingService.assignMentor(id, mentorId));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Estatísticas de onboarding")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "activeCount", onboardingService.countActive(),
                "averageProgress", onboardingService.getAverageProgress()
        ));
    }
}


