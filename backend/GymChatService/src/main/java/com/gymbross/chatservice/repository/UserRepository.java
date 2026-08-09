package com.gymbross.chatservice.repository;

import com.Gym.GymCommonServices.entity.Role;
import com.Gym.GymCommonServices.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, java.util.UUID> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    
    // Required by FitnessSessionService for notification routing
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE u.branch.id IN :branchIds AND r.name IN :roleNames")
    List<User> findByBranchIdInAndRoleNamesIn(@org.springframework.data.repository.query.Param("branchIds") List<java.util.UUID> branchIds, @org.springframework.data.repository.query.Param("roleNames") List<String> roleNames);
}
