package com.rental.auth;

import com.rental.auth.dto.AuthResponse;
import com.rental.auth.dto.LoginRequest;
import com.rental.auth.dto.RegisterRequest;
import com.rental.exception.BadRequestException;
import com.rental.role.ERole;
import com.rental.role.Role;
import com.rental.role.RoleRepository;
import com.rental.security.AppUserDetails;
import com.rental.security.JwtService;
import com.rental.user.User;
import com.rental.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BadRequestException("Email already in use");
        }

        Set<Role> roles = new HashSet<>();
        if (req.roles() == null || req.roles().isEmpty()) {
            roles.add(getOrCreate(ERole.ROLE_RENTER));
        } else {
            for (String r : req.roles()) {
                ERole e = switch (r.toUpperCase()) {
                    case "ADMIN" -> ERole.ROLE_ADMIN;
                    case "OWNER" -> ERole.ROLE_OWNER;
                    case "RENTER" -> ERole.ROLE_RENTER;
                    default -> throw new BadRequestException("Unknown role: " + r);
                };
                roles.add(getOrCreate(e));
            }
        }

        User user = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phone(req.phone())
                .city(req.city())
                .roles(roles)
                .build();

        user = userRepository.save(user);

        AppUserDetails details = new AppUserDetails(user);
        String token = jwtService.generateToken(details);
        return AuthResponse.of(token, user.getId(), user.getEmail(),
                details.getAuthorities().stream().map(Object::toString).toList());
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        AppUserDetails details = (AppUserDetails) auth.getPrincipal();
        String token = jwtService.generateToken(details);
        return AuthResponse.of(token, details.getId(), details.getEmail(),
                details.getAuthorities().stream().map(Object::toString).toList());
    }

    private Role getOrCreate(ERole e) {
        return roleRepository.findByName(e).orElseGet(() -> roleRepository.save(new Role(e)));
    }
}
