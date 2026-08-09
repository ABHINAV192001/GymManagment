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
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    private String description;

    @Column(nullable = false)
    private String category;

    @Column(name = "recorded_by")
    private UUID recordedBy;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "org_id")
    private UUID organizationId;

    @org.hibernate.annotations.CreationTimestamp
    @jakarta.persistence.Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

}