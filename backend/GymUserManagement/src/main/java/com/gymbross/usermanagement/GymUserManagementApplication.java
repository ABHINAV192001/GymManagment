package com.gymbross.usermanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = { 
	"com.gymbross.usermanagement", 
	"com.gymbross.workout", 
	"com.gymbross.chatservice", 
	"com.Gym.GymCommonServices" 
})
@EntityScan(basePackages = { 
	"com.gymbross.usermanagement.entity", 
	"com.gymbross.workout.entity", 
	"com.gymbross.chatservice.entity", 
	"com.Gym.GymCommonServices.entity" 
})
@EnableJpaRepositories(basePackages = { 
	"com.gymbross.usermanagement.repository", 
	"com.gymbross.workout.repository", 
	"com.gymbross.chatservice.repository", 
	"com.Gym.GymCommonServices.repository" 
})
@EnableAsync
public class GymUserManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(GymUserManagementApplication.class, args);
	}

}
// the main file
