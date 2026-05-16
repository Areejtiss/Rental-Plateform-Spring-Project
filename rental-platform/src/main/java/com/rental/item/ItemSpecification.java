package com.rental.item;

import com.rental.category.Category;
import com.rental.user.User;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ItemSpecification {

    public static Specification<Item> hasCategory(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return cb.conjunction();
            Join<Item, Category> cat = root.join("category");
            return cb.equal(cat.get("id"), categoryId);
        };
    }

    public static Specification<Item> inCity(String city) {
        return (root, query, cb) -> (city == null || city.isBlank())
                ? cb.conjunction()
                : cb.equal(cb.lower(root.get("city")), city.toLowerCase());
    }

    public static Specification<Item> priceLessThanOrEqual(BigDecimal max) {
        return (root, query, cb) -> max == null
                ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("dailyPrice"), max);
    }

    public static Specification<Item> isAvailable(Boolean available) {
        return (root, query, cb) -> available == null
                ? cb.conjunction()
                : cb.equal(root.get("available"), available);
    }

    public static Specification<Item> titleContains(String q) {
        return (root, query, cb) -> (q == null || q.isBlank())
                ? cb.conjunction()
                : cb.like(cb.lower(root.get("title")), "%" + q.toLowerCase() + "%");
    }

    public static Specification<Item> ownedBy(Long ownerId) {
        return (root, query, cb) -> {
            if (ownerId == null) return cb.conjunction();
            Join<Item, User> owner = root.join("owner");
            return cb.equal(owner.get("id"), ownerId);
        };
    }
}
