package com.talentflow.api.repository;

import com.talentflow.api.entity.PerformanceReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    
    List<PerformanceReview> findByEmployeeId(Long employeeId);
    
    List<PerformanceReview> findByEmployeeIdOrderByReviewDateDesc(Long employeeId);
    
    List<PerformanceReview> findByReviewerId(Long reviewerId);
    
    List<PerformanceReview> findByReviewerIdOrderByReviewDateDesc(Long reviewerId);
    
    List<PerformanceReview> findByStatus(PerformanceReview.ReviewStatus status);
    
    Page<PerformanceReview> findByStatus(PerformanceReview.ReviewStatus status, Pageable pageable);
    
    @Query("SELECT AVG(pr.rating) FROM PerformanceReview pr WHERE pr.employee.id = :employeeId")
    Double getAverageRatingByEmployee(@Param("employeeId") Long employeeId);
    
    @Query("SELECT AVG(pr.rating) FROM PerformanceReview pr WHERE pr.employee.department.id = :deptId")
    Double getAverageRatingByDepartment(@Param("deptId") Long departmentId);
    
    @Query("SELECT COUNT(pr) FROM PerformanceReview pr WHERE pr.status = :status")
    Long countByStatus(@Param("status") PerformanceReview.ReviewStatus status);
    
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.employee.id = :employeeId ORDER BY pr.reviewDate DESC")
    List<PerformanceReview> findByEmployeeIdOrderByDateDesc(@Param("employeeId") Long employeeId);
    
    @Query("SELECT pr FROM PerformanceReview pr WHERE " +
           "(:status IS NULL OR pr.status = :status) AND " +
           "(:employeeId IS NULL OR pr.employee.id = :employeeId) AND " +
           "(:reviewerId IS NULL OR pr.reviewer.id = :reviewerId)")
    Page<PerformanceReview> findWithFilters(
            @Param("status") PerformanceReview.ReviewStatus status,
            @Param("employeeId") Long employeeId,
            @Param("reviewerId") Long reviewerId,
            Pageable pageable);
}
