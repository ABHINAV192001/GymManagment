package com.gymbross.usermanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = { "com.gymbross", "com.Gym.GymCommonServices" })
@EntityScan(basePackages = { "com.gymbross", "com.Gym.GymCommonServices" })
@EnableJpaRepositories(basePackages = { "com.gymbross", "com.Gym.GymCommonServices" })
@EnableAsync
public class GymUserManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(GymUserManagementApplication.class, args);
	}

}
// the main file
