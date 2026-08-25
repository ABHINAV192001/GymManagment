package com.gymbross.usermanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffShiftDto {
    private UUID id;
    private StaffSummary staff;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
    
    private String taskDescription;
    private UUID orgId;
    private UUID branchId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffSummary {
        private UUID id;
        private String name;
        private String email;
        private String phone;
        private String userCode;
        private String staffCode;
        private String role;
        private BranchSummary branch;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchSummary {
        private UUID id;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private StaffRef staff;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm[:ss][.SSS][XXX][XX][X]")
        private LocalDateTime startTime;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm[:ss][.SSS][XXX][XX][X]")
        private LocalDateTime endTime;
        
        private String taskDescription;
        private UUID orgId;
        private UUID branchId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffRef {
        private UUID id;
    }
}
