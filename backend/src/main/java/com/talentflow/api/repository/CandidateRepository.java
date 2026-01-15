package com.talentflow.api.repository;

import com.talentflow.api.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    
    List<Candidate> findByJobPositionId(Long jobPositionId);
    
    List<Candidate> findByStatus(Candidate.CandidateStatus status);
    
    List<Candidate> findByEmail(String email);
    
    @Query("SELECT COUNT(c) FROM Candidate c WHERE c.jobPosition.id = :jobPositionId")
    Long countByJobPositionId(Long jobPositionId);
    
    @Query("SELECT c FROM Candidate c WHERE c.jobPosition.id = :jobPositionId AND c.status = :status")
    List<Candidate> findByJobPositionIdAndStatus(Long jobPositionId, Candidate.CandidateStatus status);
}


