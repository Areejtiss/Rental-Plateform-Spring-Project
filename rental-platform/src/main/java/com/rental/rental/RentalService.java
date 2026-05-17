package com.rental.rental;

import com.rental.exception.BadRequestException;
import com.rental.exception.ForbiddenException;
import com.rental.exception.NotFoundException;
import com.rental.item.Item;
import com.rental.item.ItemRepository;
import com.rental.rental.dto.RentalRequest;
import com.rental.rental.dto.RentalResponse;
import com.rental.role.ERole;
import com.rental.security.AppUserDetails;
import com.rental.user.User;
import com.rental.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    @Transactional
    public RentalResponse create(RentalRequest req, AppUserDetails currentUser) {
        if (!req.startDate().isBefore(req.endDate())) {
            throw new BadRequestException("startDate must be before endDate");
        }
        Item item = itemRepository.findById(req.itemId())
                .orElseThrow(() -> new NotFoundException("Item not found: " + req.itemId()));
        if (!item.isAvailable()) {
            throw new BadRequestException("Item is not available");
        }
        if (item.getOwner().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot rent your own item");
        }
        if (rentalRepository.existsOverlap(item, req.startDate(), req.endDate())) {
            throw new BadRequestException("Item is already booked on these dates");
        }

        User renter = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        long days = Math.max(1, ChronoUnit.DAYS.between(req.startDate(), req.endDate()) + 1);
        BigDecimal total = item.getDailyPrice().multiply(BigDecimal.valueOf(days));

        Rental r = Rental.builder()
                .item(item)
                .renter(renter)
                .startDate(req.startDate())
                .endDate(req.endDate())
                .totalPrice(total)
                .status(RentalStatus.PENDING)
                .build();
        return toResponse(rentalRepository.save(r));
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> myRentals(AppUserDetails currentUser) {
        return rentalRepository.findAllByRenterIdFetched(currentUser.getId())
                .stream().map(this::toResponse).toList();
    }

    /** Admin only: list ALL rentals, optionally filtered by status. */
    @Transactional(readOnly = true)
    public List<RentalResponse> findAllForAdmin(RentalStatus status) {
        List<Rental> rentals = (status == null)
                ? rentalRepository.findAllFetched()
                : rentalRepository.findAllByStatusFetched(status);
        return rentals.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> rentalsOnMyItems(AppUserDetails currentUser) {
        return rentalRepository.findAllByOwnerIdFetched(currentUser.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public RentalResponse confirm(Long id, AppUserDetails currentUser) {
        Rental r = getOrThrow(id);
        ensureOwner(r, currentUser);
        require(r.getStatus() == RentalStatus.PENDING, "Only PENDING rentals can be confirmed");
        r.setStatus(RentalStatus.CONFIRMED);
        return toResponse(r);
    }

    @Transactional
    public RentalResponse cancel(Long id, AppUserDetails currentUser) {
        Rental r = getOrThrow(id);
        ensureRenterOrOwner(r, currentUser);
        require(r.getStatus() == RentalStatus.PENDING || r.getStatus() == RentalStatus.CONFIRMED,
                "Cannot cancel a rental in status " + r.getStatus());
        r.setStatus(RentalStatus.CANCELLED);
        return toResponse(r);
    }

    @Transactional
    public RentalResponse complete(Long id, AppUserDetails currentUser) {
        Rental r = getOrThrow(id);
        ensureOwner(r, currentUser);
        require(r.getStatus() == RentalStatus.CONFIRMED || r.getStatus() == RentalStatus.ACTIVE,
                "Only CONFIRMED or ACTIVE rentals can be completed");
        r.setStatus(RentalStatus.COMPLETED);
        return toResponse(r);
    }

    private Rental getOrThrow(Long id) {
        return rentalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rental not found: " + id));
    }

    private void ensureOwner(Rental r, AppUserDetails u) {
        boolean isAdmin = u.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(ERole.ROLE_ADMIN.name()));
        if (!isAdmin && !r.getItem().getOwner().getId().equals(u.getId())) {
            throw new ForbiddenException("Not the owner of this rental's item");
        }
    }

    private void ensureRenterOrOwner(Rental r, AppUserDetails u) {
        boolean isAdmin = u.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(ERole.ROLE_ADMIN.name()));
        boolean isRenter = r.getRenter().getId().equals(u.getId());
        boolean isOwner = r.getItem().getOwner().getId().equals(u.getId());
        if (!isAdmin && !isRenter && !isOwner) {
            throw new ForbiddenException("Not allowed to modify this rental");
        }
    }

    private void require(boolean cond, String msg) {
        if (!cond) throw new BadRequestException(msg);
    }

    private RentalResponse toResponse(Rental r) {
        User owner = r.getItem().getOwner();
        User renter = r.getRenter();
        return new RentalResponse(
                r.getId(),
                r.getItem().getId(), r.getItem().getTitle(),
                owner.getId(), owner.getFirstName() + " " + owner.getLastName(),
                renter.getId(), renter.getFirstName() + " " + renter.getLastName(),
                r.getStartDate(), r.getEndDate(), r.getTotalPrice(),
                r.getStatus(), r.getCreatedAt()
        );
    }
}
