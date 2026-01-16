package com.talentflow.api.repository;

import com.talentflow.api.entity.OnboardingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OnboardingTaskRepository extends JpaRepository<OnboardingTask, Long> {

    List<OnboardingTask> findByOnboardingIdOrderByOrderIndex(Long onboardingId);

    List<OnboardingTask> findByAssignedToId(Long assignedToId);

    List<OnboardingTask> findByAssignedToIdAndStatus(Long assignedToId, OnboardingTask.TaskStatus status);

    @Query("SELECT t FROM OnboardingTask t WHERE t.dueDate <= :date AND t.status NOT IN ('COMPLETED', 'SKIPPED')")
    List<OnboardingTask> findOverdueTasks(@Param("date") LocalDate date);

    @Query("SELECT COUNT(t) FROM OnboardingTask t WHERE t.onboarding.id = :onboardingId AND t.status = 'COMPLETED'")
    Long countCompletedByOnboarding(@Param("onboardingId") Long onboardingId);

    @Query("SELECT COUNT(t) FROM OnboardingTask t WHERE t.onboarding.id = :onboardingId")
    Long countByOnboarding(@Param("onboardingId") Long onboardingId);

    @Query("SELECT t FROM OnboardingTask t WHERE t.onboarding.id = :onboardingId AND t.status = 'PENDING' ORDER BY t.orderIndex")
    List<OnboardingTask> findPendingByOnboarding(@Param("onboardingId") Long onboardingId);
}


