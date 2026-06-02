package org.example.backend.repo;

import org.example.backend.entity.EmailOtpToken;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface EmailOtpTokenRepository extends JpaRepository<EmailOtpToken, Long> {

    Optional<EmailOtpToken> findTopByUserAndUsedFalseOrderByExpiresAtDesc(User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM EmailOtpToken t WHERE t.user = :user")
    void deleteAllByUser(User user);
}
