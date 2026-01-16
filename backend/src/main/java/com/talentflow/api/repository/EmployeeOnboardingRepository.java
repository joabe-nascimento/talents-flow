package com.talentflow.api.repository;

import com.talentflow.api.entity.EmployeeOnboarding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeOnboardingRepository extends JpaRepository<EmployeeOnboarding, Long> {

    Optional<EmployeeOnboarding> findByEmployeeId(Long employeeId);

    List<EmployeeOnboarding> findByStatus(EmployeeOnboarding.OnboardingStatus status);

    List<EmployeeOnboarding> findByMentorId(Long mentorId);

    @Query("SELECT o FROM EmployeeOnboarding o WHERE o.status = 'IN_PROGRESS' ORDER BY o.startDate")
    List<EmployeeOnboarding> findActiveOnboardings();

    @Query("SELECT COUNT(o) FROM EmployeeOnboarding o WHERE o.status = 'IN_PROGRESS'")
    Long countActiveOnboardings();

    @Query("SELECT o FROM EmployeeOnboarding o WHERE o.employee.department.id = :departmentId AND o.status = :status")
    List<EmployeeOnboarding> findByDepartmentAndStatus(@Param("departmentId") Long departmentId, @Param("status") EmployeeOnboarding.OnboardingStatus status);

    @Query("SELECT AVG(o.progressPercentage) FROM EmployeeOnboarding o WHERE o.status = 'IN_PROGRESS'")
    Double getAverageProgress();
}


