package com.rental.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByRentalId(Long rentalId);

    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.rental rt
            JOIN FETCH rt.item i
            JOIN FETCH i.owner
            WHERE i.id = :itemId
            ORDER BY r.createdAt DESC
            """)
    List<Review> findAllByItemIdFetched(@Param("itemId") Long itemId);
}
