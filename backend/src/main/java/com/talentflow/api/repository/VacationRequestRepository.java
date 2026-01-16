package com.talentflow.api.repository;

import com.talentflow.api.entity.VacationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VacationRequestRepository extends JpaRepository<VacationRequest, Long> {

    List<VacationRequest> findByEmployeeId(Long employeeId);

    List<VacationRequest> findByStatus(VacationRequest.VacationStatus status);

    Page<VacationRequest> findByStatus(VacationRequest.VacationStatus status, Pageable pageable);

    @Query("SELECT v FROM VacationRequest v WHERE v.status = 'APPROVED' " +
           "AND v.startDate <= :date AND v.endDate >= :date")
    List<VacationRequest> findActiveVacationsOnDate(@Param("date") LocalDate date);

    @Query("SELECT v FROM VacationRequest v WHERE v.employee.department.id = :deptId")
    List<VacationRequest> findByDepartmentId(@Param("deptId") Long departmentId);

    @Query("SELECT COUNT(v) FROM VacationRequest v WHERE v.status = :status")
    Long countByStatus(@Param("status") VacationRequest.VacationStatus status);

    @Query("SELECT v FROM VacationRequest v ORDER BY v.createdAt DESC")
    Page<VacationRequest> findAllOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT v FROM VacationRequest v WHERE " +
           "(:status IS NULL OR v.status = :status) AND " +
           "(:type IS NULL OR v.type = :type) AND " +
           "(:employeeId IS NULL OR v.employee.id = :employeeId)")
    Page<VacationRequest> findWithFilters(
            @Param("status") VacationRequest.VacationStatus status,
            @Param("type") VacationRequest.VacationType type,
            @Param("employeeId") Long employeeId,
            Pageable pageable);
}



