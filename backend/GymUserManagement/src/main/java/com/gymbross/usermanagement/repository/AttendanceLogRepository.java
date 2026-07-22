package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, UUID> {
    List<AttendanceLog> findByEntityId(UUID entityId);
    List<AttendanceLog> findByBranchId(UUID branchId);
    
    @org.springframework.data.jpa.repository.Query("SELECT a FROM AttendanceLog a WHERE a.branchId IN (SELECT b.id FROM com.Gym.GymCommonServices.entity.Branch b WHERE b.organization.id = :orgId)")
    List<AttendanceLog> findByOrganizationId(@org.springframework.data.repository.query.Param("orgId") UUID orgId);

    List<AttendanceLog> findByCheckInTimeBetween(LocalDateTime start, LocalDateTime end);
    
    @org.springframework.data.jpa.repository.Query("SELECT a FROM AttendanceLog a WHERE a.checkInTime BETWEEN :start AND :end AND a.branchId IN (SELECT b.id FROM com.Gym.GymCommonServices.entity.Branch b WHERE b.organization.id = :orgId)")
    List<AttendanceLog> findByCheckInTimeBetweenAndOrganizationId(@org.springframework.data.repository.query.Param("start") LocalDateTime start, @org.springframework.data.repository.query.Param("end") LocalDateTime end, @org.springframework.data.repository.query.Param("orgId") UUID orgId);
    
    @org.springframework.data.jpa.repository.Query("SELECT a FROM AttendanceLog a WHERE a.checkInTime BETWEEN :start AND :end AND a.branchId = :branchId")
    List<AttendanceLog> findByCheckInTimeBetweenAndBranchId(@org.springframework.data.repository.query.Param("start") LocalDateTime start, @org.springframework.data.repository.query.Param("end") LocalDateTime end, @org.springframework.data.repository.query.Param("branchId") UUID branchId);

    Optional<AttendanceLog> findFirstByEntityIdAndStatusOrderByCheckInTimeDesc(UUID entityId, String status);
}
