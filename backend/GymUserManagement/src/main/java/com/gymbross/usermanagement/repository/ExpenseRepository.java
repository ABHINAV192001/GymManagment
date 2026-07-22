package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findByBranchId(UUID branchId);
    
    @Query("SELECT e FROM Expense e WHERE e.organizationId = :organizationId AND (:branchId IS NULL OR e.branchId = :branchId)")
    List<Expense> findByOrgAndBranch(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.organizationId = :organizationId AND (:branchId IS NULL OR e.branchId = :branchId)")
    BigDecimal sumAmountByOrgAndBranch(@Param("organizationId") UUID organizationId, @Param("branchId") UUID branchId);
}
