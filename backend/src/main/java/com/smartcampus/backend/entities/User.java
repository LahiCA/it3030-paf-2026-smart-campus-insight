package com.smartcampus.backend.entities;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.time.LocalDateTime;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email is required")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * User role: USER, ADMIN, TECHNICIAN, MANAGER
     * Default is USER unless email is in ADMIN_EMAILS
     */
    @Column(nullable = false)
    private String role = "USER";

    /**
     * Timestamp when the user account was created
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Timestamp when the user account was last updated
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "user")
    private List<Booking> bookings = new ArrayList<>();

    /**
     * All notifications for this user
     * OneToMany: One user has many notifications
     * MappedBy: Notification.user is the foreign key
     * CascadeType.ALL: If user is deleted, delete all their notifications
     */
    @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL)
    private List<Notification> notifications = new ArrayList<>();

    // ---------------- UserDetails Methods ----------------

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Return the user's role as a GrantedAuthority
        // IMPORTANT: Spring Security expects "ROLE_" prefix
        // So "ADMIN" becomes "ROLE_ADMIN" for use in @PreAuthorize("hasRole('ADMIN')")
        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return List.of(new SimpleGrantedAuthority(roleWithPrefix));
    }

    @Override
    public String getUsername() {
        // Use email as the username for login
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}