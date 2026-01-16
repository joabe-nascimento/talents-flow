package com.talentflow.api.controller;

import com.talentflow.api.dto.EmployeeDocumentDTO;
import com.talentflow.api.entity.EmployeeDocument;
import com.talentflow.api.service.EmployeeDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Tag(name = "Documentos", description = "Gestão de documentos de funcionários")
@SecurityRequirement(name = "bearerAuth")
public class EmployeeDocumentController {

    private final EmployeeDocumentService documentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Listar todos os documentos")
    public ResponseEntity<List<EmployeeDocumentDTO>> findAll() {
        return ResponseEntity.ok(documentService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar documento por ID")
    public ResponseEntity<EmployeeDocumentDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.findById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Listar documentos por funcionário")
    public ResponseEntity<List<EmployeeDocumentDTO>> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(documentService.findByEmployee(employeeId));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Listar documentos por tipo")
    public ResponseEntity<List<EmployeeDocumentDTO>> findByType(
            @PathVariable EmployeeDocument.DocumentType type) {
        return ResponseEntity.ok(documentService.findByType(type));
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Listar documentos prestes a expirar")
    public ResponseEntity<List<EmployeeDocumentDTO>> findExpiring(
            @RequestParam(defaultValue = "30") int daysAhead) {
        return ResponseEntity.ok(documentService.findExpiring(daysAhead));
    }

    @GetMapping("/expired")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Listar documentos expirados")
    public ResponseEntity<List<EmployeeDocumentDTO>> findExpired() {
        return ResponseEntity.ok(documentService.findExpired());
    }

    @PostMapping("/upload/{employeeId}")
    @Operation(summary = "Fazer upload de documento")
    public ResponseEntity<EmployeeDocumentDTO> upload(
            @PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam EmployeeDocument.DocumentType type,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expirationDate,
            @RequestParam(required = false) Boolean isRequired,
            @RequestParam(required = false) Long uploadedById) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.upload(employeeId, file, type, name, description, 
                        expirationDate, isRequired, uploadedById));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download de documento")
    public ResponseEntity<byte[]> download(@PathVariable Long id) throws IOException {
        EmployeeDocumentDTO doc = documentService.findById(id);
        byte[] content = documentService.downloadFile(id);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .body(content);
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Verificar documento")
    public ResponseEntity<EmployeeDocumentDTO> verify(
            @PathVariable Long id,
            @RequestParam Long verifiedById) {
        return ResponseEntity.ok(documentService.verify(id, verifiedById));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Excluir documento")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) throws IOException {
        documentService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Documento excluído com sucesso"));
    }

    @GetMapping("/types")
    @Operation(summary = "Listar tipos de documentos disponíveis")
    public ResponseEntity<EmployeeDocument.DocumentType[]> getTypes() {
        return ResponseEntity.ok(EmployeeDocument.DocumentType.values());
    }
}


