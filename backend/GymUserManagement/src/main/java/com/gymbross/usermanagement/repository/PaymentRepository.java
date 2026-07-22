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
    List<Payment> findByMemberId(UUID memberId);
    List<Payment> findByStatus(String status);
    
    @Query("SELECT p FROM Payment p WHERE p.organizationId = :organizationId AND (:branchId IS NULL OR p.branchId = :branchId)")
    List<Payment> findByOrgAndBranch(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId);

    @Query("SELECT p FROM Payment p WHERE p.organizationId = :organizationId AND (:branchId IS NULL OR p.branchId = :branchId) AND p.status = :status")
    List<Payment> findByOrgAndBranchAndStatus(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId, @Param("status") String status);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.organizationId = :organizationId AND (:branchId IS NULL OR p.branchId = :branchId) AND p.status = :status")
    BigDecimal sumAmountByOrgAndBranchAndStatus(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId, @Param("status") String status);
}
