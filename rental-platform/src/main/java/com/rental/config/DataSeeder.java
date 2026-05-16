package com.rental.config;

import com.rental.category.Category;
import com.rental.category.CategoryRepository;
import com.rental.item.Item;
import com.rental.item.ItemRepository;
import com.rental.rental.Rental;
import com.rental.rental.RentalRepository;
import com.rental.rental.RentalStatus;
import com.rental.role.ERole;
import com.rental.role.Role;
import com.rental.role.RoleRepository;
import com.rental.user.User;
import com.rental.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final RentalRepository rentalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        Role admin = roleRepository.save(new Role(ERole.ROLE_ADMIN));
        Role owner = roleRepository.save(new Role(ERole.ROLE_OWNER));
        Role renter = roleRepository.save(new Role(ERole.ROLE_RENTER));

        User u1 = userRepository.save(User.builder()
                .email("admin@rental.com")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Alice").lastName("Admin").city("Tunis")
                .roles(setOf(admin, owner, renter)).build());

        User u2 = userRepository.save(User.builder()
                .email("bob@rental.com")
                .password(passwordEncoder.encode("bob123"))
                .firstName("Bob").lastName("Owner").city("Sousse")
                .roles(setOf(owner, renter)).build());

        User u3 = userRepository.save(User.builder()
                .email("carol@rental.com")
                .password(passwordEncoder.encode("carol123"))
                .firstName("Carol").lastName("Renter").city("Sfax")
                .roles(setOf(renter)).build());

        Category tools = categoryRepository.save(Category.builder()
                .name("Power Tools").description("Drills, saws, sanders").build());
        Category garden = categoryRepository.save(Category.builder()
                .name("Garden").description("Mowers, trimmers").build());
        Category camping = categoryRepository.save(Category.builder()
                .name("Camping").description("Tents, sleeping bags, stoves").build());

        Item drill = itemRepository.save(Item.builder()
                .title("Bosch Cordless Drill").description("18V, with 2 batteries")
                .dailyPrice(new BigDecimal("8.50")).available(true)
                .city("Sousse").imageUrl("https://example.com/drill.jpg")
                .owner(u2).category(tools).build());

        Item mower = itemRepository.save(Item.builder()
                .title("Lawn Mower").description("Electric, 1800W")
                .dailyPrice(new BigDecimal("15.00")).available(true)
                .city("Tunis").imageUrl("https://example.com/mower.jpg")
                .owner(u1).category(garden).build());

        Item tent = itemRepository.save(Item.builder()
                .title("4-Person Tent").description("Waterproof, easy setup")
                .dailyPrice(new BigDecimal("12.00")).available(true)
                .city("Hammamet").imageUrl("https://example.com/tent.jpg")
                .owner(u2).category(camping).build());

        Item sander = itemRepository.save(Item.builder()
                .title("Random Orbital Sander").description("Variable speed, dust collector")
                .dailyPrice(new BigDecimal("6.00")).available(true)
                .city("Tunis").imageUrl("https://example.com/sander.jpg")
                .owner(u1).category(tools).build());

        rentalRepository.save(Rental.builder()
                .item(drill).renter(u3)
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().minusDays(7))
                .totalPrice(new BigDecimal("34.00"))
                .status(RentalStatus.COMPLETED).build());

        rentalRepository.save(Rental.builder()
                .item(tent).renter(u3)
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(8))
                .totalPrice(new BigDecimal("48.00"))
                .status(RentalStatus.CONFIRMED).build());

        System.out.println("=== Data seeded ===");
        System.out.println("Login as: admin@rental.com / admin123  (ADMIN+OWNER+RENTER)");
        System.out.println("Login as: bob@rental.com / bob123      (OWNER+RENTER)");
        System.out.println("Login as: carol@rental.com / carol123  (RENTER)");
    }

    private Set<Role> setOf(Role... roles) {
        return new HashSet<>(java.util.Arrays.asList(roles));
    }
}
