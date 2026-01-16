package com.talentflow.api.repository;

import com.talentflow.api.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {

    List<EmployeeDocument> findByEmployeeId(Long employeeId);

    List<EmployeeDocument> findByEmployeeIdAndType(Long employeeId, EmployeeDocument.DocumentType type);

    List<EmployeeDocument> findByType(EmployeeDocument.DocumentType type);

    List<EmployeeDocument> findByIsVerified(Boolean isVerified);

    @Query("SELECT d FROM EmployeeDocument d WHERE d.expirationDate IS NOT NULL AND d.expirationDate <= :date")
    List<EmployeeDocument> findExpiredDocuments(@Param("date") LocalDate date);

    @Query("SELECT d FROM EmployeeDocument d WHERE d.expirationDate IS NOT NULL AND d.expirationDate BETWEEN :today AND :futureDate")
    List<EmployeeDocument> findExpiringDocuments(@Param("today") LocalDate today, @Param("futureDate") LocalDate futureDate);

    @Query("SELECT d FROM EmployeeDocument d WHERE d.isRequired = true AND d.employee.id = :employeeId")
    List<EmployeeDocument> findRequiredByEmployee(@Param("employeeId") Long employeeId);

    @Query("SELECT COUNT(d) FROM EmployeeDocument d WHERE d.employee.id = :employeeId AND d.isVerified = false")
    Long countPendingVerification(@Param("employeeId") Long employeeId);

    @Query("SELECT d.type, COUNT(d) FROM EmployeeDocument d WHERE d.employee.id = :employeeId GROUP BY d.type")
    List<Object[]> countByTypeForEmployee(@Param("employeeId") Long employeeId);
}

