package com.rental.rental.dto;

import com.rental.rental.RentalStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record RentalResponse(
        Long id,
        Long itemId,
        String itemTitle,
        Long ownerId,
        String ownerName,
        Long renterId,
        String renterName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalPrice,
        RentalStatus status,
        Instant createdAt
) {}
