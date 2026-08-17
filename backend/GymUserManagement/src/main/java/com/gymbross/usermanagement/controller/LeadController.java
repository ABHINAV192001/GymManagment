package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.entity.Lead;
import com.gymbross.usermanagement.repository.LeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads")
public class LeadController {

    @Autowired
    private LeadRepository leadRepository;

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<Lead>> getLeadsByOrg(@PathVariable UUID orgId) {
        return ResponseEntity.ok(leadRepository.findByOrgId(orgId));
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<Lead>> getLeadsByBranch(@PathVariable UUID branchId) {
        return ResponseEntity.ok(leadRepository.findByBranchId(branchId));
    }

    @PostMapping
    public ResponseEntity<Lead> createLead(@RequestBody Lead lead) {
        if (lead.getStatus() == null) {
            lead.setStatus("NEW");
        }
        return ResponseEntity.ok(leadRepository.save(lead));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable UUID id, @RequestBody Lead leadDetails) {
        return leadRepository.findById(id).map(lead -> {
            lead.setName(leadDetails.getName());
            lead.setPhone(leadDetails.getPhone());
            lead.setEmail(leadDetails.getEmail());
            lead.setSource(leadDetails.getSource());
            lead.setStatus(leadDetails.getStatus());
            lead.setNotes(leadDetails.getNotes());
            return ResponseEntity.ok(leadRepository.save(lead));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable UUID id) {
        return leadRepository.findById(id).map(lead -> {
            leadRepository.delete(lead);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
