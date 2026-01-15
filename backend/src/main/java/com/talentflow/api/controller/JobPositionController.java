package com.talentflow.api.controller;

import com.talentflow.api.dto.JobPositionDTO;
import com.talentflow.api.service.JobPositionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
@Tag(name = "Vagas", description = "Gestão de vagas")
@SecurityRequirement(name = "bearerAuth")
public class JobPositionController {

    private final JobPositionService jobPositionService;

    @GetMapping
    @Operation(summary = "Listar todas as vagas")
    public ResponseEntity<List<JobPositionDTO>> findAll() {
        return ResponseEntity.ok(jobPositionService.findAll());
    }

    @GetMapping("/open")
    @Operation(summary = "Listar vagas abertas")
    public ResponseEntity<List<JobPositionDTO>> findOpen() {
        return ResponseEntity.ok(jobPositionService.findOpenPositions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar vaga por ID")
    public ResponseEntity<JobPositionDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(jobPositionService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Criar nova vaga")
    public ResponseEntity<JobPositionDTO> create(@Valid @RequestBody JobPositionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobPositionService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Atualizar vaga")
    public ResponseEntity<JobPositionDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody JobPositionDTO dto) {
        return ResponseEntity.ok(jobPositionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Excluir vaga")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        jobPositionService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Vaga excluída com sucesso"));
    }
}


