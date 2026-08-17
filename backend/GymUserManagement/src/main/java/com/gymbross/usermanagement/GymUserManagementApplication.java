package com.gymbross.usermanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = { "com.gymbross.usermanagement", "com.Gym.GymCommonServices" })
@EntityScan(basePackages = { "com.gymbross.usermanagement.entity", "com.Gym.GymCommonServices.entity" })
@EnableJpaRepositories(basePackages = { "com.gymbross.usermanagement.repository", "com.Gym.GymCommonServices.repository" })
public class GymUserManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(GymUserManagementApplication.class, args);
	}

}
// the main file
