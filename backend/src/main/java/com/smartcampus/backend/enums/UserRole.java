package com.smartcampus.backend.enums;

public enum UserRole {

    ADMIN("ROLE_ADMIN", "Administrator"),

    LECTURER("ROLE_LECTURER", "Lecturer"),

    TECHNICIAN("ROLE_TECHNICIAN", "Technician");

    private final String springRole;
    private final String description;

    UserRole(String springRole, String description) {
        this.springRole = springRole;
        this.description = description;
    }

    public String getSpringRole() {
        return springRole;
    }

    public String getDescription() {
        return description;
    }

    public static UserRole fromString(String roleString) {
        if (roleString == null) {
            return LECTURER;
        }
        try {
            return UserRole.valueOf(roleString.toUpperCase());
        } catch (IllegalArgumentException e) {
            return LECTURER;
        }
    }
}
