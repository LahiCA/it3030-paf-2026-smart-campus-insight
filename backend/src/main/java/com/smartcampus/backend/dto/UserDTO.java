package com.smartcampus.backend.dto;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import com.smartcampus.backend.entities.Booking;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {

    private Long id;
    private String email;
    private String name;
    private String password;
    private String role;
    private List<Booking> bookings = new ArrayList<>()
}
