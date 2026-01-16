package com.talentflow.api.controller;

import com.talentflow.api.dto.VacationRequestDTO;
import com.talentflow.api.entity.VacationRequest;
import com.talentflow.api.service.VacationRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vacations")
@RequiredArgsConstructor
@Tag(name = "Férias e Ausências", description = "Gestão de solicitações de férias e ausências")
@SecurityRequirement(name = "bearerAuth")
public class VacationRequestController {

    private final VacationRequestService vacationRequestService;

    @GetMapping
    @Operation(summary = "Listar todas as solicitações")
    public ResponseEntity<List<VacationRequestDTO>> findAll() {
        return ResponseEntity.ok(vacationRequestService.findAll());
    }

    @GetMapping("/paginated")
    @Operation(summary = "Listar solicitações com paginação")
    public ResponseEntity<Page<VacationRequestDTO>> findAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(vacationRequestService.findAllPaginated(page, size));
    }

    @GetMapping("/filter")
    @Operation(summary = "Filtrar solicitações")
    public ResponseEntity<Page<VacationRequestDTO>> findWithFilters(
            @RequestParam(required = false) VacationRequest.VacationStatus status,
            @RequestParam(required = false) VacationRequest.VacationType type,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(vacationRequestService.findWithFilters(status, type, employeeId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar solicitação por ID")
    public ResponseEntity<VacationRequestDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(vacationRequestService.findById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Listar solicitações de um funcionário")
    public ResponseEntity<List<VacationRequestDTO>> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(vacationRequestService.findByEmployeeId(employeeId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar solicitações por status")
    public ResponseEntity<List<VacationRequestDTO>> findByStatus(@PathVariable VacationRequest.VacationStatus status) {
        return ResponseEntity.ok(vacationRequestService.findByStatus(status));
    }

    @GetMapping("/on-vacation-today")
    @Operation(summary = "Listar funcionários de férias hoje")
    public ResponseEntity<List<VacationRequestDTO>> findOnVacationToday() {
        return ResponseEntity.ok(vacationRequestService.findActiveVacationsToday());
    }

    @GetMapping("/stats")
    @Operation(summary = "Estatísticas de férias")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "pending", vacationRequestService.countByStatus(VacationRequest.VacationStatus.PENDING),
                "approved", vacationRequestService.countByStatus(VacationRequest.VacationStatus.APPROVED),
                "rejected", vacationRequestService.countByStatus(VacationRequest.VacationStatus.REJECTED),
                "onVacationToday", vacationRequestService.countOnVacationToday()
        ));
    }

    @PostMapping
    @Operation(summary = "Criar nova solicitação")
    public ResponseEntity<VacationRequestDTO> create(@Valid @RequestBody VacationRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vacationRequestService.create(dto));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Aprovar solicitação")
    public ResponseEntity<VacationRequestDTO> approve(
            @PathVariable Long id,
            @RequestParam Long approverEmployeeId) {
        return ResponseEntity.ok(vacationRequestService.approve(id, approverEmployeeId));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Rejeitar solicitação")
    public ResponseEntity<VacationRequestDTO> reject(
            @PathVariable Long id,
            @RequestParam Long approverEmployeeId,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(vacationRequestService.reject(id, approverEmployeeId, reason));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar solicitação")
    public ResponseEntity<Map<String, String>> cancel(@PathVariable Long id) {
        vacationRequestService.cancel(id);
        return ResponseEntity.ok(Map.of("message", "Solicitação cancelada com sucesso"));
    }
}



