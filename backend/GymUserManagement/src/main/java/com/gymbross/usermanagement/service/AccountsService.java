package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.entity.Expense;
import com.gymbross.usermanagement.entity.Payment;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AccountsService {
    Map<String, Object> getSummary(UUID organizationId, UUID branchId);
    List<Payment> getPayments(UUID organizationId, UUID branchId);
    Payment recordPayment(Payment payment, UUID organizationId, UUID branchId);
    Payment getPaymentById(UUID id, UUID organizationId, UUID branchId);
    Payment updatePayment(UUID id, Payment paymentDetails, UUID organizationId, UUID branchId);
    void voidPayment(UUID id, UUID organizationId, UUID branchId);
    List<Payment> getIncome(UUID organizationId, UUID branchId);
    List<Expense> getExpenses(UUID organizationId, UUID branchId);
    Expense recordExpense(Expense expense, UUID organizationId, UUID branchId);
    List<Map<String, Object>> getSalaryRecords(UUID organizationId, UUID branchId);
    Map<String, Object> getProfitLossReport(UUID organizationId, UUID branchId);
    Map<String, Object> getCashflow(UUID organizationId, UUID branchId);
    List<Payment> getPendingPayments(UUID organizationId, UUID branchId);
    String exportTransactions(UUID organizationId, UUID branchId);
    String generateInvoice(UUID id, UUID organizationId, UUID branchId);
}
