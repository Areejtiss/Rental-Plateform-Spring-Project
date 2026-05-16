package com.rental.user.dto;

import java.time.Instant;
import java.util.List;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        String city,
        List<String> roles,
        Instant createdAt
) {}
