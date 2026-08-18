package com.gymbross.workout.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class GroupSessionDto {

    /**
     * Payload sent by the frontend when creating a group session.
     */
    @Data
    public static class CreateRequest {
        private String title;
        private String description;
        private LocalDate sessionDate;
        private LocalTime sessionTime;
        private int durationMins;
        private int availableSlots;
        private List<String> branchIds;
        private List<String> notifyRoles;
    }

    /**
     * Payload sent by the frontend when updating a group session.
     */
    @Data
    public static class UpdateRequest {
        private String title;
        private String description;
        private LocalDate sessionDate;
        private LocalTime sessionTime;
        private int durationMins;
        private int availableSlots;
        private List<String> branchIds;
        private List<String> notifyRoles;
    }

    /**
     * Payload sent when cancelling a session — must include a non-blank reason.
     */
    @Data
    public static class CancelRequest {
        private String reason;
    }

    /**
     * Payload sent when voting IN or OUT on a session.
     */
    @Data
    public static class VoteRequest {
        private String voteType; // "IN" or "OUT"
    }

    /**
     * Response shape returned to the frontend.
     */
    @Data
    public static class Response {
        private UUID id;
        private String title;
        private String description;
        private LocalDate sessionDate;
        private LocalTime sessionTime;
        private int durationMins;
        private int availableSlots;
        private int bookedCount;
        private int outCount;
        private int remainingSlots;
        private List<String> branchIds;
        private List<String> notifyRoles;
        private java.util.Set<UUID> attendeeIds;
        private java.util.Set<UUID> outVoteIds;
        private boolean isBookedByMe;
        private String myVote; // "IN", "OUT", or null
        private String status;
        private String cancellationReason;
        private LocalDateTime cancelledAt;
        private UUID orgId;
        private LocalDateTime createdAt;
    }
}
