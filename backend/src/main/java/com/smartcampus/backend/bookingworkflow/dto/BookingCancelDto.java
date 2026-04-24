package com.smartcampus.backend.bookingworkflow.dto;
/*the shape of data sent between frontend and backend API, without exposing full database/entity models. */

import lombok.Data;

@Data
public class BookingCancelDto {
    private String reason;
}