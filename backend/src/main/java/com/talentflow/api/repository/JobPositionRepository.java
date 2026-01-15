package com.talentflow.api.repository;

import com.talentflow.api.entity.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPositionRepository extends JpaRepository<JobPosition, Long> {
    
    List<JobPosition> findByStatus(JobPosition.JobStatus status);
    
    List<JobPosition> findByDepartmentId(Long departmentId);
    
    @Query("SELECT jp FROM JobPosition jp WHERE jp.status = 'OPEN' ORDER BY jp.openingDate DESC")
    List<JobPosition> findAllOpenPositions();
    
    @Query("SELECT COUNT(jp) FROM JobPosition jp WHERE jp.status = 'OPEN'")
    Long countOpenPositions();
}

