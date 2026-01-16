package com.talentflow.api.repository;

import com.talentflow.api.entity.Offboarding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OffboardingRepository extends JpaRepository<Offboarding, Long> {

    Optional<Offboarding> findByEmployeeId(Long employeeId);

    List<Offboarding> findByStatus(Offboarding.OffboardingStatus status);

    List<Offboarding> findByTerminationType(Offboarding.TerminationType type);

    @Query("SELECT o FROM Offboarding o WHERE o.status NOT IN ('COMPLETED', 'CANCELLED') ORDER BY o.terminationDate")
    List<Offboarding> findActiveOffboardings();

    @Query("SELECT o FROM Offboarding o WHERE o.terminationDate BETWEEN :startDate AND :endDate")
    List<Offboarding> findByTerminationDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(o) FROM Offboarding o WHERE o.status NOT IN ('COMPLETED', 'CANCELLED')")
    Long countActiveOffboardings();

    @Query("SELECT o.terminationType, COUNT(o) FROM Offboarding o WHERE o.terminationDate BETWEEN :startDate AND :endDate GROUP BY o.terminationType")
    List<Object[]> countByTerminationTypeAndPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT o FROM Offboarding o WHERE o.exitInterviewScheduled = true AND o.exitInterviewCompleted = false AND o.exitInterviewDate <= :date")
    List<Offboarding> findPendingExitInterviews(@Param("date") java.time.LocalDateTime date);
}


