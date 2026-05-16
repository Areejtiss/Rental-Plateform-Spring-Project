package com.rental.rental;

import com.rental.rental.dto.RentalRequest;
import com.rental.rental.dto.RentalResponse;
import com.rental.security.AppUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RENTER','OWNER','ADMIN')")
    public ResponseEntity<RentalResponse> create(@Valid @RequestBody RentalRequest req,
                                                 @AuthenticationPrincipal AppUserDetails currentUser) {
        return ResponseEntity.ok(rentalService.create(req, currentUser));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RentalResponse>> mine(@AuthenticationPrincipal AppUserDetails currentUser) {
        return ResponseEntity.ok(rentalService.myRentals(currentUser));
    }

    @GetMapping("/on-my-items")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<List<RentalResponse>> onMyItems(@AuthenticationPrincipal AppUserDetails currentUser) {
        return ResponseEntity.ok(rentalService.rentalsOnMyItems(currentUser));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<RentalResponse> confirm(@PathVariable Long id,
                                                  @AuthenticationPrincipal AppUserDetails currentUser) {
        return ResponseEntity.ok(rentalService.confirm(id, currentUser));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<RentalResponse> cancel(@PathVariable Long id,
                                                 @AuthenticationPrincipal AppUserDetails currentUser) {
        return ResponseEntity.ok(rentalService.cancel(id, currentUser));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<RentalResponse> complete(@PathVariable Long id,
                                                   @AuthenticationPrincipal AppUserDetails currentUser) {
        return ResponseEntity.ok(rentalService.complete(id, currentUser));
    }
}
