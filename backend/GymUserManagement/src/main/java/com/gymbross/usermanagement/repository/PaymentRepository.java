package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByUserId(UUID userId);
    List<Payment> findByMemberId(UUID memberId);
    List<Payment> findByStatus(String status);
    
    @Query("SELECT p FROM Payment p WHERE p.organizationId = :organizationId AND (:branchId IS NULL OR p.branchId = :branchId) ORDER BY p.paymentDate DESC, p.createdAt DESC")
    List<Payment> findByOrgAndBranch(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId);

    @Query("SELECT p FROM Payment p WHERE p.organizationId = :organizationId AND (:branchId IS NULL OR p.branchId = :branchId) AND (UPPER(p.status) = UPPER(:status)) ORDER BY p.paymentDate DESC, p.createdAt DESC")
    List<Payment> findByOrgAndBranchAndStatus(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId, @Param("status") String status);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.organizationId = :organizationId AND (:branchId IS NULL OR p.branchId = :branchId) AND (UPPER(p.status) = UPPER(:status))")
    BigDecimal sumAmountByOrgAndBranchAndStatus(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId, @Param("status") String status);

    @Query("SELECT p FROM Payment p WHERE p.organizationId = :organizationId AND (:branchId IS NULL OR p.branchId = :branchId) AND (UPPER(p.status) = 'PAID' OR UPPER(p.status) = 'COMPLETED') ORDER BY p.paymentDate DESC, p.createdAt DESC")
    List<Payment> findIncomeByOrgAndBranch(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.organizationId = :organizationId AND (:branchId IS NULL OR p.branchId = :branchId) AND (UPPER(p.status) = 'PAID' OR UPPER(p.status) = 'COMPLETED')")
    BigDecimal sumIncomeByOrgAndBranch(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId);
    
    @Query("SELECT p FROM Payment p WHERE p.staffId = :staffId AND UPPER(p.paymentType) = 'PT_PACKAGE' AND (UPPER(p.status) = 'PAID' OR UPPER(p.status) = 'COMPLETED')")
    List<Payment> findPtPaymentsForStaff(@Param("staffId") UUID staffId);
}
