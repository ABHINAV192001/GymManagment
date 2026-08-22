package com.Gym.GymCommonServices.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private boolean success;
    private java.util.List<T> data;
    private Pagination pagination;
    private Object filters;

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

    public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page, Object filters) {
        return PageResponse.<T>builder()
                .success(true)
                .data(page.getContent())
                .filters(filters)
                .pagination(Pagination.builder()
                        .page(page.getNumber())
                        .size(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .hasNext(page.hasNext())
                        .hasPrev(page.hasPrevious())
                        .build())
                .build();
    }
}
