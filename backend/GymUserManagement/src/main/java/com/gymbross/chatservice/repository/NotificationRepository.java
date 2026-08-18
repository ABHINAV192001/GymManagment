package com.gymbross.chatservice.repository;

import com.Gym.GymCommonServices.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, java.util.UUID> {
    List<Notification> findByRecipientUsernameOrderByCreatedAtDesc(String recipientUsername);

    long countByRecipientUsernameAndIsReadFalse(String recipientUsername);
}
