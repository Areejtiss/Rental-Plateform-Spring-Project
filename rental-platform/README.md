# Rental Platform — Spring Boot

Plateforme de location entre particuliers (matériel/outils). REST API sécurisée par JWT, persistance JPA/Hibernate, RBAC à 3 rôles.

## Stack

- Java 21, Spring Boot 3.5
- Spring Data JPA + Hibernate
- Spring Security 6 + JWT (JJWT 0.12)
- H2 (in-memory, mode PostgreSQL)
- SpringDoc OpenAPI (Swagger UI)
- Lombok, Validation API

## Lancer l'application

```bash
./mvnw spring-boot:run
```

Sous Windows :
```bash
mvnw.cmd spring-boot:run
```

- API : http://localhost:8080
- Swagger : http://localhost:8080/swagger-ui.html
- H2 console : http://localhost:8080/h2-console
  - JDBC URL : `jdbc:h2:mem:rentaldb`
  - User : `sa`  /  Password : *(vide)*

## Architecture

Architecture en couches, organisée **par feature** (et non par couche). Constructor Injection via Lombok `@RequiredArgsConstructor`.

```
com.rental
├── config/        SecurityConfig, OpenApiConfig, DataSeeder
├── security/      JwtService, JwtAuthFilter, AppUserDetails(Service)
├── auth/          register / login + JWT
├── user/          User + CRUD
├── role/          Role + ERole (ADMIN, OWNER, RENTER)
├── category/      Category + CRUD
├── item/          Item + CRUD + filtrage Specifications
├── rental/        Rental + workflow (PENDING → CONFIRMED → COMPLETED)
├── review/        Review (1 par rental terminée)
└── exception/     GlobalExceptionHandler + custom exceptions
```

## Entités & Relations

| Entité | Membre | Relations |
|---|---|---|
| `User`, `Role` | A | `User` ↔ `Role` ManyToMany |
| `Category`, `Item` | B | `Item` → `Category` ManyToOne, `Item` → `User` (owner) ManyToOne |
| `Rental`, `Review` | C | `Rental` → `Item` ManyToOne, `Rental` → `User` ManyToOne, `Review` → `Rental` OneToOne |

## Sécurité (RBAC)

3 rôles : `ROLE_ADMIN`, `ROLE_OWNER`, `ROLE_RENTER`.

| Endpoint | Méthode | Rôle |
|---|---|---|
| `/api/auth/register` | POST | public |
| `/api/auth/login` | POST | public |
| `/api/users` | GET | ADMIN |
| `/api/users/me` | GET | authentifié |
| `/api/categories` | GET | public |
| `/api/categories` | POST/PUT/DELETE | ADMIN |
| `/api/items` (avec filtres) | GET | public |
| `/api/items` | POST | OWNER / ADMIN |
| `/api/items/{id}` | PUT/DELETE | propriétaire / ADMIN |
| `/api/rentals` | POST | RENTER / OWNER / ADMIN |
| `/api/rentals/my` | GET | authentifié |
| `/api/rentals/{id}/confirm` | PATCH | OWNER de l'item / ADMIN |
| `/api/rentals/{id}/cancel` | PATCH | RENTER ou OWNER ou ADMIN |
| `/api/rentals/{id}/complete` | PATCH | OWNER / ADMIN |
| `/api/reviews` | POST | RENTER (sur rental COMPLETED) |
| `/api/reviews/item/{id}` | GET | public |

## Comptes de démo (seedés au démarrage)

| Email | Password | Rôles |
|---|---|---|
| admin@rental.com | admin123 | ADMIN + OWNER + RENTER |
| bob@rental.com | bob123 | OWNER + RENTER |
| carol@rental.com | carol123 | RENTER |

## Filtrage (`GET /api/items`)

Tous les paramètres sont optionnels et combinables :

| Param | Type | Exemple |
|---|---|---|
| `categoryId` | Long | `1` |
| `city` | String | `Rabat` |
| `maxPrice` | Decimal | `10.00` |
| `available` | Boolean | `true` |
| `q` | String | `drill` |
| `page`, `size`, `sort` | Pageable | `?page=0&size=20&sort=dailyPrice,asc` |

Exemple : `GET /api/items?city=Rabat&maxPrice=10&available=true&q=drill&page=0&size=10`

Implémentation : JPA `Specifications` composables (voir `ItemSpecification.java`).

## Performances & N+1

Trois stratégies utilisées :

1. **`@EntityGraph`** sur `ItemRepository.findAll(Specification, Pageable)` → 1 seule requête avec joins pour `owner` + `category`.
2. **`JOIN FETCH` JPQL** dans `RentalRepository.findAllByRenterIdFetched()` et `findAllByOwnerIdFetched()` → fetch en profondeur (`item` → `owner` → `category` + `renter`).
3. **`open-in-view=false`** dans `application.properties` pour éviter les chargements lazy au moment de la sérialisation.

### Démo N+1 pendant la présentation

`application.properties` active :
```
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.generate_statistics=true
```

À montrer dans les logs : appel `GET /api/items` produit **1 seule requête SQL** (grâce à `@EntityGraph`). Sans cette annotation, on aurait 1 + 2N requêtes (N items × {owner, category}).

## Workflow d'une location

```
POST /api/rentals             → PENDING
PATCH /api/rentals/{id}/confirm   (OWNER)   → CONFIRMED
PATCH /api/rentals/{id}/complete  (OWNER)   → COMPLETED
PATCH /api/rentals/{id}/cancel    (RENTER/OWNER) → CANCELLED
```

Une review ne peut être postée qu'une seule fois, et uniquement sur une rental `COMPLETED`.

## Test rapide via cURL

```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@rental.com","password":"bob123"}'

# Récupérer le token et l'utiliser :
TOKEN="..."

# 2. Mes infos
curl http://localhost:8080/api/users/me -H "Authorization: Bearer $TOKEN"

# 3. Liste des items (public)
curl "http://localhost:8080/api/items?city=Rabat&maxPrice=20"

# 4. Créer un item (OWNER)
curl -X POST http://localhost:8080/api/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","dailyPrice":5.00,"categoryId":1,"city":"Rabat"}'
```
