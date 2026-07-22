package com.gymbross.usermanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "attendance_logs")
public class AttendanceLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "entity_type", nullable = false)
    private String entityType; // "USER", "STAFF"

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    private String method; // "QR", "MANUAL", "BIOMETRIC"

    @Column(nullable = false)
    private String status; // "ACTIVE", "COMPLETED"
}
