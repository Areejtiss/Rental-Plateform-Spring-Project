package com.rental.review.dto;

import jakarta.validation.constraints.*;

public record ReviewRequest(
        @NotNull Long rentalId,
        @Min(1) @Max(5) int rating,
        @Size(max = 1000) String comment
) {}
