package com.Gym.GymCommonServices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private int status;
    private Pagination pagination;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pagination {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrev;
    }

    public static <T> ApiResponse<T> success(T data) {
        sortListByCreatedAtDesc(data);
        return ApiResponse.<T>builder()
                .success(true)
                .message("Operation successful")
                .data(data)
                .timestamp(LocalDateTime.now())
                .status(200)
                .build();
    }

    private static void sortListByCreatedAtDesc(Object data) {
        if (data instanceof List<?> list && !list.isEmpty()) {
            try {
                java.lang.reflect.Method getCreatedAt = list.get(0).getClass().getMethod("getCreatedAt");
                list.sort((a, b) -> {
                    try {
                        Object dateA = getCreatedAt.invoke(a);
                        Object dateB = getCreatedAt.invoke(b);
                        if (dateA instanceof Comparable && dateB instanceof Comparable) {
                            return ((Comparable) dateB).compareTo(dateA);
                        }
                    } catch (Exception ignored) { }
                    return 0;
                });
            } catch (NoSuchMethodException ignored) { }
        }
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        sortListByCreatedAtDesc(data);
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .status(200)
                .build();
    }

    public static <T> ApiResponse<List<T>> paginated(List<T> fullList, int page, int size) {
        return paginated(fullList, page, size, "Operation successful");
    }

    public static <T> ApiResponse<List<T>> paginated(List<T> fullList, int page, int size, String message) {
        if (fullList == null) {
            fullList = Collections.emptyList();
        } else {
            sortListByCreatedAtDesc(fullList);
        }
        int totalElements = fullList.size();
        int pageSize = size <= 0 ? 10 : size;
        int currentPage = Math.max(0, page);
        int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / pageSize);

        int fromIndex = Math.min(currentPage * pageSize, totalElements);
        int toIndex = Math.min(fromIndex + pageSize, totalElements);
        List<T> content = fullList.subList(fromIndex, toIndex);

        Pagination meta = Pagination.builder()
                .page(currentPage)
                .size(pageSize)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(currentPage + 1 < totalPages)
                .hasPrev(currentPage > 0)
                .build();

        return ApiResponse.<List<T>>builder()
                .success(true)
                .message(message)
                .data(content)
                .timestamp(LocalDateTime.now())
                .status(200)
                .pagination(meta)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, int status) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .status(status)
                .build();
    }
}
