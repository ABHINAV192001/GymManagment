package com.gymbross.usermanagement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RbacRoleResponse {
    private UUID id;
    private String name;
    private UUID orgId;
    
    @JsonProperty("active")
    private Boolean active;
    
    @JsonProperty("system")
    private Boolean system;
    
    @JsonProperty("deleted")
    private Boolean deleted;
    
    private Map<String, List<String>> permissions;
}
