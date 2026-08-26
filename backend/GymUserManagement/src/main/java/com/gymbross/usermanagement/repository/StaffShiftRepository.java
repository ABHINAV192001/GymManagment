package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.StaffShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffShiftRepository extends JpaRepository<StaffShift, UUID> {
    @Query("SELECT s FROM StaffShift s LEFT JOIN FETCH s.staff st LEFT JOIN FETCH st.branch WHERE s.orgId = :orgId ORDER BY s.startTime ASC")
    List<StaffShift> findByOrgId(@Param("orgId") UUID orgId);

    @Query("SELECT s FROM StaffShift s LEFT JOIN FETCH s.staff st LEFT JOIN FETCH st.branch WHERE s.branchId = :branchId ORDER BY s.startTime ASC")
    List<StaffShift> findByBranchId(@Param("branchId") UUID branchId);

    @Query("SELECT s FROM StaffShift s LEFT JOIN FETCH s.staff st LEFT JOIN FETCH st.branch WHERE s.staff.id = :staffId ORDER BY s.startTime ASC")
    List<StaffShift> findByStaffId(@Param("staffId") UUID staffId);

    @Query("SELECT s FROM StaffShift s LEFT JOIN FETCH s.staff st LEFT JOIN FETCH st.branch WHERE s.staff.id = :staffId AND s.startTime >= :start AND s.startTime <= :end ORDER BY s.startTime ASC")
    List<StaffShift> findByStaffIdAndStartTimeBetween(@Param("staffId") UUID staffId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s FROM StaffShift s LEFT JOIN FETCH s.staff st LEFT JOIN FETCH st.branch WHERE s.orgId = :orgId AND YEAR(s.startTime) = :year AND MONTH(s.startTime) = :month ORDER BY s.startTime ASC")
    List<StaffShift> findByOrgIdAndMonth(@Param("orgId") UUID orgId, @Param("year") int year, @Param("month") int month);

    @Query("SELECT s FROM StaffShift s LEFT JOIN FETCH s.staff st LEFT JOIN FETCH st.branch WHERE s.orgId = :orgId AND s.startTime >= :from AND s.startTime < :to ORDER BY s.startTime ASC")
    List<StaffShift> findByOrgIdAndDateRange(@Param("orgId") UUID orgId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT s FROM StaffShift s LEFT JOIN FETCH s.staff st LEFT JOIN FETCH st.branch LEFT JOIN FETCH st.staffProfile WHERE s.id = :id")
    Optional<StaffShift> findByIdWithDetails(@Param("id") UUID id);
}
