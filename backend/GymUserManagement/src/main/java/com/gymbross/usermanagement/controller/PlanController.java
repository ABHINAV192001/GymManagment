package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.entity.Plan;
import com.gymbross.usermanagement.repository.PlanRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanRepository planRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('PLANS:VIEW')")
    public ResponseEntity<ApiResponse<List<Plan>>> getPlans(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(value = "branchId", required = false) UUID branchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(planRepository.findByOrganizationIdAndBranchIdAndIsDeletedFalse(orgId, branchId), page, size));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PLANS:CREATE')")
    public ResponseEntity<ApiResponse<Plan>> createPlan(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestBody Plan plan) {
        plan.setOrganizationId(orgId);
        plan.setDeleted(false);
        plan.setActive(true);
        return ResponseEntity.ok(ApiResponse.success(planRepository.save(plan), "Plan created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PLANS:VIEW')")
    public ResponseEntity<ApiResponse<Plan>> getPlanById(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID id) {
        Plan plan = planRepository.findByIdAndOrganizationIdAndIsDeletedFalse(id, orgId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        return ResponseEntity.ok(ApiResponse.success(plan));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PLANS:EDIT')")
    public ResponseEntity<ApiResponse<Plan>> updatePlan(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID id, 
            @RequestBody Plan planDetails) {
        Plan plan = planRepository.findByIdAndOrganizationIdAndIsDeletedFalse(id, orgId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));

        plan.setName(planDetails.getName());
        plan.setDescription(planDetails.getDescription());
        plan.setDurationDays(planDetails.getDurationDays());
        plan.setPrice(planDetails.getPrice());
        plan.setPlanType(planDetails.getPlanType());
        plan.setBranchId(planDetails.getBranchId());
        plan.setMaxMembers(planDetails.getMaxMembers());
        plan.setSortOrder(planDetails.getSortOrder());

        return ResponseEntity.ok(ApiResponse.success(planRepository.save(plan), "Plan updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PLANS:DELETE')")
    public ResponseEntity<ApiResponse<Void>> deletePlan(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID id) {
        Plan plan = planRepository.findByIdAndOrganizationIdAndIsDeletedFalse(id, orgId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        plan.setDeleted(true);
        planRepository.save(plan);
        return ResponseEntity.ok(ApiResponse.success(null, "Plan soft-deleted successfully"));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('PLANS:EDIT')")
    public ResponseEntity<ApiResponse<Plan>> toggleActivation(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID id, 
            @RequestParam boolean active) {
        Plan plan = planRepository.findByIdAndOrganizationIdAndIsDeletedFalse(id, orgId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        plan.setActive(active);
        return ResponseEntity.ok(ApiResponse.success(planRepository.save(plan), "Plan activation toggled successfully"));
    }

    @GetMapping("/{id}/subscribers")
    @PreAuthorize("hasAuthority('PLANS:VIEW')")
    public ResponseEntity<ApiResponse<List<User>>> getSubscribers(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID id,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Plan plan = planRepository.findByIdAndOrganizationIdAndIsDeletedFalse(id, orgId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        List<User> subscribers = userRepository.findByPlanName(plan.getName());
        subscribers = subscribers.stream()
                .filter(u -> u.getOrganization() != null && u.getOrganization().getId().equals(orgId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.paginated(subscribers, page, size));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('PLANS:VIEW')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlanStats(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(value = "branchId", required = false) UUID branchId) {
        List<Plan> plans = planRepository.findByOrganizationIdAndBranchIdAndIsDeletedFalse(orgId, branchId);
        long totalPlans = plans.size();
        
        long totalSubscribers = 0;
        BigDecimal totalPotentialRevenue = BigDecimal.ZERO;
        
        for (Plan plan : plans) {
            long subsCount = userRepository.findByPlanName(plan.getName()).stream()
                .filter(u -> u.getOrganization() != null && u.getOrganization().getId().equals(orgId) &&
                             (branchId == null || (u.getBranch() != null && u.getBranch().getId().equals(branchId))))
                .count();
            totalSubscribers += subsCount;
            BigDecimal planRev = plan.getPrice().multiply(BigDecimal.valueOf(subsCount));
            totalPotentialRevenue = totalPotentialRevenue.add(planRev);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPlans", totalPlans);
        stats.put("totalSubscribers", totalSubscribers);
        stats.put("totalPotentialRevenue", totalPotentialRevenue);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
