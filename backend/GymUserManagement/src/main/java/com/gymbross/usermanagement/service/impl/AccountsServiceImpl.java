package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.entity.Expense;
import com.gymbross.usermanagement.entity.Payment;
import com.gymbross.usermanagement.repository.ExpenseRepository;
import com.gymbross.usermanagement.repository.PaymentRepository;
import com.gymbross.usermanagement.service.AccountsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountsServiceImpl implements AccountsService {

    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final com.gymbross.usermanagement.repository.UserRepository userRepository;
    
    @Override
    public Map<String, Object> getSummary(UUID organizationId, UUID branchId) {
        BigDecimal totalIncome = paymentRepository.sumAmountByOrgAndBranchAndStatus(organizationId, branchId, "PAID");
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpenses = expenseRepository.sumAmountByOrgAndBranch(organizationId, branchId);
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        BigDecimal netProfit = totalIncome.subtract(totalExpenses);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("netProfit", netProfit);

        return summary;
    }

    @Override
    public List<Payment> getPayments(UUID organizationId, UUID branchId) {
        return paymentRepository.findByOrgAndBranch(organizationId, branchId);
    }

    @Override
    public Payment recordPayment(Payment payment, UUID organizationId, UUID branchId) {
        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDate.now());
        }
        if (payment.getStatus() == null) {
            payment.setStatus("PAID");
        }
        payment.setOrganizationId(organizationId);
        payment.setBranchId(branchId);
        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentById(UUID id, UUID organizationId, UUID branchId) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        validateAccess(payment.getOrganizationId(), payment.getBranchId(), organizationId, branchId);
        return payment;
    }

    @Override
    public Payment updatePayment(UUID id, Payment paymentDetails, UUID organizationId, UUID branchId) {
        Payment payment = getPaymentById(id, organizationId, branchId);
        payment.setAmount(paymentDetails.getAmount());
        payment.setPaymentDate(paymentDetails.getPaymentDate());
        payment.setStatus(paymentDetails.getStatus());
        payment.setPaymentMethod(paymentDetails.getPaymentMethod());
        return paymentRepository.save(payment);
    }

    @Override
    public void voidPayment(UUID id, UUID organizationId, UUID branchId) {
        Payment payment = getPaymentById(id, organizationId, branchId);
        payment.setStatus("VOIDED");
        paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getIncome(UUID organizationId, UUID branchId) {
        return paymentRepository.findByOrgAndBranchAndStatus(organizationId, branchId, "PAID");
    }

    @Override
    public List<Expense> getExpenses(UUID organizationId, UUID branchId) {
        return expenseRepository.findByOrgAndBranch(organizationId, branchId);
    }

    @Override
    public Expense recordExpense(Expense expense, UUID organizationId, UUID branchId) {
        if (expense.getExpenseDate() == null) {
            expense.setExpenseDate(LocalDate.now());
        }
        expense.setOrganizationId(organizationId);
        expense.setBranchId(branchId);
        return expenseRepository.save(expense);
    }

    @Override
    public List<Map<String, Object>> getSalaryRecords(UUID organizationId, UUID branchId) {
        List<User> staffList;
        if (branchId != null) {
            staffList = userRepository.findByBranchId(branchId);
        } else {
            staffList = userRepository.findByOrganizationId(organizationId);
        }
        return staffList.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("staffId", s.getId());
            map.put("name", s.getName());
            map.put("salary", s.getSalary());
            map.put("paymentStatus", s.getPaymentStatus());
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getProfitLossReport(UUID organizationId, UUID branchId) {
        BigDecimal income = paymentRepository.sumAmountByOrgAndBranchAndStatus(organizationId, branchId, "PAID");
        if (income == null) income = BigDecimal.ZERO;

        BigDecimal operationalExpenses = expenseRepository.sumAmountByOrgAndBranch(organizationId, branchId);
        if (operationalExpenses == null) operationalExpenses = BigDecimal.ZERO;

        BigDecimal staffSalaries = userRepository.sumSalaryByOrgAndBranch(organizationId, branchId);
        if (staffSalaries == null) staffSalaries = BigDecimal.ZERO;

        BigDecimal totalExpenses = operationalExpenses.add(staffSalaries);
        BigDecimal netIncome = income.subtract(totalExpenses);

        Map<String, Object> report = new HashMap<>();
        report.put("totalRevenue", income);
        report.put("operationalExpenses", operationalExpenses);
        report.put("staffSalaries", staffSalaries);
        report.put("totalExpenses", totalExpenses);
        report.put("netIncome", netIncome);
        report.put("date", LocalDate.now());
        return report;
    }

    @Override
    public Map<String, Object> getCashflow(UUID organizationId, UUID branchId) {
        BigDecimal cashIn = paymentRepository.sumAmountByOrgAndBranchAndStatus(organizationId, branchId, "PAID");
        if (cashIn == null) cashIn = BigDecimal.ZERO;

        BigDecimal cashOut = expenseRepository.sumAmountByOrgAndBranch(organizationId, branchId);
        if (cashOut == null) cashOut = BigDecimal.ZERO;

        Map<String, Object> cashflow = new HashMap<>();
        cashflow.put("cashInflows", cashIn);
        cashflow.put("cashOutflows", cashOut);
        cashflow.put("netCashFlow", cashIn.subtract(cashOut));
        return cashflow;
    }

    @Override
    public List<Payment> getPendingPayments(UUID organizationId, UUID branchId) {
        return paymentRepository.findByOrgAndBranchAndStatus(organizationId, branchId, "PENDING");
    }

    @Override
    public String exportTransactions(UUID organizationId, UUID branchId) {
        StringBuilder csv = new StringBuilder("Type,ID,Amount,Date,Status,Method/Category\n");

        List<Payment> payments = getPayments(organizationId, branchId);
        for (Payment p : payments) {
            csv.append("INCOME,").append(p.getId()).append(",")
               .append(p.getAmount()).append(",")
               .append(p.getPaymentDate()).append(",")
               .append(p.getStatus()).append(",")
               .append(p.getPaymentMethod()).append("\n");
        }

        List<Expense> expenses = getExpenses(organizationId, branchId);
        for (Expense e : expenses) {
            csv.append("EXPENSE,").append(e.getId()).append(",")
               .append(e.getAmount()).append(",")
               .append(e.getExpenseDate()).append(",")
               .append("PAID,").append(e.getCategory()).append("\n");
        }
        return csv.toString();
    }

    @Override
    public String generateInvoice(UUID id, UUID organizationId, UUID branchId) {
        Payment payment = getPaymentById(id, organizationId, branchId);
        return "=== INVOICE ===\n" +
               "Payment ID: " + payment.getId() + "\n" +
               "Date: " + payment.getPaymentDate() + "\n" +
               "Amount: $" + payment.getAmount() + "\n" +
               "Status: " + payment.getStatus() + "\n" +
               "Method: " + payment.getPaymentMethod() + "\n" +
               "===============\n";
    }

    private void validateAccess(UUID recordOrg, UUID recordBranch, UUID requestOrg, UUID requestBranch) {
        if (!Objects.equals(recordOrg, requestOrg)) {
            throw new IllegalArgumentException("Payment not found"); // Avoid leaking existence
        }
        if (requestBranch != null && !Objects.equals(recordBranch, requestBranch)) {
            throw new IllegalArgumentException("Payment not found");
        }
    }
}
