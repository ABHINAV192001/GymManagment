package com.gymbross.usermanagement.dto;

public class FoodSearchRequestDto {
    private String query;

    public FoodSearchRequestDto() {
    }

    public FoodSearchRequestDto(String query) {
        this.query = query;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    @Override
    public String toString() {
        return "FoodSearchRequestDto{query='" + query + "'}";
    }
}
