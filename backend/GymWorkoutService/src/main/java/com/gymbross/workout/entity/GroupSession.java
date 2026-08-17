package com.gymbross.workout.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Represents a scheduled group session (e.g., Zumba, Yoga, HIIT) created by an admin or trainer.
 * Stores target branches, notify roles, and available slot count so the data persists in the DB.
 */
@Entity
@Table(name = "group_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupSession {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    /** Session date */
    @Column(nullable = false)
    private LocalDate sessionDate;

    /** Session start time */
    @Column(nullable = false)
    private LocalTime sessionTime;

    /** Duration in minutes */
    @Column(nullable = false)
    private int durationMins;

    /** Total available booking slots */
    @Column(nullable = false)
    private int availableSlots;

    /** How many members have booked so far */
    @Column(nullable = false)
    private int bookedCount;

    /** Organisation this session belongs to */
    private UUID orgId;

    /**
     * Target branch IDs for this session.
     * Stored as a simple element collection (varchar array in Postgres).
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "group_session_branches", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "branch_id")
    private List<String> branchIds;

    /**
     * Roles to notify when this session is created (e.g., MEMBER, TRAINER).
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "group_session_notify_roles", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "role_name")
    private List<String> notifyRoles;

    /**
     * Users who have booked / voted IN for this session.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "group_session_attendees", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "user_id")
    private java.util.Set<UUID> attendeeIds;

    /**
     * Users who have voted OUT for this session.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "group_session_out_votes", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "user_id")
    private java.util.Set<UUID> outVoteIds;

    /** SCHEDULED | COMPLETED | CANCELLED */
    @Column(nullable = false)
    private String status;

    /** Reason provided by admin/trainer when cancelling the session */
    @Column(length = 1000)
    private String cancellationReason;

    /** Timestamp when session was cancelled */
    private LocalDateTime cancelledAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
