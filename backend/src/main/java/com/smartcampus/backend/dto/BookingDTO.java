package com.smartcampus.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingDTO {

    private Long id;
    private String checkinDate;
    private String checkoutDate;
    private String time_range;
    private String purpose;
    private String attendees;
    private String bookingConfirmationCode;
    private UserDTO user;
    private ResourceDTO resource;

}
