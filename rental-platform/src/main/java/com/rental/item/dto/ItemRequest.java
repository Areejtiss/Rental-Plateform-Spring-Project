package com.rental.item.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ItemRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 1000) String description,
        @NotNull @DecimalMin("0.01") BigDecimal dailyPrice,
        Boolean available,
        @Size(max = 80) String city,
        @Size(max = 255) String imageUrl,
        @NotNull Long categoryId
) {}
