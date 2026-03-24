package com.smartcampus.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
        httpSecurity
            .csrf(AbstractHttpConfigurer :: disable)
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(requsets -> requsets
                .requestMatchers("/register", "/login/**", "/logout").permitAll()
                .anyRequest().authenticated())
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login/google")
                .defaultSuccessUrl("/loginSuccess", true)
                .failureUrl("/loginFailure"))
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login/local")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                .permitAll());

        return httpSecurity.build();
        
    }
}
