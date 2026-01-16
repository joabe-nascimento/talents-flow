package com.talentflow.api.repository;

import com.talentflow.api.entity.TwoFactorAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TwoFactorAuthRepository extends JpaRepository<TwoFactorAuth, Long> {

    Optional<TwoFactorAuth> findByUserId(Long userId);

    boolean existsByUserIdAndIsEnabledTrue(Long userId);
}

