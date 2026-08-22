package com.gymbross.chatservice.repository;

import com.gymbross.chatservice.model.AiChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatSessionRepository extends JpaRepository<AiChatSession, String> {
    List<AiChatSession> findByUserIdOrderByUpdatedAtDesc(String userId);
}
