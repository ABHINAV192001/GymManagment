package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.StaffShiftDto;
import com.gymbross.usermanagement.service.StaffShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shifts")
@RequiredArgsConstructor
public class StaffShiftController {

    private final StaffShiftService staffShiftService;

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<StaffShiftDto>> getShiftsByOrg(@PathVariable UUID orgId) {
        return ResponseEntity.ok(staffShiftService.getShiftsByOrg(orgId));
    }

    @GetMapping("/org/{orgId}/month")
    public ResponseEntity<List<StaffShiftDto>> getShiftsByOrgAndMonth(
            @PathVariable UUID orgId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(staffShiftService.getShiftsByOrgAndMonth(orgId, year, month));
    }

    @GetMapping("/org/{orgId}/range")
    public ResponseEntity<List<StaffShiftDto>> getShiftsByOrgAndDateRange(
            @PathVariable UUID orgId,
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(staffShiftService.getShiftsByOrgAndDateRange(
                orgId, LocalDate.parse(from), LocalDate.parse(to)));
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<StaffShiftDto>> getShiftsByBranch(@PathVariable UUID branchId) {
        return ResponseEntity.ok(staffShiftService.getShiftsByBranch(branchId));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<StaffShiftDto>> getShiftsByStaff(@PathVariable UUID staffId) {
        return ResponseEntity.ok(staffShiftService.getShiftsByStaff(staffId));
    }

    @PostMapping
    public ResponseEntity<StaffShiftDto> createShift(@RequestBody StaffShiftDto.CreateRequest request) {
        return ResponseEntity.ok(staffShiftService.createShift(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffShiftDto> updateShift(
            @PathVariable UUID id,
            @RequestBody StaffShiftDto.CreateRequest request) {
        return ResponseEntity.ok(staffShiftService.updateShift(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShift(@PathVariable UUID id) {
        staffShiftService.deleteShift(id);
        return ResponseEntity.noContent().build();
    }
}
