package com.rental.auth.dto;

import java.util.List;

public record AuthResponse(
        String token,
        String type,
        Long userId,
        String email,
        List<String> roles
) {
    public static AuthResponse of(String token, Long userId, String email, List<String> roles) {
        return new AuthResponse(token, "Bearer", userId, email, roles);
    }
}
