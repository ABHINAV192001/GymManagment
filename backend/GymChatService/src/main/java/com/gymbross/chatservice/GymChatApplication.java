package com.gymbross.chatservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages = { "com.Gym.GymCommonServices.entity",
        "com.gymbross.chatservice.model" })
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages = {
        "com.Gym.GymCommonServices.repository", "com.gymbross.chatservice.repository" })
public class GymChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(GymChatApplication.class, args);
    }
}
