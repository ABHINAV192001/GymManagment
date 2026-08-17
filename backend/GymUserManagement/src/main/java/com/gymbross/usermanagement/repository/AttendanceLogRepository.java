package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.AttendanceLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, UUID> {
    List<AttendanceLog> findByEntityId(UUID entityId);
    List<AttendanceLog> findByEntityIdOrderByCheckInTimeDesc(UUID entityId);
    List<AttendanceLog> findByBranchId(UUID branchId);
    List<AttendanceLog> findByOrgId(UUID orgId);

    List<AttendanceLog> findByCheckInTimeBetween(LocalDateTime start, LocalDateTime end);
    List<AttendanceLog> findByCheckInTimeBetweenAndOrgId(LocalDateTime start, LocalDateTime end, UUID orgId);
    List<AttendanceLog> findByCheckInTimeBetweenAndBranchId(LocalDateTime start, LocalDateTime end, UUID branchId);

    Optional<AttendanceLog> findFirstByEntityIdAndStatusOrderByCheckInTimeDesc(UUID entityId, String status);

    @Query("SELECT a FROM AttendanceLog a WHERE " +
           "(:orgId IS NULL OR a.orgId = :orgId) AND " +
           "(:branchId IS NULL OR a.branchId = :branchId) AND " +
           "(CAST(:startDate AS timestamp) IS NULL OR a.checkInTime >= :startDate) AND " +
           "(CAST(:endDate AS timestamp) IS NULL OR a.checkInTime <= :endDate) AND " +
           "(CAST(:search AS String) IS NULL OR a.entityId IN (SELECT u.id FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')) OR LOWER(u.userCode) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))))")
    Page<AttendanceLog> searchLogs(
        @Param("orgId") UUID orgId, 
        @Param("branchId") UUID branchId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate, 
        @Param("search") String search, 
        Pageable pageable);
}
