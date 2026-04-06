package com.smartcampus.backend.enums;

/**
 * UserRole Enum
 * 
 * Represents the different roles users can have in the system.
 * Using an enum instead of plain strings is better because:
 * 1. Type-safe: Can't accidentally use invalid role names
 * 2. Compile-time checking: IDE will autocomplete and catch typos
 * 3. Easy to add new roles: Just add to enum
 * 4. Cleaner code: `user.setRole(UserRole.ADMIN)` vs `user.setRole("ADMIN")`
 * 
 * Database Storage:
 * We store the enum's String name (ADMIN, USER, etc.)
 * using @Enumerated(EnumType.STRING)
 * So the database column will have values like "ADMIN", "USER", not integer
 * codes.
 */
public enum UserRole {
    /**
     * Regular member of the campus
     * Permissions: Create bookings, post comments, view personal notifications
     */
    USER("ROLE_USER", "Campus Member"),

    /**
     * System administrator
     * Permissions: Manage users, approve bookings, view all notifications, manage
     * roles
     */
    ADMIN("ROLE_ADMIN", "Administrator"),

    /**
     * Facility technician
     * Permissions: View and manage incident tickets, update facility status
     */
    TECHNICIAN("ROLE_TECHNICIAN", "Technician"),

    /**
     * Facility manager/supervisor
     * Permissions: Approve/reject bookings, view reports, manage technicians
     */
    MANAGER("ROLE_MANAGER", "Manager");

    /**
     * The Spring Security role name (with ROLE_ prefix)
     * This is used in @PreAuthorize("hasRole('ADMIN')")
     * Spring internally converts to "ROLE_ADMIN"
     */
    private final String springRole;

    /**
     * Human-readable description of this role
     * Useful for displaying in UI
     */
    private final String description;

    /**
     * Constructor
     */
    UserRole(String springRole, String description) {
        this.springRole = springRole;
        this.description = description;
    }

    /**
     * Get the Spring Security role name
     * 
     * @return e.g., "ROLE_ADMIN"
     */
    public String getSpringRole() {
        return springRole;
    }

    /**
     * Get human-readable description
     * 
     * @return e.g., "Administrator"
     */
    public String getDescription() {
        return description;
    }

    /**
     * Convert string to UserRole enum
     * 
     * @param roleString e.g., "ADMIN", "USER"
     * @return UserRole enum value
     * @throws IllegalArgumentException if role is invalid
     */
    public static UserRole fromString(String roleString) {
        if (roleString == null) {
            return USER; // Default role
        }

        try {
            return UserRole.valueOf(roleString.toUpperCase());
        } catch (IllegalArgumentException e) {
            return USER; // Default to USER if invalid
        }
    }
}
