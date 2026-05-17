package com.rental.role.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleRequest(
        @NotBlank String name   // ex: "ADMIN", "OWNER", "RENTER"
) {}
