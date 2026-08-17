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
        BigDecimal totalIncome = paymentRepository.sumIncomeByOrgAndBranch(organizationId, branchId);
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
        if (payment.getStatus() == null || payment.getStatus().trim().isEmpty()) {
            payment.setStatus("COMPLETED");
        }
        if (payment.getReferenceNo() == null || payment.getReferenceNo().trim().isEmpty()) {
            payment.setReferenceNo("TXN" + System.currentTimeMillis());
        }
        if (payment.getPaymentType() == null || payment.getPaymentType().trim().isEmpty()) {
            payment.setPaymentType("MEMBERSHIP");
        }
        payment.setOrganizationId(organizationId);
        if (payment.getBranchId() == null) {
            payment.setBranchId(branchId);
        }
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
        if (paymentDetails.getPaymentType() != null) payment.setPaymentType(paymentDetails.getPaymentType());
        if (paymentDetails.getReferenceNo() != null) payment.setReferenceNo(paymentDetails.getReferenceNo());
        if (paymentDetails.getNotes() != null) payment.setNotes(paymentDetails.getNotes());
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
        return paymentRepository.findIncomeByOrgAndBranch(organizationId, branchId);
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
    public Map<String, Object> getStaffSalaryComponents(UUID staffId, String period, UUID organizationId, UUID branchId) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (staff.getOrganization() != null && !staff.getOrganization().getId().equals(organizationId)) {
            throw new RuntimeException("Staff does not belong to this organization");
        }
        if (branchId != null && !branchId.equals(staff.getBranch().getId())) {
            throw new RuntimeException("Staff does not belong to this branch");
        }

        BigDecimal baseSalary = staff.getSalary() != null ? staff.getSalary() : BigDecimal.ZERO;
        
        List<Payment> ptPayments = paymentRepository.findPtPaymentsForStaff(staffId);
        
        // Filter by period if provided (e.g. "2026-08")
        if (period != null && !period.isEmpty()) {
            ptPayments = ptPayments.stream()
                .filter(p -> {
                    LocalDate d = p.getPaymentDate();
                    String pStr = d.getYear() + "-" + String.format("%02d", d.getMonthValue());
                    return pStr.equals(period);
                })
                .collect(Collectors.toList());
        }

        BigDecimal ptCommissionTotal = BigDecimal.ZERO;
        BigDecimal ptTrainerPercentage = staff.getPtTrainerPercentage();
        if (ptTrainerPercentage == null) {
            ptTrainerPercentage = staff.getBranch() != null ? staff.getBranch().getDefaultPtTrainerPercentage() : null;
        }

        if (Boolean.TRUE.equals(staff.getIsPersonalTrainer()) && ptTrainerPercentage != null) {
            BigDecimal ptRevenueTotal = ptPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            ptCommissionTotal = ptRevenueTotal.multiply(ptTrainerPercentage).divide(new BigDecimal("100"));
        }

        BigDecimal netSalary = baseSalary.add(ptCommissionTotal);

        Map<String, Object> result = new HashMap<>();
        result.put("staffId", staff.getId());
        result.put("name", staff.getName());
        result.put("period", period);
        result.put("baseSalary", baseSalary);
        result.put("ptCommissionTotal", ptCommissionTotal);
        result.put("ptTrainerPercentage", ptTrainerPercentage);
        result.put("netSalary", netSalary);
        
        return result;
    }

    @Override
    public Map<String, Object> getProfitLossReport(UUID organizationId, UUID branchId) {
        BigDecimal income = paymentRepository.sumIncomeByOrgAndBranch(organizationId, branchId);
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
        BigDecimal cashIn = paymentRepository.sumIncomeByOrgAndBranch(organizationId, branchId);
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
