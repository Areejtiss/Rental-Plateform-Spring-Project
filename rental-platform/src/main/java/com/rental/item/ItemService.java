package com.rental.item;

import com.rental.category.Category;
import com.rental.category.CategoryRepository;
import com.rental.exception.ForbiddenException;
import com.rental.exception.NotFoundException;
import com.rental.item.dto.ItemRequest;
import com.rental.item.dto.ItemResponse;
import com.rental.role.ERole;
import com.rental.security.AppUserDetails;
import com.rental.user.User;
import com.rental.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ItemResponse> search(Long categoryId, String city, BigDecimal maxPrice,
                                     Boolean available, String q, Pageable pageable) {
        Specification<Item> spec = Specification
                .allOf(
                        ItemSpecification.hasCategory(categoryId),
                        ItemSpecification.inCity(city),
                        ItemSpecification.priceLessThanOrEqual(maxPrice),
                        ItemSpecification.isAvailable(available),
                        ItemSpecification.titleContains(q)
                );
        return itemRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ItemResponse findById(Long id) {
        return itemRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Item not found: " + id));
    }

    /** Items owned by the current user (JOIN FETCH anti N+1). */
    @Transactional(readOnly = true)
    public java.util.List<ItemResponse> myItems(AppUserDetails currentUser) {
        return itemRepository.findAllByOwnerIdFetched(currentUser.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ItemResponse create(ItemRequest req, AppUserDetails currentUser) {
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new NotFoundException("Category not found: " + req.categoryId()));
        User owner = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        Item item = Item.builder()
                .title(req.title())
                .description(req.description())
                .dailyPrice(req.dailyPrice())
                .available(req.available() == null || req.available())
                .city(req.city())
                .imageUrl(req.imageUrl())
                .owner(owner)
                .category(category)
                .build();

        return toResponse(itemRepository.save(item));
    }

    @Transactional
    public ItemResponse update(Long id, ItemRequest req, AppUserDetails currentUser) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Item not found: " + id));
        ensureOwnerOrAdmin(item, currentUser);

        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new NotFoundException("Category not found: " + req.categoryId()));

        item.setTitle(req.title());
        item.setDescription(req.description());
        item.setDailyPrice(req.dailyPrice());
        if (req.available() != null) item.setAvailable(req.available());
        item.setCity(req.city());
        item.setImageUrl(req.imageUrl());
        item.setCategory(category);

        return toResponse(item);
    }

    @Transactional
    public void delete(Long id, AppUserDetails currentUser) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Item not found: " + id));
        ensureOwnerOrAdmin(item, currentUser);
        itemRepository.delete(item);
    }

    private void ensureOwnerOrAdmin(Item item, AppUserDetails user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(ERole.ROLE_ADMIN.name()));
        if (!isAdmin && !item.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("Not the owner of this item");
        }
    }

    private ItemResponse toResponse(Item i) {
        return new ItemResponse(
                i.getId(), i.getTitle(), i.getDescription(), i.getDailyPrice(),
                i.isAvailable(), i.getCity(), i.getImageUrl(),
                i.getOwner().getId(),
                i.getOwner().getFirstName() + " " + i.getOwner().getLastName(),
                i.getCategory().getId(), i.getCategory().getName(),
                i.getCreatedAt()
        );
    }
}
