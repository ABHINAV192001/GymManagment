package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.entity.StaffShift;
import com.gymbross.usermanagement.repository.StaffShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shifts")
public class StaffShiftController {

    @Autowired
    private StaffShiftRepository staffShiftRepository;

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<StaffShift>> getShiftsByOrg(@PathVariable UUID orgId) {
        return ResponseEntity.ok(staffShiftRepository.findByOrgId(orgId));
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<StaffShift>> getShiftsByBranch(@PathVariable UUID branchId) {
        return ResponseEntity.ok(staffShiftRepository.findByBranchId(branchId));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<StaffShift>> getShiftsByStaff(@PathVariable UUID staffId) {
        return ResponseEntity.ok(staffShiftRepository.findByStaffId(staffId));
    }

    @PostMapping
    public ResponseEntity<StaffShift> createShift(@RequestBody StaffShift shift) {
        return ResponseEntity.ok(staffShiftRepository.save(shift));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffShift> updateShift(@PathVariable UUID id, @RequestBody StaffShift shiftDetails) {
        return staffShiftRepository.findById(id).map(shift -> {
            shift.setStaff(shiftDetails.getStaff());
            shift.setStartTime(shiftDetails.getStartTime());
            shift.setEndTime(shiftDetails.getEndTime());
            shift.setTaskDescription(shiftDetails.getTaskDescription());
            return ResponseEntity.ok(staffShiftRepository.save(shift));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShift(@PathVariable UUID id) {
        return staffShiftRepository.findById(id).map(shift -> {
            staffShiftRepository.delete(shift);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
