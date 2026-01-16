package com.talentflow.api.controller;

import com.talentflow.api.dto.PerformanceReviewDTO;
import com.talentflow.api.service.PerformanceReviewService;
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
@RequestMapping("/performance-reviews")
@RequiredArgsConstructor
@Tag(name = "Avaliações de Desempenho", description = "Gestão de avaliações de desempenho")
@SecurityRequirement(name = "bearerAuth")
public class PerformanceReviewController {

    private final PerformanceReviewService performanceReviewService;

    @GetMapping
    @Operation(summary = "Listar todas as avaliações")
    public ResponseEntity<List<PerformanceReviewDTO>> findAll() {
        return ResponseEntity.ok(performanceReviewService.findAll());
    }

    @GetMapping("/paginated")
    @Operation(summary = "Listar avaliações com paginação")
    public ResponseEntity<Page<PerformanceReviewDTO>> findAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(performanceReviewService.findAllPaginated(page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar avaliação por ID")
    public ResponseEntity<PerformanceReviewDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(performanceReviewService.findById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Listar avaliações de um funcionário")
    public ResponseEntity<List<PerformanceReviewDTO>> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(performanceReviewService.findByEmployeeId(employeeId));
    }

    @GetMapping("/reviewer/{reviewerId}")
    @Operation(summary = "Listar avaliações feitas por um avaliador")
    public ResponseEntity<List<PerformanceReviewDTO>> findByReviewer(@PathVariable Long reviewerId) {
        return ResponseEntity.ok(performanceReviewService.findByReviewerId(reviewerId));
    }

    @GetMapping("/employee/{employeeId}/average")
    @Operation(summary = "Média de avaliações de um funcionário")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long employeeId) {
        Double average = performanceReviewService.getAverageRatingByEmployee(employeeId);
        return ResponseEntity.ok(Map.of(
                "employeeId", employeeId,
                "averageRating", average != null ? average : 0
        ));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Criar nova avaliação")
    public ResponseEntity<PerformanceReviewDTO> create(@Valid @RequestBody PerformanceReviewDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(performanceReviewService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Atualizar avaliação")
    public ResponseEntity<PerformanceReviewDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody PerformanceReviewDTO dto) {
        return ResponseEntity.ok(performanceReviewService.update(id, dto));
    }

    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Submeter avaliação")
    public ResponseEntity<PerformanceReviewDTO> submit(@PathVariable Long id) {
        return ResponseEntity.ok(performanceReviewService.submit(id));
    }

    @PatchMapping("/{id}/acknowledge")
    @Operation(summary = "Reconhecer avaliação (funcionário)")
    public ResponseEntity<PerformanceReviewDTO> acknowledge(@PathVariable Long id) {
        return ResponseEntity.ok(performanceReviewService.acknowledge(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Excluir avaliação")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        performanceReviewService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Avaliação excluída com sucesso"));
    }
}


