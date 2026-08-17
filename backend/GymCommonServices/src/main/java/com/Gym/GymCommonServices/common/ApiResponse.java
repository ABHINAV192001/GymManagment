package com.Gym.GymCommonServices.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private ApiError error;
    @Builder.Default
    private ApiMeta meta = new ApiMeta();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiError {
        private String code;
        private String message;
        private String field;
        private Object details;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class ApiMeta {
        @Builder.Default
        private Instant timestamp = Instant.now();
        @Builder.Default
        private String requestId = UUID.randomUUID().toString();
        
        public ApiMeta() {
            this.timestamp = Instant.now();
            this.requestId = UUID.randomUUID().toString();
        }
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, null);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(ApiError.builder().code(code).message(message).build())
                .build();
    }
}
