package com.talentflow.api.controller;

import com.talentflow.api.dto.CandidateDTO;
import com.talentflow.api.entity.Candidate;
import com.talentflow.api.service.CandidateService;
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
@RequestMapping("/candidates")
@RequiredArgsConstructor
@Tag(name = "Candidatos", description = "Gestão de candidatos")
@SecurityRequirement(name = "bearerAuth")
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    @Operation(summary = "Listar todos os candidatos")
    public ResponseEntity<List<CandidateDTO>> findAll() {
        return ResponseEntity.ok(candidateService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar candidato por ID")
    public ResponseEntity<CandidateDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.findById(id));
    }

    @GetMapping("/job/{jobPositionId}")
    @Operation(summary = "Listar candidatos por vaga")
    public ResponseEntity<List<CandidateDTO>> findByJobPosition(@PathVariable Long jobPositionId) {
        return ResponseEntity.ok(candidateService.findByJobPosition(jobPositionId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Cadastrar novo candidato")
    public ResponseEntity<CandidateDTO> create(@Valid @RequestBody CandidateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidateService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Atualizar candidato")
    public ResponseEntity<CandidateDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CandidateDTO dto) {
        return ResponseEntity.ok(candidateService.update(id, dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Atualizar status do candidato")
    public ResponseEntity<CandidateDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam Candidate.CandidateStatus status) {
        return ResponseEntity.ok(candidateService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Excluir candidato")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        candidateService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Candidato excluído com sucesso"));
    }
}

