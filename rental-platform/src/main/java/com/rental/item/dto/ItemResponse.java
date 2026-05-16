package com.rental.item.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ItemResponse(
        Long id,
        String title,
        String description,
        BigDecimal dailyPrice,
        boolean available,
        String city,
        String imageUrl,
        Long ownerId,
        String ownerName,
        Long categoryId,
        String categoryName,
        Instant createdAt
) {}
