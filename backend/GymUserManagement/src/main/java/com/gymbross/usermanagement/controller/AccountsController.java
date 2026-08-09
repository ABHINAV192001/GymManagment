package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.entity.Expense;
import com.gymbross.usermanagement.entity.Payment;
import com.gymbross.usermanagement.service.AccountsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountsController {

    private final AccountsService accountsService;

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(accountsService.getSummary(organizationId, branchId)));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<List<Payment>>> getPayments(
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(accountsService.getPayments(organizationId, branchId), page, size));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAuthority('ACCOUNTS:CREATE')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<Payment>> recordPayment(
            @RequestBody Payment payment,
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(accountsService.recordPayment(payment, organizationId, branchId), "Payment recorded successfully"));
    }

    @GetMapping("/payments/{id}")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<Payment>> getPaymentById(
            @PathVariable UUID id,
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(accountsService.getPaymentById(id, organizationId, branchId)));
    }

    @PutMapping("/payments/{id}")
    @PreAuthorize("hasAuthority('ACCOUNTS:EDIT')")
    public ResponseEntity<ApiResponse<Payment>> updatePayment(
            @PathVariable UUID id, 
            @RequestBody Payment paymentDetails,
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(accountsService.updatePayment(id, paymentDetails, organizationId, branchId), "Payment updated successfully"));
    }

    @DeleteMapping("/payments/{id}")
    @PreAuthorize("hasAuthority('ACCOUNTS:DELETE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<ApiResponse<Void>> voidPayment(
            @PathVariable UUID id,
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        accountsService.voidPayment(id, organizationId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "Payment voided successfully"));
    }

    @GetMapping("/income")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<List<Payment>>> getIncome(
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(accountsService.getIncome(organizationId, branchId), page, size));
    }

    @GetMapping("/expenses")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<List<Expense>>> getExpenses(
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(accountsService.getExpenses(organizationId, branchId), page, size));
    }

    @PostMapping("/expenses")
    @PreAuthorize("hasAuthority('ACCOUNTS:CREATE')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<Expense>> recordExpense(
            @RequestBody Expense expense,
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(accountsService.recordExpense(expense, organizationId, branchId), "Expense recorded successfully"));
    }

    @GetMapping("/salary")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSalaryRecords(
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(accountsService.getSalaryRecords(organizationId, branchId), page, size));
    }

    @GetMapping("/salary/components/{staffId}")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStaffSalaryComponents(
            @PathVariable UUID staffId,
            @RequestParam(value = "period", required = false) String period,
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(accountsService.getStaffSalaryComponents(staffId, period, organizationId, branchId)));
    }

    @GetMapping("/pl-report")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfitLossReport(
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(accountsService.getProfitLossReport(organizationId, branchId)));
    }

    @GetMapping("/cashflow")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCashflow(
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(accountsService.getCashflow(organizationId, branchId)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ACCOUNTS:VIEW')")
    public ResponseEntity<ApiResponse<List<Payment>>> getPendingPayments(
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(accountsService.getPendingPayments(organizationId, branchId), page, size));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('ACCOUNTS:EXPORT')")
    public ResponseEntity<ApiResponse<String>> exportTransactions(
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(accountsService.exportTransactions(organizationId, branchId)));
    }

    @PostMapping("/payments/{id}/invoice")
    @PreAuthorize("hasAuthority('ACCOUNTS:EXPORT')")
    public ResponseEntity<ApiResponse<String>> generateInvoice(
            @PathVariable UUID id,
            @RequestAttribute("organizationId") UUID organizationId,
            @RequestAttribute(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(accountsService.generateInvoice(id, organizationId, branchId), "Invoice generated successfully"));
    }
}
