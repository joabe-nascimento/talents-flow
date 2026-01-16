package com.talentflow.api.repository;

import com.talentflow.api.entity.TimeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeRecordRepository extends JpaRepository<TimeRecord, Long> {

    List<TimeRecord> findByEmployeeId(Long employeeId);

    Optional<TimeRecord> findByEmployeeIdAndRecordDate(Long employeeId, LocalDate recordDate);

    List<TimeRecord> findByEmployeeIdAndRecordDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);

    List<TimeRecord> findByRecordDate(LocalDate recordDate);

    List<TimeRecord> findByStatus(TimeRecord.RecordStatus status);

    @Query("SELECT t FROM TimeRecord t WHERE t.employee.id = :employeeId AND YEAR(t.recordDate) = :year AND MONTH(t.recordDate) = :month ORDER BY t.recordDate")
    List<TimeRecord> findByEmployeeAndMonth(@Param("employeeId") Long employeeId, @Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT SUM(t.workedMinutes) FROM TimeRecord t WHERE t.employee.id = :employeeId AND t.recordDate BETWEEN :startDate AND :endDate")
    Integer getTotalWorkedMinutes(@Param("employeeId") Long employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(t.overtimeMinutes) FROM TimeRecord t WHERE t.employee.id = :employeeId AND t.recordDate BETWEEN :startDate AND :endDate")
    Integer getTotalOvertimeMinutes(@Param("employeeId") Long employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM TimeRecord t WHERE t.employee.department.id = :departmentId AND t.recordDate = :date")
    List<TimeRecord> findByDepartmentAndDate(@Param("departmentId") Long departmentId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(t) FROM TimeRecord t WHERE t.status = 'PENDING'")
    Long countPending();
}

