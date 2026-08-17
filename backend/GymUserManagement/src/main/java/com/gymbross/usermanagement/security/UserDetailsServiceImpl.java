package com.gymbross.usermanagement.security;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Primary // ✅ VERY IMPORTANT
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier)
            throws UsernameNotFoundException {

        // ✅ User (Unified Identity)
        Optional<User> userOpt = userRepository.findTopByEmailIgnoreCase(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(identifier);
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("UserDetailsService: Found User: " + user.getUsername());
            return user;
        }

        throw new UsernameNotFoundException(
                "User not found with identifier: " + identifier);
    }
}
