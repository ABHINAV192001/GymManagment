package com.gymbross.usermanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "member_id")
    private UUID memberId;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "plan_id")
    private UUID planId;

    @Column(nullable = false)
    private String status; // "PAID", "COMPLETED", "VOIDED", "PENDING"

    @Column(name = "payment_method")
    private String paymentMethod; // "CASH", "CARD", "UPI", "BANK_TRANSFER"

    @Column(name = "payment_type")
    private String paymentType; // "MEMBERSHIP", "PT_PACKAGE", "SALARY", "UTILITY", "EQUIPMENT"

    @Column(name = "reference_no")
    private String referenceNo;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "org_id")
    private UUID organizationId;

    @Column(name = "branch_id")
    private UUID branchId;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

}