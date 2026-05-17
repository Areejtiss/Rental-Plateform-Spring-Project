package com.rental.user;

import com.rental.exception.ForbiddenException;
import com.rental.role.ERole;
import com.rental.security.AppUserDetails;
import com.rental.user.dto.UserResponse;
import com.rental.user.dto.UserUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> search(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(userService.search(role, city, q));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal AppUserDetails currentUser) {
        return ResponseEntity.ok(userService.findById(currentUser.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@Valid @RequestBody UserUpdateRequest req,
                                                 @AuthenticationPrincipal AppUserDetails currentUser) {
        // un user normal ne peut pas modifier ses propres roles
        return ResponseEntity.ok(userService.update(currentUser.getId(), req, false));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody UserUpdateRequest req) {
        return ResponseEntity.ok(userService.update(id, req, true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal AppUserDetails currentUser) {
        if (currentUser.getId().equals(id)) {
            throw new ForbiddenException("You cannot delete yourself");
        }
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
