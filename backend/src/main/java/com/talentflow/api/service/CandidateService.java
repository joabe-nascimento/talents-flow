package com.talentflow.api.service;

import com.talentflow.api.dto.CandidateDTO;
import com.talentflow.api.entity.Candidate;
import com.talentflow.api.entity.JobPosition;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.CandidateRepository;
import com.talentflow.api.repository.JobPositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final JobPositionRepository jobPositionRepository;

    public List<CandidateDTO> findAll() {
        return candidateRepository.findAll().stream()
                .map(CandidateDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public CandidateDTO findById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidato não encontrado"));
        return CandidateDTO.fromEntity(candidate);
    }

    public List<CandidateDTO> findByJobPosition(Long jobPositionId) {
        return candidateRepository.findByJobPositionId(jobPositionId).stream()
                .map(CandidateDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CandidateDTO create(CandidateDTO dto) {
        Candidate candidate = Candidate.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .resumeUrl(dto.getResumeUrl())
                .linkedinUrl(dto.getLinkedinUrl())
                .notes(dto.getNotes())
                .status(Candidate.CandidateStatus.APPLIED)
                .build();

        if (dto.getJobPositionId() != null) {
            JobPosition jobPosition = jobPositionRepository.findById(dto.getJobPositionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vaga não encontrada"));
            candidate.setJobPosition(jobPosition);
        }

        candidate = candidateRepository.save(candidate);
        return CandidateDTO.fromEntity(candidate);
    }

    @Transactional
    public CandidateDTO update(Long id, CandidateDTO dto) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidato não encontrado"));

        candidate.setName(dto.getName());
        candidate.setEmail(dto.getEmail());
        candidate.setPhone(dto.getPhone());
        candidate.setResumeUrl(dto.getResumeUrl());
        candidate.setLinkedinUrl(dto.getLinkedinUrl());
        candidate.setNotes(dto.getNotes());
        
        if (dto.getStatus() != null) {
            candidate.setStatus(dto.getStatus());
        }

        candidate = candidateRepository.save(candidate);
        return CandidateDTO.fromEntity(candidate);
    }

    @Transactional
    public CandidateDTO updateStatus(Long id, Candidate.CandidateStatus status) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidato não encontrado"));
        candidate.setStatus(status);
        candidate = candidateRepository.save(candidate);
        return CandidateDTO.fromEntity(candidate);
    }

    @Transactional
    public void delete(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidato não encontrado"));
        candidateRepository.delete(candidate);
    }

    public Long count() {
        return candidateRepository.count();
    }
}

