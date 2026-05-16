package com.rental.review;

import com.rental.review.dto.ReviewRequest;
import com.rental.review.dto.ReviewResponse;
import com.rental.security.AppUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> create(@Valid @RequestBody ReviewRequest req,
                                                 @AuthenticationPrincipal AppUserDetails currentUser) {
        return ResponseEntity.ok(reviewService.create(req, currentUser));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ReviewResponse>> findByItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(reviewService.findByItem(itemId));
    }
}
