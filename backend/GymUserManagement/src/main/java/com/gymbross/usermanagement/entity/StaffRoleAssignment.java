package com.gymbross.usermanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "staff_role_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"staff_id", "role_id"})
})
public class StaffRoleAssignment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    @Column(name = "role_id", nullable = false)
    private UUID roleId;
}
