package com.gymbross.usermanagement.security;

import com.Gym.GymCommonServices.entity.Admin;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.Trainer;
import com.Gym.GymCommonServices.entity.Staff;
import com.gymbross.usermanagement.repository.AdminRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.repository.TrainerRepository;
import com.gymbross.usermanagement.repository.PremiumUserRepository;
import com.gymbross.usermanagement.repository.StaffRepository;
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
    private final AdminRepository adminRepository;
    private final TrainerRepository trainerRepository;
    private final StaffRepository staffRepository;
    private final PremiumUserRepository premiumUserRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier)
            throws UsernameNotFoundException {

        // ✅ Admin
        Optional<Admin> adminOpt = adminRepository.findTopByEmailIgnoreCase(identifier);
        if (adminOpt.isEmpty())
            adminOpt = adminRepository.findByUsername(identifier);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            System.out.println(
                    "UserDetailsService: Found Admin: " + admin.getUsername() + " with role: " + admin.getRole());
            return admin;
        }

        // ✅ User
        Optional<User> userOpt = userRepository.findTopByEmailIgnoreCase(identifier);
        if (userOpt.isEmpty())
            userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isPresent())
            return userOpt.get();

        // ✅ Trainer
        Optional<Trainer> trainerOpt = trainerRepository.findTopByEmailIgnoreCase(identifier);
        if (trainerOpt.isEmpty())
            trainerOpt = trainerRepository.findByUsername(identifier);
        if (trainerOpt.isPresent())
            return trainerOpt.get();

        // ✅ Staff
        Optional<Staff> staffOpt = staffRepository.findTopByEmailIgnoreCase(identifier);
        if (staffOpt.isEmpty())
            staffOpt = staffRepository.findByUsername(identifier);
        if (staffOpt.isPresent())
            return staffOpt.get();

        // ✅ Premium User
        Optional<com.Gym.GymCommonServices.entity.PremiumUser> premiumOpt = premiumUserRepository
                .findTopByEmailIgnoreCase(identifier);
        if (premiumOpt.isEmpty())
            premiumOpt = premiumUserRepository.findByUsername(identifier);
        if (premiumOpt.isPresent())
            return premiumOpt.get();

        throw new UsernameNotFoundException(
                "User not found with identifier: " + identifier);
    }
}
