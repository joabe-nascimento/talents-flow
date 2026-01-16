package com.talentflow.api.controller;

import com.talentflow.api.dto.OffboardingDTO;
import com.talentflow.api.entity.Offboarding;
import com.talentflow.api.service.OffboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/offboarding")
@RequiredArgsConstructor
@Tag(name = "Offboarding", description = "Gestão de desligamento de funcionários")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class OffboardingController {

    private final OffboardingService offboardingService;

    @GetMapping
    @Operation(summary = "Listar todos os offboardings")
    public ResponseEntity<List<OffboardingDTO>> findAll() {
        return ResponseEntity.ok(offboardingService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar offboarding por ID")
    public ResponseEntity<OffboardingDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(offboardingService.findById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Buscar offboarding por funcionário")
    public ResponseEntity<OffboardingDTO> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(offboardingService.findByEmployee(employeeId));
    }

    @GetMapping("/active")
    @Operation(summary = "Listar offboardings ativos")
    public ResponseEntity<List<OffboardingDTO>> findActive() {
        return ResponseEntity.ok(offboardingService.findActive());
    }

    @PostMapping("/start/{employeeId}")
    @Operation(summary = "Iniciar processo de desligamento")
    public ResponseEntity<OffboardingDTO> startOffboarding(
            @PathVariable Long employeeId,
            @RequestParam Offboarding.TerminationType terminationType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate terminationDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate lastWorkingDay,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) Long processedById) {
        return ResponseEntity.ok(offboardingService.startOffboarding(employeeId, terminationType, 
                terminationDate, lastWorkingDay, reason, processedById));
    }

    @PostMapping("/{id}/exit-interview/schedule")
    @Operation(summary = "Agendar entrevista de saída")
    public ResponseEntity<OffboardingDTO> scheduleExitInterview(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime interviewDate) {
        return ResponseEntity.ok(offboardingService.scheduleExitInterview(id, interviewDate));
    }

    @PostMapping("/{id}/exit-interview/complete")
    @Operation(summary = "Completar entrevista de saída")
    public ResponseEntity<OffboardingDTO> completeExitInterview(
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) Boolean rehireEligible,
            @RequestParam(required = false) String rehireNotes) {
        return ResponseEntity.ok(offboardingService.completeExitInterview(id, notes, rehireEligible, rehireNotes));
    }

    @PatchMapping("/{id}/checklist")
    @Operation(summary = "Atualizar checklist de offboarding")
    public ResponseEntity<OffboardingDTO> updateChecklist(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean equipmentReturned,
            @RequestParam(required = false) Boolean accessRevoked,
            @RequestParam(required = false) Boolean finalPaymentProcessed,
            @RequestParam(required = false) Boolean documentsCollected,
            @RequestParam(required = false) Boolean knowledgeTransferred) {
        return ResponseEntity.ok(offboardingService.updateChecklist(id, equipmentReturned, 
                accessRevoked, finalPaymentProcessed, documentsCollected, knowledgeTransferred));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Completar offboarding")
    public ResponseEntity<OffboardingDTO> complete(@PathVariable Long id) {
        return ResponseEntity.ok(offboardingService.complete(id));
    }

    @GetMapping("/stats")
    @Operation(summary = "Estatísticas de desligamento")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "activeCount", offboardingService.countActive()
        ));
    }

    @GetMapping("/termination-types")
    @Operation(summary = "Listar tipos de desligamento")
    public ResponseEntity<Offboarding.TerminationType[]> getTerminationTypes() {
        return ResponseEntity.ok(Offboarding.TerminationType.values());
    }
}


