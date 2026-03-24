package com.smartcampus.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.nimbusds.jose.util.Resource;
import com.smartcampus.backend.entities.User;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    private int statusCode;
    private String message;

    private String token;
    private String role;
    private String expirationTime;
    private String bookingConfirmationCode; 

    private UserDTO user;
    private ResourceDTO resource;
    private BookingDTO booking;
    private List<UserDTO> usersList;
    private List<ResourceDTO> resourcesList;    
    private List<BookingDTO> bookingsList;
}
