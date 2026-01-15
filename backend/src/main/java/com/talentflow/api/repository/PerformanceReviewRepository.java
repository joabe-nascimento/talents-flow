package com.talentflow.api.repository;

import com.talentflow.api.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    
    List<PerformanceReview> findByEmployeeId(Long employeeId);
    
    List<PerformanceReview> findByReviewerId(Long reviewerId);
    
    @Query("SELECT AVG(pr.rating) FROM PerformanceReview pr WHERE pr.employee.id = :employeeId")
    Double getAverageRatingByEmployeeId(Long employeeId);
    
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.employee.id = :employeeId ORDER BY pr.reviewDate DESC")
    List<PerformanceReview> findByEmployeeIdOrderByDateDesc(Long employeeId);
}

