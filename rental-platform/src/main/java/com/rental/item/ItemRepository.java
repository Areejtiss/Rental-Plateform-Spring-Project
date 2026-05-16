package com.rental.item;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    // ---- N+1 demo: WITHOUT EntityGraph -> one query for items, then one per item for owner + category ----
    // (just call findAll() to see the N+1 in logs)

    // ---- N+1 demo: WITH EntityGraph -> 1 single SELECT with JOINs ----
    @Override
    @EntityGraph(attributePaths = {"owner", "category"})
    Page<Item> findAll(org.springframework.data.jpa.domain.Specification<Item> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "category"})
    Optional<Item> findById(Long id);

    @Query("""
            SELECT i FROM Item i
            JOIN FETCH i.owner
            JOIN FETCH i.category
            WHERE i.owner.id = :ownerId
            """)
    java.util.List<Item> findAllByOwnerIdFetched(Long ownerId);
}
