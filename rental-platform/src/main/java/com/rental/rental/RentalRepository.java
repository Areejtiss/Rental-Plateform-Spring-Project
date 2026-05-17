package com.rental.rental;

import com.rental.item.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    // ---- N+1 fix: fetch graph with JOIN FETCH ----
    @Query("""
            SELECT r FROM Rental r
            JOIN FETCH r.item i
            JOIN FETCH i.owner
            JOIN FETCH i.category
            JOIN FETCH r.renter
            WHERE r.renter.id = :userId
            ORDER BY r.createdAt DESC
            """)
    List<Rental> findAllByRenterIdFetched(@Param("userId") Long userId);

    @Query("""
            SELECT r FROM Rental r
            JOIN FETCH r.item i
            JOIN FETCH i.owner
            JOIN FETCH r.renter
            WHERE i.owner.id = :ownerId
            ORDER BY r.createdAt DESC
            """)
    List<Rental> findAllByOwnerIdFetched(@Param("ownerId") Long ownerId);

    // Admin : toutes les rentals (avec JOIN FETCH anti N+1)
    @Query("""
            SELECT r FROM Rental r
            JOIN FETCH r.item i
            JOIN FETCH i.owner
            JOIN FETCH i.category
            JOIN FETCH r.renter
            ORDER BY r.createdAt DESC
            """)
    List<Rental> findAllFetched();

    // Admin : filtrage par status
    @Query("""
            SELECT r FROM Rental r
            JOIN FETCH r.item i
            JOIN FETCH i.owner
            JOIN FETCH i.category
            JOIN FETCH r.renter
            WHERE r.status = :status
            ORDER BY r.createdAt DESC
            """)
    List<Rental> findAllByStatusFetched(@Param("status") RentalStatus status);

    @Query("""
            SELECT COUNT(r) > 0 FROM Rental r
            WHERE r.item = :item
              AND r.status IN (com.rental.rental.RentalStatus.PENDING,
                               com.rental.rental.RentalStatus.CONFIRMED,
                               com.rental.rental.RentalStatus.ACTIVE)
              AND r.startDate <= :end
              AND r.endDate >= :start
            """)
    boolean existsOverlap(@Param("item") Item item,
                          @Param("start") LocalDate start,
                          @Param("end") LocalDate end);
}
