package com.talentflow.api.repository;

import com.talentflow.api.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<ActivityLog> findTop10ByOrderByCreatedAtDesc();

    List<ActivityLog> findByEntityTypeAndEntityId(String entityType, Long entityId);

    @Query("SELECT a FROM ActivityLog a WHERE a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<ActivityLog> findRecentActivities(@Param("since") LocalDateTime since);

    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    Page<ActivityLog> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.createdAt >= :since")
    Long countActivitiesSince(@Param("since") LocalDateTime since);
}



