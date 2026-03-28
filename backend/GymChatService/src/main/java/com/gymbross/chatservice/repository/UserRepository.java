package com.gymbross.chatservice.repository;

import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository("chatUserRepository")
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByRoleIn(List<Role> roles);

    List<User> findByBranchId(Long branchId);

    List<User> findByBranchIdInAndRoleIn(List<Long> branchIds, List<Role> roles);
}
