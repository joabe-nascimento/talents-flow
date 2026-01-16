package com.talentflow.api.service;

import com.talentflow.api.dto.EmployeeDocumentDTO;
import com.talentflow.api.entity.Employee;
import com.talentflow.api.entity.EmployeeDocument;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.EmployeeDocumentRepository;
import com.talentflow.api.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeDocumentService {

    private final EmployeeDocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;

    @Value("${app.upload.dir:uploads/documents}")
    private String uploadDir;

    public List<EmployeeDocumentDTO> findAll() {
        return documentRepository.findAll().stream()
                .map(EmployeeDocumentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public EmployeeDocumentDTO findById(Long id) {
        EmployeeDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado"));
        return EmployeeDocumentDTO.fromEntity(doc);
    }

    public List<EmployeeDocumentDTO> findByEmployee(Long employeeId) {
        return documentRepository.findByEmployeeId(employeeId).stream()
                .map(EmployeeDocumentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<EmployeeDocumentDTO> findByType(EmployeeDocument.DocumentType type) {
        return documentRepository.findByType(type).stream()
                .map(EmployeeDocumentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<EmployeeDocumentDTO> findExpiring(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(daysAhead);
        return documentRepository.findExpiringDocuments(today, futureDate).stream()
                .map(EmployeeDocumentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<EmployeeDocumentDTO> findExpired() {
        return documentRepository.findExpiredDocuments(LocalDate.now()).stream()
                .map(EmployeeDocumentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeDocumentDTO upload(Long employeeId, MultipartFile file, EmployeeDocument.DocumentType type,
                                       String name, String description, LocalDate expirationDate,
                                       Boolean isRequired, Long uploadedById) throws IOException {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

        Employee uploadedBy = uploadedById != null ?
                employeeRepository.findById(uploadedById).orElse(null) : null;

        // Criar diretório se não existir
        Path uploadPath = Paths.get(uploadDir, employeeId.toString());
        Files.createDirectories(uploadPath);

        // Gerar nome único para o arquivo
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String newFilename = UUID.randomUUID().toString() + extension;

        // Salvar arquivo
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);

        EmployeeDocument document = EmployeeDocument.builder()
                .employee(employee)
                .name(name != null ? name : originalFilename)
                .type(type)
                .fileName(originalFilename)
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .description(description)
                .expirationDate(expirationDate)
                .isRequired(isRequired != null ? isRequired : false)
                .isVerified(false)
                .uploadedBy(uploadedBy)
                .build();

        document = documentRepository.save(document);
        return EmployeeDocumentDTO.fromEntity(document);
    }

    @Transactional
    public EmployeeDocumentDTO verify(Long id, Long verifiedById) {
        EmployeeDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado"));

        Employee verifiedBy = employeeRepository.findById(verifiedById)
                .orElseThrow(() -> new ResourceNotFoundException("Verificador não encontrado"));

        document.setIsVerified(true);
        document.setVerifiedBy(verifiedBy);
        document.setVerifiedAt(LocalDateTime.now());

        document = documentRepository.save(document);
        return EmployeeDocumentDTO.fromEntity(document);
    }

    @Transactional
    public void delete(Long id) throws IOException {
        EmployeeDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado"));

        // Deletar arquivo físico
        Path filePath = Paths.get(document.getFilePath());
        Files.deleteIfExists(filePath);

        documentRepository.delete(document);
    }

    public byte[] downloadFile(Long id) throws IOException {
        EmployeeDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado"));

        Path filePath = Paths.get(document.getFilePath());
        return Files.readAllBytes(filePath);
    }

    public Long countPendingVerification(Long employeeId) {
        return documentRepository.countPendingVerification(employeeId);
    }
}


