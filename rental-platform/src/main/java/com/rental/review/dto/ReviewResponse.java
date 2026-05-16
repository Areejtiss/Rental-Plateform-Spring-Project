package com.rental.review.dto;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long rentalId,
        Long itemId,
        String itemTitle,
        Long reviewerId,
        String reviewerName,
        int rating,
        String comment,
        Instant createdAt
) {}
