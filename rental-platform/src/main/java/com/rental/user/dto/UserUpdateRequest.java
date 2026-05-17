package com.rental.user.dto;

import jakarta.validation.constraints.Size;

import java.util.Set;

public record UserUpdateRequest(
        @Size(max = 60) String firstName,
        @Size(max = 60) String lastName,
        @Size(max = 20) String phone,
        @Size(max = 80) String city,
        Set<String> roles    // optionnel — réservé à l'ADMIN
) {}
