package com.talentflow.api.dto;

import com.talentflow.api.entity.Candidate;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDTO {
    
    private Long id;
    
    @NotBlank(message = "Nome é obrigatório")
    private String name;
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;
    
    private String phone;
    private String resumeUrl;
    private String linkedinUrl;
    private String notes;
    
    private Long jobPositionId;
    private String jobPositionTitle;
    
    private Candidate.CandidateStatus status;
    private LocalDateTime applicationDate;
    
    public static CandidateDTO fromEntity(Candidate candidate) {
        return CandidateDTO.builder()
                .id(candidate.getId())
                .name(candidate.getName())
                .email(candidate.getEmail())
                .phone(candidate.getPhone())
                .resumeUrl(candidate.getResumeUrl())
                .linkedinUrl(candidate.getLinkedinUrl())
                .notes(candidate.getNotes())
                .jobPositionId(candidate.getJobPosition() != null ? candidate.getJobPosition().getId() : null)
                .jobPositionTitle(candidate.getJobPosition() != null ? candidate.getJobPosition().getTitle() : null)
                .status(candidate.getStatus())
                .applicationDate(candidate.getApplicationDate())
                .build();
    }
}

