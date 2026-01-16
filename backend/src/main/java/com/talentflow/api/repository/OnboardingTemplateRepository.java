package com.talentflow.api.repository;

import com.talentflow.api.entity.OnboardingTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnboardingTemplateRepository extends JpaRepository<OnboardingTemplate, Long> {

    List<OnboardingTemplate> findByIsActiveTrue();

    List<OnboardingTemplate> findByDepartmentId(Long departmentId);

    List<OnboardingTemplate> findByDepartmentIdAndIsActiveTrue(Long departmentId);

    Optional<OnboardingTemplate> findByDepartmentIdIsNullAndIsActiveTrue();
}


