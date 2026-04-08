package com.gymbross.chatservice.repository;

import com.Gym.GymCommonServices.entity.Role;
import com.Gym.GymCommonServices.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    
    // Required by FitnessSessionService for notification routing
    List<User> findByBranchIdInAndRoleIn(List<Long> branchIds, List<Role> roles);
}
