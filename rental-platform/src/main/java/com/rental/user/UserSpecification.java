package com.rental.user;

import com.rental.role.ERole;
import com.rental.role.Role;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> hasRole(String roleName) {
        return (root, query, cb) -> {
            if (roleName == null || roleName.isBlank()) return cb.conjunction();
            String normalized = roleName.toUpperCase();
            if (!normalized.startsWith("ROLE_")) normalized = "ROLE_" + normalized;
            ERole e;
            try {
                e = ERole.valueOf(normalized);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();   // pas de match si rôle inconnu
            }
            Join<User, Role> roles = root.join("roles");
            query.distinct(true);
            return cb.equal(roles.get("name"), e);
        };
    }

    public static Specification<User> inCity(String city) {
        return (root, query, cb) -> (city == null || city.isBlank())
                ? cb.conjunction()
                : cb.equal(cb.lower(root.get("city")), city.toLowerCase());
    }

    public static Specification<User> emailContains(String q) {
        return (root, query, cb) -> (q == null || q.isBlank())
                ? cb.conjunction()
                : cb.like(cb.lower(root.get("email")), "%" + q.toLowerCase() + "%");
    }
}
