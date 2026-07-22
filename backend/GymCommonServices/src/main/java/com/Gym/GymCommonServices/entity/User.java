package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;

@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@SQLRestriction("deleted_at IS NULL")
public class User extends com.Gym.GymCommonServices.common.AuthenticatablePrincipal implements UserDetails {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Branch branch;

    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    private String phone;

    @Column(name = "user_code", nullable = false)
    private String userCode;

    @Column(nullable = false)
    private String name;

    private String gender;

    private LocalDate dob;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_email_verified", nullable = false)
    private Boolean isEmailVerified = false;

    @Builder.Default
    @Column(name = "is_phone_verified", nullable = false)
    private Boolean isPhoneVerified = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "created_by")
    private java.util.UUID createdBy;

    @Column(name = "accessible_branch_ids", columnDefinition = "jsonb")
    private String accessibleBranchIds;

    public java.util.List<java.util.UUID> getAccessibleBranchUUIDs() {
        if (accessibleBranchIds == null || accessibleBranchIds.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        try {
            String clean = accessibleBranchIds.replaceAll("[\\[\\]\"\\s]", "");
            if (clean.isEmpty()) return java.util.Collections.emptyList();
            String[] parts = clean.split(",");
            java.util.List<java.util.UUID> list = new java.util.ArrayList<>();
            for (String p : parts) {
                if (!p.trim().isEmpty()) {
                    list.add(java.util.UUID.fromString(p.trim()));
                }
            }
            return list;
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Set<RbacRole> roles = new HashSet<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private StaffProfile staffProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private MemberProfile memberProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private WeeklyWorkoutPlan weeklyPlan;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<UserDietPlan> dietPlans = new ArrayList<>();

    // =========================================================================
    // DEPRECATED BRIDGE METHODS FOR BACKWARD COMPATIBILITY
    // =========================================================================

    @Deprecated
    public Plan getPlan() {
        return memberProfile != null ? memberProfile.getPlan() : null;
    }

    @Deprecated
    public void setPlan(Plan plan) {
        if (memberProfile != null) memberProfile.setPlan(plan);
    }

    @Deprecated
    public java.math.BigDecimal getAmountPaid() {
        return java.math.BigDecimal.ZERO;
    }

    @Deprecated
    public void setAmountPaid(java.math.BigDecimal amount) {
    }

    @Deprecated
    public java.time.LocalDate getStartDate() {
        return null;
    }

    @Deprecated
    public void setStartDate(java.time.LocalDate date) {
    }

    @Deprecated
    public Integer getAttendanceCount() {
        return 0; // Deprecated, to be moved to memberProfile or a separate attendance service
    }

    @Deprecated
    public void setAttendanceCount(Integer count) {
        // No-op for now
    }

    @Deprecated
    public User getTrainer() {
        return memberProfile != null ? memberProfile.getTrainer() : null;
    }

    @Deprecated
    public void setTrainer(User trainer) {
        if (memberProfile != null) memberProfile.setTrainer(trainer);
    }

    @Deprecated
    public String getRole() {
        if (roles != null && !roles.isEmpty()) return roles.iterator().next().getName();
        return "USER";
    }

    @Deprecated
    public void setRole(String role) {
        // No-op. Use roles Set instead.
    }

    @Deprecated
    public void setRole(Object role) {
        // No-op. Use roles Set instead.
    }
    
    @Deprecated
    public String getAdminCode() {
        return userCode;
    }

    @Deprecated
    public void setAdminCode(String adminCode) {
        this.userCode = adminCode;
    }

    @Deprecated
    public String getTrainerCode() {
        return userCode;
    }

    @Deprecated
    public void setTrainerCode(String trainerCode) {
        this.userCode = trainerCode;
    }

    @Deprecated
    public String getStaffCode() {
        if (staffProfile != null) return userCode;
        if (userCode != null && userCode.startsWith("STF-")) return userCode;
        return null;
    }

    @Deprecated
    public void setStaffCode(String staffCode) {
        this.userCode = staffCode;
    }

    @Deprecated
    public java.math.BigDecimal getSalary() {
        return staffProfile != null ? staffProfile.getSalary() : java.math.BigDecimal.ZERO;
    }

    @Deprecated
    public void setSalary(java.math.BigDecimal salary) {
        if (staffProfile != null) staffProfile.setSalary(salary);
    }

    @Deprecated
    public String getShiftTimings() {
        return staffProfile != null ? staffProfile.getShiftTimings() : null;
    }

    @Deprecated
    public void setShiftTimings(String shiftTimings) {
        if (staffProfile != null) staffProfile.setShiftTimings(shiftTimings);
    }

    @Deprecated
    public Integer getExperience() {
        return staffProfile != null ? staffProfile.getExperienceYears() : 0;
    }

    @Deprecated
    public void setExperience(Integer experience) {
        if (staffProfile != null) staffProfile.setExperienceYears(experience);
    }

    @Deprecated
    public String getPaymentStatus() {
        return "PAID";
    }

    @Deprecated
    public void setPaymentStatus(String paymentStatus) {
    }

    @Deprecated
    public Boolean getIsPersonalTrainer() {
        return staffProfile != null ? staffProfile.getIsPersonalTrainer() : false;
    }

    @Deprecated
    public void setIsPersonalTrainer(Boolean isPersonalTrainer) {
        if (staffProfile != null) staffProfile.setIsPersonalTrainer(isPersonalTrainer);
    }

    @Deprecated
    public Integer getAge() {
        if (dob != null) {
            return java.time.Period.between(dob, java.time.LocalDate.now()).getYears();
        }
        return null;
    }

    @Deprecated
    public void setAge(Integer age) {
        if (age != null && dob == null) {
            this.dob = java.time.LocalDate.now().minusYears(age);
        }
    }

    @Deprecated
    public Double getHeight() {
        return memberProfile != null && memberProfile.getHeightCm() != null ? memberProfile.getHeightCm().doubleValue() : null;
    }

    @Deprecated
    public void setHeight(Double height) {
        if (memberProfile != null && height != null) memberProfile.setHeightCm(java.math.BigDecimal.valueOf(height));
    }

    @Deprecated
    public Double getWeight() {
        return memberProfile != null && memberProfile.getWeightKg() != null ? memberProfile.getWeightKg().doubleValue() : null;
    }

    @Deprecated
    public void setWeight(Double weight) {
        if (memberProfile != null && weight != null) memberProfile.setWeightKg(java.math.BigDecimal.valueOf(weight));
    }

    @Deprecated
    public String getActivityLevel() {
        return memberProfile != null ? memberProfile.getActivityLevel() : null;
    }

    @Deprecated
    public void setActivityLevel(String activityLevel) {
        if (memberProfile != null) memberProfile.setActivityLevel(activityLevel);
    }

    @Deprecated
    public String getGoal() {
        return memberProfile != null ? memberProfile.getFitnessGoal() : null;
    }

    @Deprecated
    public void setGoal(String goal) {
        if (memberProfile != null) memberProfile.setFitnessGoal(goal);
    }

    @Deprecated
    public void setIsOnboardingCompleted(boolean completed) {
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        if (roles != null) {
            for (RbacRole role : roles) {
                // Plain name so hasAnyAuthority('ORG_ADMIN') matches, prefixed for hasRole().
                authorities.add(new SimpleGrantedAuthority(role.getName().toUpperCase()));
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
                if (role.getPermissions() != null) {
                    for (RbacPermission permission : role.getPermissions()) {
                        authorities.add(new SimpleGrantedAuthority(permission.getSubModule()));
                    }
                }
            }
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isCurrentlyLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(isActive) && !Boolean.TRUE.equals(isDeleted);
    }    @Deprecated
    public java.util.List<String> getWorkoutPlan() {
        if (memberProfile != null && memberProfile.getMetadata() != null) {
            Object plan = memberProfile.getMetadata().get("workoutPlan");
            if (plan instanceof java.util.List) {
                return (java.util.List<String>) plan;
            }
        }
        return new java.util.ArrayList<>();
    }

    @Deprecated
    public void setWorkoutPlan(java.util.List<String> workoutPlan) {
        if (memberProfile != null) {
            if (memberProfile.getMetadata() == null) {
                memberProfile.setMetadata(new java.util.HashMap<>());
            }
            memberProfile.getMetadata().put("workoutPlan", workoutPlan);
        }
    }

    @Deprecated
    public java.util.List<String> getDietPlan() {
        if (memberProfile != null && memberProfile.getMetadata() != null) {
            Object plan = memberProfile.getMetadata().get("dietPlan");
            if (plan instanceof java.util.List) {
                return (java.util.List<String>) plan;
            }
        }
        return new java.util.ArrayList<>();
    }

    @Deprecated
    public void setDietPlan(java.util.List<String> dietPlan) {
        if (memberProfile != null) {
            if (memberProfile.getMetadata() == null) {
                memberProfile.setMetadata(new java.util.HashMap<>());
            }
            memberProfile.getMetadata().put("dietPlan", dietPlan);
        }
    }
}
