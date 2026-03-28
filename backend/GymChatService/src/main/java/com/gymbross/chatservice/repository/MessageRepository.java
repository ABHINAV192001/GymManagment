package com.gymbross.chatservice.repository;

import com.gymbross.chatservice.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<ChatMessage, Long> {

    // Fetch conversation between two users
    @Query("SELECT m FROM ChatMessage m WHERE (m.senderUsername = :user1 AND m.receiverUsername = :user2) OR (m.senderUsername = :user2 AND m.receiverUsername = :user1) ORDER BY m.timestamp ASC")
    List<ChatMessage> findConversation(@Param("user1") String user1, @Param("user2") String user2);

    List<ChatMessage> findBySenderUsernameOrReceiverUsernameOrderByTimestampDesc(String sender, String receiver);
}
