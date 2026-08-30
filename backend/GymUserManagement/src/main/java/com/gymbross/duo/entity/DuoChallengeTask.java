package com.gymbross.duo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "duo_challenge_tasks")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DuoChallengeTask {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "tasks"})
    private DuoChallenge challenge;

    @Column(name = "day_index", nullable = false)
    private Integer dayIndex;

    @Column(name = "day_of_week")
    private String dayOfWeek;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    @Column(name = "points", nullable = false)
    @Builder.Default
    private Integer points = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
