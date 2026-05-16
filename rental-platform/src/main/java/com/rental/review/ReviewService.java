package com.rental.review;

import com.rental.exception.BadRequestException;
import com.rental.exception.ForbiddenException;
import com.rental.exception.NotFoundException;
import com.rental.rental.Rental;
import com.rental.rental.RentalRepository;
import com.rental.rental.RentalStatus;
import com.rental.review.dto.ReviewRequest;
import com.rental.review.dto.ReviewResponse;
import com.rental.security.AppUserDetails;
import com.rental.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RentalRepository rentalRepository;

    @Transactional
    public ReviewResponse create(ReviewRequest req, AppUserDetails currentUser) {
        Rental rental = rentalRepository.findById(req.rentalId())
                .orElseThrow(() -> new NotFoundException("Rental not found: " + req.rentalId()));

        if (!rental.getRenter().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the renter can leave a review");
        }
        if (rental.getStatus() != RentalStatus.COMPLETED) {
            throw new BadRequestException("Review only allowed on COMPLETED rentals");
        }
        if (reviewRepository.existsByRentalId(rental.getId())) {
            throw new BadRequestException("Review already exists for this rental");
        }

        Review review = Review.builder()
                .rental(rental)
                .rating(req.rating())
                .comment(req.comment())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findByItem(Long itemId) {
        return reviewRepository.findAllByItemIdFetched(itemId).stream().map(this::toResponse).toList();
    }

    private ReviewResponse toResponse(Review r) {
        Rental rental = r.getRental();
        User reviewer = rental.getRenter();
        return new ReviewResponse(
                r.getId(), rental.getId(),
                rental.getItem().getId(), rental.getItem().getTitle(),
                reviewer.getId(), reviewer.getFirstName() + " " + reviewer.getLastName(),
                r.getRating(), r.getComment(), r.getCreatedAt()
        );
    }
}
