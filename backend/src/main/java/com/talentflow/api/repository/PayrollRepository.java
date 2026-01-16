package com.talentflow.api.repository;

import com.talentflow.api.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByEmployeeId(Long employeeId);

    List<Payroll> findByReferenceYearAndReferenceMonth(Integer year, Integer month);

    Optional<Payroll> findByEmployeeIdAndReferenceYearAndReferenceMonth(Long employeeId, Integer year, Integer month);

    List<Payroll> findByStatus(Payroll.PayrollStatus status);

    @Query("SELECT p FROM Payroll p WHERE p.referenceYear = :year ORDER BY p.referenceMonth DESC")
    List<Payroll> findByYear(@Param("year") Integer year);

    @Query("SELECT p FROM Payroll p WHERE p.employee.department.id = :departmentId AND p.referenceYear = :year AND p.referenceMonth = :month")
    List<Payroll> findByDepartmentAndPeriod(@Param("departmentId") Long departmentId, @Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT SUM(p.netSalary) FROM Payroll p WHERE p.referenceYear = :year AND p.referenceMonth = :month AND p.status = 'PAID'")
    java.math.BigDecimal getTotalPaidByPeriod(@Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT COUNT(p) FROM Payroll p WHERE p.referenceYear = :year AND p.referenceMonth = :month AND p.status = :status")
    Long countByPeriodAndStatus(@Param("year") Integer year, @Param("month") Integer month, @Param("status") Payroll.PayrollStatus status);
}

