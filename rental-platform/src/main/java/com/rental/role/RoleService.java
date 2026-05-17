package com.rental.role;

import com.rental.exception.BadRequestException;
import com.rental.exception.NotFoundException;
import com.rental.role.dto.RoleRequest;
import com.rental.role.dto.RoleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RoleResponse findById(Long id) {
        return roleRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Role not found: " + id));
    }

    @Transactional
    public RoleResponse create(RoleRequest req) {
        ERole eRole = parse(req.name());
        if (roleRepository.findByName(eRole).isPresent()) {
            throw new BadRequestException("Role already exists: " + eRole);
        }
        Role saved = roleRepository.save(new Role(eRole));
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new NotFoundException("Role not found: " + id);
        }
        roleRepository.deleteById(id);
    }

    private ERole parse(String name) {
        try {
            String normalized = name.toUpperCase();
            if (!normalized.startsWith("ROLE_")) normalized = "ROLE_" + normalized;
            return ERole.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Unknown role: " + name + " (allowed: ADMIN, OWNER, RENTER)");
        }
    }

    private RoleResponse toResponse(Role r) {
        return new RoleResponse(r.getId(), r.getName().name());
    }
}
