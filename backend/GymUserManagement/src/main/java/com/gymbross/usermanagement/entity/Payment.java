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

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "plan_id")
    private UUID planId;

    @Column(nullable = false)
    private String status; // "PAID", "VOIDED", "PENDING"

    @Column(name = "payment_method")
    private String paymentMethod; // "CASH", "CARD", "UPI"

    @Column(name = "org_id")
    private UUID organizationId;

    @Column(name = "branch_id")
    private UUID branchId;
}
