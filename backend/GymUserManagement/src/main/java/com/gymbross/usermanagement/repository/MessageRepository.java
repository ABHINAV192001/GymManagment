package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderId = :user1 AND m.receiverId = :user2) OR " +
            "(m.senderId = :user2 AND m.receiverId = :user1) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("user1") String user1, @Param("user2") String user2);

    @Query("SELECT m FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId ORDER BY m.timestamp ASC")
    List<Message> findAllMessagesForUser(@Param("userId") String userId);

    @Query("SELECT m FROM Message m WHERE m.receiverId = :userId AND m.isRead = false")
    List<Message> findUnreadMessages(@Param("userId") String userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.receiverId = :receiverId AND m.senderId = :senderId AND m.isRead = false")
    void markMessagesAsRead(@Param("receiverId") String receiverId, @Param("senderId") String senderId);
}
