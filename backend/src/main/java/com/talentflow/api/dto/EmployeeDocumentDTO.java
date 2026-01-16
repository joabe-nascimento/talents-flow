package com.talentflow.api.dto;

import com.talentflow.api.entity.EmployeeDocument;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocumentDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    
    private String name;
    private EmployeeDocument.DocumentType type;
    private String typeLabel;
    
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String fileSizeFormatted;
    private String contentType;
    
    private String description;
    private LocalDate expirationDate;
    private Boolean isExpired;
    private Boolean isExpiringSoon;
    
    private Boolean isRequired;
    private Boolean isVerified;
    
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    
    private LocalDateTime createdAt;
    private String uploadedByName;

    public static EmployeeDocumentDTO fromEntity(EmployeeDocument doc) {
        LocalDate today = LocalDate.now();
        boolean isExpired = doc.getExpirationDate() != null && doc.getExpirationDate().isBefore(today);
        boolean isExpiringSoon = doc.getExpirationDate() != null && 
                                !isExpired && 
                                doc.getExpirationDate().isBefore(today.plusDays(30));
        
        return EmployeeDocumentDTO.builder()
                .id(doc.getId())
                .employeeId(doc.getEmployee().getId())
                .employeeName(getEmployeeName(doc.getEmployee()))
                .name(doc.getName())
                .type(doc.getType())
                .typeLabel(getTypeLabel(doc.getType()))
                .fileName(doc.getFileName())
                .filePath(doc.getFilePath())
                .fileSize(doc.getFileSize())
                .fileSizeFormatted(formatFileSize(doc.getFileSize()))
                .contentType(doc.getContentType())
                .description(doc.getDescription())
                .expirationDate(doc.getExpirationDate())
                .isExpired(isExpired)
                .isExpiringSoon(isExpiringSoon)
                .isRequired(doc.getIsRequired())
                .isVerified(doc.getIsVerified())
                .verifiedByName(doc.getVerifiedBy() != null ? getEmployeeName(doc.getVerifiedBy()) : null)
                .verifiedAt(doc.getVerifiedAt())
                .createdAt(doc.getCreatedAt())
                .uploadedByName(doc.getUploadedBy() != null ? getEmployeeName(doc.getUploadedBy()) : null)
                .build();
    }
    
    private static String getEmployeeName(com.talentflow.api.entity.Employee employee) {
        if (employee == null) return null;
        if (employee.getUser() != null) {
            return employee.getUser().getName();
        }
        return "Funcionário #" + employee.getId();
    }

    private static String getTypeLabel(EmployeeDocument.DocumentType type) {
        return switch (type) {
            case RG -> "RG";
            case CPF -> "CPF";
            case CTPS -> "Carteira de Trabalho";
            case PIS -> "PIS/PASEP";
            case TITULO_ELEITOR -> "Título de Eleitor";
            case CERTIFICADO_RESERVISTA -> "Certificado de Reservista";
            case CNH -> "CNH";
            case COMPROVANTE_RESIDENCIA -> "Comprovante de Residência";
            case COMPROVANTE_ESCOLARIDADE -> "Comprovante de Escolaridade";
            case CERTIDAO_NASCIMENTO -> "Certidão de Nascimento";
            case CERTIDAO_CASAMENTO -> "Certidão de Casamento";
            case CONTRATO_TRABALHO -> "Contrato de Trabalho";
            case TERMO_ADITIVO -> "Termo Aditivo";
            case ATESTADO_MEDICO -> "Atestado Médico";
            case ASO -> "ASO";
            case CERTIFICADO_CURSO -> "Certificado de Curso";
            case OUTROS -> "Outros";
        };
    }

    private static String formatFileSize(Long bytes) {
        if (bytes == null) return "";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }
}

