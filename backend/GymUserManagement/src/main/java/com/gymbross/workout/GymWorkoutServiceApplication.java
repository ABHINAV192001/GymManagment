package com.gymbross.workout;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableFeignClients
@EntityScan(basePackages = { "com.Gym.GymCommonServices.entity", "com.gymbross.workout.entity" })
@EnableJpaRepositories(basePackages = { "com.Gym.GymCommonServices.repository", "com.gymbross.workout.repository" })
@ComponentScan(basePackages = { "com.Gym.GymCommonServices", "com.gymbross.workout" })
public class GymWorkoutServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GymWorkoutServiceApplication.class, args);
    }

}
