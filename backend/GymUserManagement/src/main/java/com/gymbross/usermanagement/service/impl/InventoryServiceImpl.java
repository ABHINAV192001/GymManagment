package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.Branch;
import com.Gym.GymCommonServices.entity.Inventory;
import com.gymbross.usermanagement.dto.InventoryDto;
import com.gymbross.usermanagement.repository.InventoryRepository;
import com.gymbross.usermanagement.repository.BranchRepository;
import com.gymbross.usermanagement.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final BranchRepository branchRepository;

    @Override
    public List<InventoryDto> getAllInventory(java.util.UUID orgId, java.util.UUID branchId) {
        List<Inventory> inventories;
        if (branchId != null) {
            inventories = inventoryRepository.findByBranchId(branchId);
        } else {
            inventories = inventoryRepository.findByOrganizationId(orgId);
        }
        return inventories.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void addInventory(InventoryDto dto, java.util.UUID orgId, java.util.UUID branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        if (!branch.getOrganization().getId().equals(orgId)) {
            throw new RuntimeException("Unauthorized: Branch does not belong to your organization");
        }

        Inventory inventory = Inventory.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .quantity(dto.getQuantity())
                .category(dto.getCategory())
                .condition(dto.getCondition())
                .purchaseDate(dto.getPurchaseDate())
                .branch(branch)
                .build();

        inventoryRepository.save(inventory);
    }

    @Override
    public void removeInventory(java.util.UUID inventoryId, java.util.UUID orgId, java.util.UUID branchId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        if (!inventory.getBranch().getOrganization().getId().equals(orgId)) {
            throw new RuntimeException("Unauthorized: Cannot remove inventory from another organization");
        }
        if (branchId != null && !inventory.getBranch().getId().equals(branchId)) {
            throw new RuntimeException("Unauthorized: Cannot remove inventory from another branch");
        }

        inventoryRepository.delete(inventory);
    }

    @Override
    public void updateInventory(java.util.UUID inventoryId, InventoryDto dto, java.util.UUID orgId, java.util.UUID branchId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        if (!inventory.getBranch().getOrganization().getId().equals(orgId)) {
            throw new RuntimeException("Unauthorized: Cannot update inventory from another organization");
        }
        if (branchId != null && !inventory.getBranch().getId().equals(branchId)) {
            throw new RuntimeException("Unauthorized: Cannot update inventory from another branch");
        }

        inventory.setName(dto.getName());
        inventory.setDescription(dto.getDescription());
        inventory.setQuantity(dto.getQuantity());
        inventory.setCategory(dto.getCategory());
        inventory.setCondition(dto.getCondition());
        if (dto.getPurchaseDate() != null) {
            inventory.setPurchaseDate(dto.getPurchaseDate());
        }

        inventoryRepository.save(inventory);
    }

    private InventoryDto mapToDto(Inventory inventory) {
        return InventoryDto.builder()
                .id(inventory.getId())
                .name(inventory.getName())
                .description(inventory.getDescription())
                .quantity(inventory.getQuantity())
                .category(inventory.getCategory())
                .condition(inventory.getCondition())
                .purchaseDate(inventory.getPurchaseDate())
                .build();
    }

    @Override
    public Page<InventoryDto> getFilteredInventory(java.util.UUID orgId, java.util.UUID branchId, String period, List<String> condition,
            Pageable pageable) {
        Specification<Inventory> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Org/Branch Filter
            predicates.add(criteriaBuilder.equal(root.get("branch").get("organization").get("id"), orgId));
            if (branchId != null) {
                predicates.add(criteriaBuilder.equal(root.get("branch").get("id"), branchId));
            }

            // 2. Date/Period Filter
            LocalDateTime since = calculateSince(period);
            if (since != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), since));
            }

            // 3. Condition Filter
            if (condition != null && !condition.isEmpty()) {
                predicates.add(root.get("condition").in(condition));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Inventory> inventoryPage = inventoryRepository.findAll(spec, pageable);
        return inventoryPage.map(this::mapToDto);
    }

    private LocalDateTime calculateSince(String period) {
        LocalDateTime now = LocalDateTime.now();
        if (period == null)
            return now.minusDays(3);

        switch (period.toLowerCase()) {
            case "all":
                return LocalDateTime.of(1970, 1, 1, 0, 0);
            case "15days":
            case "15d":
                return now.minusDays(15);
            case "30days":
            case "30d":
            case "month":
                return now.minusDays(30);
            default:
                return now.minusDays(3); // Default 3 days
        }
    }
}
