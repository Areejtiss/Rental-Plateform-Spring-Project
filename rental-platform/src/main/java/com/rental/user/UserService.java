package com.rental.user;

import com.rental.exception.BadRequestException;
import com.rental.exception.NotFoundException;
import com.rental.role.ERole;
import com.rental.role.Role;
import com.rental.role.RoleRepository;
import com.rental.user.dto.UserResponse;
import com.rental.user.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> search(String role, String city, String q) {
        Specification<User> spec = Specification.allOf(
                UserSpecification.hasRole(role),
                UserSpecification.inCity(city),
                UserSpecification.emailContains(q)
        );
        return userRepository.findAll(spec).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));
    }

    /**
     * Update user. Only an ADMIN can modify roles.
     */
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest req, boolean isAdmin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));

        if (req.firstName() != null) user.setFirstName(req.firstName());
        if (req.lastName() != null) user.setLastName(req.lastName());
        if (req.phone() != null) user.setPhone(req.phone());
        if (req.city() != null) user.setCity(req.city());

        if (req.roles() != null && !req.roles().isEmpty()) {
            if (!isAdmin) {
                throw new BadRequestException("Only ADMIN can modify roles");
            }
            Set<Role> roles = new HashSet<>();
            for (String r : req.roles()) {
                ERole e;
                try {
                    String n = r.toUpperCase();
                    if (!n.startsWith("ROLE_")) n = "ROLE_" + n;
                    e = ERole.valueOf(n);
                } catch (IllegalArgumentException ex) {
                    throw new BadRequestException("Unknown role: " + r);
                }
                roles.add(roleRepository.findByName(e).orElseGet(() -> roleRepository.save(new Role(e))));
            }
            user.setRoles(roles);
        }

        return toResponse(user);
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(), u.getEmail(), u.getFirstName(), u.getLastName(),
                u.getPhone(), u.getCity(),
                u.getRoles().stream().map(r -> r.getName().name()).toList(),
                u.getCreatedAt()
        );
    }
}
