package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "session_votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "session_id", "username" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionVote extends com.Gym.GymCommonServices.common.BaseEntity {

    

    @Column(name = "session_id", nullable = false)
    private java.util.UUID sessionId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String voteType; // IN or OUT

    }
