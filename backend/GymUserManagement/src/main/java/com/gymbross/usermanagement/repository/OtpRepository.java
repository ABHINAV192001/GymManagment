package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {

        Optional<Otp> findTopByEmailAndOtpTypeOrderByCreatedAtDesc(String email, String otpType);

        @Modifying
        @Query("DELETE FROM Otp o WHERE o.endTime < :now")
        void deleteExpiredOtps(LocalDateTime now);

}
