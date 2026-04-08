package com.smartcampus.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UpdateRoleRequest DTO
 * 
 * Sent by admin to change a user's role.
 * Only ADMIN role can use this endpoint.
 * 
 * Example request:
 * {
 * "userId": 5,
 * "newRole": "TECHNICIAN"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleRequest {

    /**
     * The ID of the user whose role should be changed
     */
    @NotBlank(message = "User ID cannot be blank")
    private String userId;

    /**
     * The new role: USER, ADMIN, TECHNICIAN, MANAGER
     */
    @NotBlank(message = "New role cannot be blank")
    private String newRole;
}
