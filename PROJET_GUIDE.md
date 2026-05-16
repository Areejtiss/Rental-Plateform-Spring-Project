# RentaTN — Guide complet du projet

> Plateforme de location entre particuliers (matériel/outils) en Tunisie.
> Projet Spring Boot 3.5 + Next.js 16, à présenter le ____.

---

## 📑 Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture globale](#2-architecture-globale)
3. [Stack technique](#3-stack-technique)
4. [Backend Spring Boot — détail](#4-backend-spring-boot)
5. [Frontend Next.js — détail](#5-frontend-nextjs)
6. [Communication Front ↔ Back](#6-communication-front--back)
7. [Comment lancer le projet](#7-comment-lancer-le-projet)
8. [Critères d'évaluation (16 pts)](#8-critères-dévaluation)
9. [Préparation soutenance — Q&A](#9-préparation-soutenance--qa)
10. [Démonstration recommandée](#10-démonstration-recommandée)

---

## 1. Vue d'ensemble

### Le projet

**RentaTN** = une plateforme web où :
- Les **OWNERS** mettent leur matériel à louer (outils, équipement de camping, jardinage...)
- Les **RENTERS** réservent ce matériel pour une période donnée
- Les **ADMINS** gèrent l'ensemble
- Après une location terminée, le renter peut laisser un **avis**

### Domaine fonctionnel (workflow)

```
   OWNER                  RENTER                 OWNER             RENTER
  ┌─────┐               ┌──────┐               ┌─────┐           ┌──────┐
  │Crée │ ──► Item ──► │ Loue │ ──► Rental ──►│Conf-│ ──►       │Laisse│
  │item │   en BDD     │      │   (PENDING)    │irme │    ──►   │ avis │
  └─────┘               └──────┘               └─────┘           └──────┘
                                                  │
                                                  ▼
                                            (CONFIRMED)
                                                  │
                                                  ▼
                                            (COMPLETED)
                                                  │
                                                  ▼
                                            Avis possible
```

### 3 rôles, 3 niveaux d'accès (RBAC)

| Rôle | Peut faire |
|---|---|
| **ADMIN** | Tout : gérer users, catégories, items, locations |
| **OWNER** | Créer/modifier ses items, confirmer/compléter des locations sur ses items |
| **RENTER** | Lire le catalogue, louer, annuler, laisser des avis |

---

## 2. Architecture globale

### Schéma 3-tiers

```
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND  (Next.js 16, React 19, Tailwind 4)                    │
│  http://localhost:3000                                           │
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌─────────────┐    │
│  │  /login │  │  /items │  │ /my-rentals  │  │/create-item │    │
│  └─────────┘  └─────────┘  └──────────────┘  └─────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │  HTTP (JSON) + Authorization: Bearer JWT
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND   (Spring Boot 3.5, Java 21)                            │
│  http://localhost:8080                                           │
│                                                                  │
│   Controllers    →    Services      →     Repositories           │
│   (couche web)        (couche métier)     (couche persistance)   │
│   /api/auth/**        AuthService          UserRepository        │
│   /api/items/**       ItemService          ItemRepository        │
│   /api/rentals/**     RentalService        RentalRepository      │
│   /api/reviews/**     ReviewService        ReviewRepository      │
│                                                                  │
│   Filtre JWT (intercepte toute requête)                          │
│   ↓                                                              │
│   SecurityFilterChain (autorisations URL / rôles)                │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │  JPQL / SQL (via Hibernate)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  BASE DE DONNÉES  H2 in-memory (MODE PostgreSQL)                 │
│                                                                  │
│   users · roles · user_roles · categories · items                │
│   · rentals · reviews                                            │
└──────────────────────────────────────────────────────────────────┘
```

### Modèle de données (6 entités + jointure)

```
   ┌──────┐    M:N    ┌──────┐
   │ User │◄────────►│ Role │
   └──────┘ user_roles└──────┘
      │  1
      │
      │  M (en tant qu'owner)
      ▼
   ┌──────────┐    M:1    ┌──────────┐
   │  Item    │──────────►│ Category │
   └──────────┘            └──────────┘
      │  1
      │
      │  M
      ▼
   ┌──────────┐    M:1    ┌──────┐
   │  Rental  │──────────►│ User │  (en tant que renter)
   └──────────┘            └──────┘
      │  1
      │
      │  1:1
      ▼
   ┌──────────┐
   │  Review  │
   └──────────┘
```

**6 entités** : User, Role, Category, Item, Rental, Review
**Relations utilisées** : `@ManyToMany`, `@ManyToOne`, `@OneToOne`

---

## 3. Stack technique

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| **Java** | 21 LTS | Langage |
| **Spring Boot** | 3.5.14 | Framework |
| **Spring Data JPA** | (auto) | Accès BDD via interfaces |
| **Hibernate** | (auto) | ORM (Object-Relational Mapping) |
| **Spring Security 6** | (auto) | Authentification + autorisations |
| **JJWT** | 0.12.6 | Génération / validation des tokens JWT |
| **H2 Database** | (auto) | Base de données en mémoire |
| **Lombok** | (auto) | Génère getters, setters, constructeurs |
| **SpringDoc OpenAPI** | 2.6.0 | Swagger UI auto-généré |
| **Maven Wrapper** | (auto) | Build sans installer Maven |

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| **Next.js** | 16.2.6 | Framework React (App Router + Turbopack) |
| **React** | 19.2.4 | Lib UI |
| **TailwindCSS** | 4.x | Styles utility-first |
| **JavaScript** | ES2022+ | Langage (pas de TypeScript pour la simplicité) |

---

## 4. Backend Spring Boot

### 4.1 — Structure des fichiers

```
rental-platform/
├── pom.xml                              ← dépendances Maven
├── mvnw / mvnw.cmd                      ← Maven wrapper
├── .mvn/                                ← config wrapper
├── src/
│   ├── main/
│   │   ├── java/com/rental/
│   │   │   ├── RentalPlatformApplication.java   ← main()
│   │   │   │
│   │   │   ├── config/                  ← Configurations globales
│   │   │   │   ├── SecurityConfig.java        ← règles auth + CORS
│   │   │   │   ├── OpenApiConfig.java         ← Swagger config
│   │   │   │   └── DataSeeder.java            ← données de démo
│   │   │   │
│   │   │   ├── security/                ← Mécanique JWT
│   │   │   │   ├── JwtService.java            ← génère/valide tokens
│   │   │   │   ├── JwtAuthFilter.java         ← intercepte requêtes
│   │   │   │   ├── AppUserDetails.java        ← wrapper Spring Security
│   │   │   │   └── AppUserDetailsService.java ← cherche user par email
│   │   │   │
│   │   │   ├── exception/               ← Gestion erreurs
│   │   │   │   ├── BadRequestException.java
│   │   │   │   ├── NotFoundException.java
│   │   │   │   ├── ForbiddenException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │
│   │   │   ├── auth/                    ← Login / register
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── AuthService.java
│   │   │   │   └── dto/
│   │   │   │       ├── RegisterRequest.java
│   │   │   │       ├── LoginRequest.java
│   │   │   │       └── AuthResponse.java
│   │   │   │
│   │   │   ├── user/                    ← Entité User
│   │   │   │   ├── User.java
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── UserController.java
│   │   │   │   └── dto/UserResponse.java
│   │   │   │
│   │   │   ├── role/                    ← Entité Role
│   │   │   │   ├── Role.java
│   │   │   │   ├── ERole.java                 ← enum (ADMIN/OWNER/RENTER)
│   │   │   │   └── RoleRepository.java
│   │   │   │
│   │   │   ├── category/                ← Entité Category
│   │   │   │   ├── Category.java
│   │   │   │   ├── CategoryRepository.java
│   │   │   │   ├── CategoryService.java
│   │   │   │   ├── CategoryController.java
│   │   │   │   └── dto/
│   │   │   │       ├── CategoryRequest.java
│   │   │   │       └── CategoryResponse.java
│   │   │   │
│   │   │   ├── item/                    ← Entité Item (+ filtrage)
│   │   │   │   ├── Item.java
│   │   │   │   ├── ItemRepository.java
│   │   │   │   ├── ItemService.java
│   │   │   │   ├── ItemController.java
│   │   │   │   ├── ItemSpecification.java     ← filtres composables
│   │   │   │   └── dto/
│   │   │   │       ├── ItemRequest.java
│   │   │   │       └── ItemResponse.java
│   │   │   │
│   │   │   ├── rental/                  ← Entité Rental (workflow)
│   │   │   │   ├── Rental.java
│   │   │   │   ├── RentalStatus.java          ← enum d'états
│   │   │   │   ├── RentalRepository.java
│   │   │   │   ├── RentalService.java
│   │   │   │   ├── RentalController.java
│   │   │   │   └── dto/
│   │   │   │       ├── RentalRequest.java
│   │   │   │       └── RentalResponse.java
│   │   │   │
│   │   │   └── review/                  ← Entité Review
│   │   │       ├── Review.java
│   │   │       ├── ReviewRepository.java
│   │   │       ├── ReviewService.java
│   │   │       ├── ReviewController.java
│   │   │       └── dto/
│   │   │           ├── ReviewRequest.java
│   │   │           └── ReviewResponse.java
│   │   │
│   │   └── resources/
│   │       └── application.properties   ← config H2, JPA, JWT secret
│   │
│   └── test/                            ← Tests JUnit
│
└── target/                              ← Output Maven (généré, à ignorer)
```

### 4.2 — Architecture en couches

Chaque requête traverse **4 couches** :

```
HTTP   →  Controller  →  Service  →  Repository  →  Database
JSON      (parse        (logique    (SQL via       (H2)
          + délégation) métier)     Hibernate)
```

| Couche | Responsabilité | Annotation | Exemple de code |
|---|---|---|---|
| **Controller** | Mapper HTTP, sérialiser JSON | `@RestController`, `@PostMapping` | `ItemController.create()` |
| **Service** | Logique métier, transactions, règles | `@Service`, `@Transactional` | `ItemService.create()` |
| **Repository** | Accès BDD via interface | (hérite `JpaRepository`) | `itemRepository.save(item)` |
| **Entity** | Représente une table BDD | `@Entity` | `Item.java` |
| **DTO** | Forme des données échangées | (`record`) | `ItemRequest`, `ItemResponse` |

### 4.3 — Détail des 6 entités

#### User
- Champs : id, email (unique), password (BCrypt), firstName, lastName, phone, city, createdAt
- Relations :
  - `@ManyToMany Set<Role>` (table de jointure `user_roles`)
- Contrainte : `email` UNIQUE

#### Role
- Champs : id, name (enum `ERole`)
- Relations : inverse de User
- 3 valeurs : `ROLE_ADMIN`, `ROLE_OWNER`, `ROLE_RENTER`

#### Category
- Champs : id, name (unique), description
- Pas de relation (root entity)

#### Item
- Champs : id, title, description, dailyPrice, available, city, imageUrl, createdAt
- Relations :
  - `@ManyToOne Category` (sa catégorie)
  - `@ManyToOne User` (son propriétaire, owner)
- Utilisé par : Rental

#### Rental
- Champs : id, startDate, endDate, totalPrice, status (enum), createdAt
- Relations :
  - `@ManyToOne Item` (objet loué)
  - `@ManyToOne User` (locataire = renter)
- Statuts : `PENDING` → `CONFIRMED` → `COMPLETED` (ou `CANCELLED`)

#### Review
- Champs : id, rating (1-5), comment, createdAt
- Relations :
  - `@OneToOne Rental` (UNIQUE — 1 review max par rental)

### 4.4 — Cycle de vie d'une requête (3 exemples)

#### Exemple A — Login (`POST /api/auth/login`)

```
1. Client → POST /api/auth/login
   Body: {"email":"bob@rental.com","password":"bob123"}

2. JwtAuthFilter → pas de header Auth → laisse passer

3. SecurityFilterChain → URL /api/auth/** → permitAll

4. AuthController.login(LoginRequest req)
   ↓ @Valid déclenche validation @Email, @NotBlank

5. AuthService.login()
   ↓ authenticationManager.authenticate(email, password)
      ↓ AppUserDetailsService.loadUserByUsername()
         ↓ userRepository.findByEmail() → User + roles
      ↓ BCryptPasswordEncoder.matches(rawPwd, hashedPwd)
   ↓ jwtService.generateToken() → "eyJhbGciOi..."

6. AuthResponse(token, "Bearer", userId, email, roles) → JSON
```

#### Exemple B — Liste items filtrée (`GET /api/items?city=Tunis&maxPrice=20`)

```
1. Client → GET /api/items?city=Tunis&maxPrice=20

2. JwtAuthFilter → pas de token → continue
3. SecurityFilterChain → GET /api/items/** → permitAll

4. ItemController.search(categoryId=null, city="Tunis", maxPrice=20, ...)

5. ItemService.search()
   ↓ Construit Specification combinée :
     Specification.allOf(
       hasCategory(null)        → cb.conjunction() (rien)
       inCity("Tunis")          → WHERE lower(city) = 'tunis'
       priceLessThanOrEqual(20) → AND daily_price <= 20
       isAvailable(null)        → (rien)
       titleContains(null)      → (rien)
     )

6. ItemRepository.findAll(spec, pageable)
   ↓ @EntityGraph(attributePaths = {"owner", "category"})
   ↓ Hibernate génère UNE SEULE requête :
     SELECT i.*, c.*, o.*
     FROM items i
     JOIN categories c ON c.id = i.category_id
     JOIN users o ON o.id = i.owner_id
     WHERE lower(i.city) = 'tunis' AND i.daily_price <= 20

7. Mapping Item → ItemResponse → JSON Page<ItemResponse>
```

**N+1 fix** : grâce à `@EntityGraph`, on a **1 query** au lieu de N+1.

#### Exemple C — Créer une location (`POST /api/rentals`)

```
1. Client → POST /api/rentals
   Authorization: Bearer eyJhbGc...
   Body: {"itemId":1,"startDate":"2026-06-01","endDate":"2026-06-05"}

2. JwtAuthFilter
   ↓ Lit token → extractUsername() → "carol@rental.com"
   ↓ loadUserByUsername() → AppUserDetails
   ↓ jwtService.isValid() → OK
   ↓ SecurityContextHolder.setAuthentication() ✓

3. SecurityFilterChain → /api/rentals → authenticated ✓

4. RentalController.create()
   ↓ @PreAuthorize("hasAnyRole('RENTER','OWNER','ADMIN')") → Carol = RENTER ✓
   ↓ @AuthenticationPrincipal injecte Carol

5. RentalService.create()
   ↓ @Transactional START
   ↓ Validation : startDate < endDate
   ↓ itemRepository.findById(1) → drill de Bob
   ↓ Validation : item.available ✓
   ↓ Validation : item.owner ≠ currentUser ✓
   ↓ rentalRepository.existsOverlap() → false ✓
   ↓ Calcul totalPrice = 8.50 × 5 jours = 42.50 TND
   ↓ Rental.builder().status(PENDING).build()
   ↓ rentalRepository.save() → Hibernate INSERT
   ↓ @Transactional COMMIT

6. RentalResponse → JSON
```

### 4.5 — Sécurité (JWT + RBAC)

**Anatomie d'un JWT** :
```
eyJhbGciOiJIUzM4NCJ9 . eyJzdWIiOiJib2IuLi4ifQ . SIGNATURE
   ↑                       ↑                       ↑
   header (algo)           payload (claims)        signature HMAC
```

**Le payload contient** :
```json
{
  "sub": "bob@rental.com",
  "authorities": ["ROLE_OWNER","ROLE_RENTER"],
  "iat": 1778916534,
  "exp": 1779002934
}
```

**Le serveur ne stocke RIEN** (stateless). Il vérifie juste la signature à chaque requête.

**2 niveaux de RBAC** :

1. **Global** (dans `SecurityConfig`) :
   ```java
   .requestMatchers("/api/auth/**").permitAll()
   .requestMatchers(GET, "/api/items/**").permitAll()
   .anyRequest().authenticated()
   ```

2. **Par méthode** (dans les Controllers) :
   ```java
   @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
   public ResponseEntity<ItemResponse> create(...) { ... }
   ```

### 4.6 — Performances : N+1 et corrections

**Le problème N+1** : lister N items déclenche 1 + N requêtes (pour les owners) + N (pour les catégories).

**Mesuré dans notre projet** :
| Configuration | Nb de SQL pour `GET /api/items` |
|---|---|
| ❌ Sans `@EntityGraph` | **6 requêtes** (1 + 2 owners distincts + 3 catégories distinctes) |
| ✅ Avec `@EntityGraph` | **1 requête** (un seul SELECT avec 2 JOINs) |

**2 stratégies utilisées** :

1. **`@EntityGraph`** sur `ItemRepository.findAll(...)`
2. **`JOIN FETCH`** JPQL dans `RentalRepository.findAllByRenterIdFetched()` et `findAllByOwnerIdFetched()`

**Pour faire la démo** : `application.properties` active `spring.jpa.show-sql=true` et `generate_statistics=true` → on voit dans les logs le `Session Metrics` qui affiche le nb de JDBC statements.

### 4.7 — Filtrage avec Specifications

Le filtrage dynamique sur `/api/items` utilise **JPA Specifications** :

```java
public static Specification<Item> inCity(String city) {
    return (root, query, cb) -> (city == null || city.isBlank())
        ? cb.conjunction()                  // rien à filtrer
        : cb.equal(cb.lower(root.get("city")), city.toLowerCase());
}
```

Combiné dans le service :
```java
Specification.allOf(
    hasCategory(categoryId),
    inCity(city),
    priceLessThanOrEqual(maxPrice),
    isAvailable(available),
    titleContains(q)
);
```

→ Hibernate génère **un seul SQL** avec autant de `AND ...` que de filtres actifs.

### 4.8 — Endpoints (matrice complète)

| Méthode | URL | Rôle requis | Description |
|---|---|---|---|
| POST | /api/auth/register | public | Inscription |
| POST | /api/auth/login | public | Connexion |
| GET | /api/users | ADMIN | Liste users |
| GET | /api/users/me | authentifié | Mon profil |
| GET | /api/users/{id} | ADMIN | Profil user |
| GET | /api/categories | public | Liste catégories |
| GET | /api/categories/{id} | public | Détail catégorie |
| POST | /api/categories | ADMIN | Créer catégorie |
| PUT | /api/categories/{id} | ADMIN | Modifier |
| DELETE | /api/categories/{id} | ADMIN | Supprimer |
| GET | /api/items | public | Liste avec filtres |
| GET | /api/items/{id} | public | Détail item |
| POST | /api/items | OWNER/ADMIN | Créer item |
| PUT | /api/items/{id} | propriétaire / ADMIN | Modifier |
| DELETE | /api/items/{id} | propriétaire / ADMIN | Supprimer |
| POST | /api/rentals | RENTER/OWNER/ADMIN | Créer location |
| GET | /api/rentals/my | authentifié | Mes locations |
| GET | /api/rentals/on-my-items | OWNER/ADMIN | Locations sur mes items |
| PATCH | /api/rentals/{id}/confirm | OWNER de l'item / ADMIN | Confirmer |
| PATCH | /api/rentals/{id}/cancel | RENTER / OWNER / ADMIN | Annuler |
| PATCH | /api/rentals/{id}/complete | OWNER / ADMIN | Terminer |
| POST | /api/reviews | RENTER (sur rental COMPLETED) | Créer avis |
| GET | /api/reviews/item/{id} | public | Avis d'un item |

### 4.9 — application.properties

```properties
# Serveur
server.port=8080

# H2 in-memory en mode PostgreSQL
spring.datasource.url=jdbc:h2:mem:rentaldb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=create-drop      # recrée le schéma à chaque démarrage
spring.jpa.show-sql=true                       # affiche le SQL généré
spring.jpa.properties.hibernate.generate_statistics=true  # pour la démo N+1
spring.jpa.open-in-view=false                  # évite les chargements lazy en sérialisation

# JWT
app.jwt.secret=ZmFrZS1zZWNyZXQta2V5...         # clé HMAC encodée base64
app.jwt.expiration-ms=86400000                 # 24h

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
```

---

## 5. Frontend Next.js

### 5.1 — Structure des fichiers

```
rental-frontend/
├── package.json                 ← dépendances npm
├── next.config.mjs              ← config Next.js
├── postcss.config.mjs           ← config PostCSS (pour Tailwind)
├── jsconfig.json                ← path aliases (@/* → ./*)
│
├── app/                         ← App Router (Next.js 13+)
│   ├── layout.js                ← layout racine (Nav + footer)
│   ├── page.js                  ← / → redirige vers /items
│   ├── globals.css              ← styles globaux + Tailwind
│   ├── login/page.js            ← page /login
│   ├── items/page.js            ← page /items
│   ├── my-rentals/page.js       ← page /my-rentals
│   └── create-item/page.js      ← page /create-item
│
├── components/
│   └── Nav.js                   ← barre de navigation
│
├── lib/
│   ├── api.js                   ← wrapper fetch + gestion token
│   └── constants.js             ← villes TN + emojis catégories
│
└── public/                      ← assets statiques (images, favicon)
```

### 5.2 — Concepts Next.js essentiels

**App Router** = système de routage basé sur les dossiers :
- `app/login/page.js` → URL `/login`
- `app/items/page.js` → URL `/items`
- Chaque `page.js` est automatiquement transformé en route

**Server Components vs Client Components** :
- Par défaut, tous les composants sont **Server Components** (rendus côté serveur)
- Si on a besoin de `useState`, `useEffect`, événements (`onClick`), accès `localStorage` → on met `"use client"` en haut du fichier
- Toutes nos pages sont `"use client"` car elles ont de l'interactivité

**Tailwind CSS v4** : framework CSS utility-first. On compose les styles via classes :
```jsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
```

### 5.3 — Détail des fichiers clés

#### `lib/api.js` — le wrapper API

C'est notre couche d'accès au backend. 4 responsabilités :

1. **Gestion du token JWT** :
   ```js
   export function getToken() { return localStorage.getItem("token"); }
   export function setToken(token) { localStorage.setItem("token", token); }
   export function clearToken() { localStorage.removeItem("token"); ... }
   ```

2. **Gestion de l'user en cache** :
   ```js
   export function getUser() { return JSON.parse(localStorage.getItem("user")); }
   export function hasRole(role) {
     return getUser()?.roles?.includes(`ROLE_${role}`);
   }
   ```

3. **Wrapper `fetch`** : ajoute automatiquement `Authorization: Bearer <token>` :
   ```js
   export async function api(path, options = {}) {
     const token = getToken();
     const headers = {
       "Content-Type": "application/json",
       ...(token ? { Authorization: `Bearer ${token}` } : {}),
     };
     const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
     // ... parse JSON, throw si erreur
   }
   ```

4. **Gestion des erreurs** : si le backend renvoie 400/403/404 avec `{"message": "..."}`, on `throw new Error(message)` pour que la page puisse afficher l'erreur.

#### `lib/constants.js`
- Liste des **26 villes tunisiennes** (gouvernorats)
- Mapping **catégorie → emoji** (🔧 Power Tools, 🌳 Garden, ⛺ Camping)

#### `components/Nav.js`
- Header sticky avec gradient indigo→purple
- Menu responsive (burger sur mobile)
- Affiche dynamiquement les liens selon le rôle :
  - "Mes locations" → seulement si connecté
  - "+ Créer un item" → seulement si OWNER ou ADMIN
- Affiche l'email du user connecté + bouton Logout

#### `app/layout.js` — layout racine
```jsx
<html lang="fr">
  <body className="min-h-screen flex flex-col">
    <Nav />
    <main>{children}</main>     ← les pages s'affichent ici
    <footer>...</footer>
  </body>
</html>
```
Le `Nav` et le `footer` sont présents sur **toutes les pages**.

#### Les 4 pages

| Page | Rôle | Logique |
|---|---|---|
| `/login` | Formulaire de connexion | POST `/api/auth/login` → stocke le token → redirige vers `/items` |
| `/items` | Catalogue avec filtres | GET `/api/items?...`, modal location si connecté |
| `/my-rentals` | Liste des locations du user | GET `/api/rentals/my`, boutons cancel/review |
| `/create-item` | Formulaire de création | POST `/api/items` (OWNER/ADMIN seulement) |

### 5.4 — Cycle de vie d'une action côté frontend

**Exemple : Carol veut louer un item**

```
1. Carol clique "Louer maintenant" sur la card de l'item
   → setRentingItem(item) ouvre le modal

2. Carol choisit ses dates et clique "Confirmer"
   → submitRental() est appelée

3. submitRental():
   await api("/api/rentals", {
     method: "POST",
     body: JSON.stringify({ itemId, startDate, endDate })
   })

4. api() :
   - Lit le token dans localStorage
   - Ajoute "Authorization: Bearer <token>"
   - Envoie le fetch
   - Parse la réponse JSON

5. Si succès : showToast("success", "Location créée !")
   Si erreur : showToast("error", err.message)
```

### 5.5 — Stockage du token

Le JWT est stocké dans **`localStorage`** :
- Persiste après refresh
- Accessible par JavaScript
- Limite : vulnérable XSS (acceptable pour un projet école)

En production sérieuse, on préférerait un **httpOnly cookie**.

---

## 6. Communication Front ↔ Back

### 6.1 — CORS

Le navigateur **bloque par défaut** toute requête depuis `localhost:3000` vers `localhost:8080` (Same-Origin Policy).

Le backend l'autorise explicitement via `SecurityConfig.corsConfigurationSource()` :
```java
cfg.setAllowedOrigins(List.of("http://localhost:3000"));
cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
cfg.setAllowedHeaders(List.of("*"));
cfg.setAllowCredentials(true);
```

Le navigateur envoie d'abord une requête **OPTIONS (preflight)** pour vérifier les permissions, puis la vraie requête.

### 6.2 — Flux d'authentification complet

```
[NAVIGATEUR]                        [SPRING BOOT]
     │                                    │
     │  1. POST /api/auth/login           │
     ├───────────────────────────────────►│
     │     {"email":...,"password":...}   │
     │                                    │
     │                                    │  2. AuthService.login()
     │                                    │     - cherche user en BDD
     │                                    │     - compare BCrypt
     │                                    │     - génère JWT
     │                                    │
     │  3. {"token":"eyJ...",...}         │
     │◄───────────────────────────────────┤
     │                                    │
     │  4. localStorage.setItem("token")  │
     │                                    │
     │  5. router.push("/items")          │
     │                                    │
     │  6. GET /api/items                 │
     │     Authorization: Bearer eyJ...   │
     ├───────────────────────────────────►│
     │                                    │
     │                                    │  7. JwtAuthFilter
     │                                    │     - valide signature
     │                                    │     - charge user
     │                                    │     - met dans SecurityContext
     │                                    │
     │                                    │  8. ItemService.search()
     │                                    │     - 1 SQL avec JOINs (anti N+1)
     │                                    │
     │  9. [{...}, {...}, ...]            │
     │◄───────────────────────────────────┤
```

---

## 7. Comment lancer le projet

### Prérequis (déjà installés)
- ✅ JDK 21 (`C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot`)
- ✅ Node.js 24
- ✅ VS Code

### Démarrer le backend

```powershell
cd "C:\Users\ABC SALLES\Documents\GitHub\SpringBoot project\rental-platform"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
.\mvnw.cmd spring-boot:run
```

**Attendre dans la console** :
```
Tomcat started on port 8080
Started RentalPlatformApplication in X seconds
=== Data seeded ===
Login as: admin@rental.com / admin123  (ADMIN+OWNER+RENTER)
Login as: bob@rental.com / bob123      (OWNER+RENTER)
Login as: carol@rental.com / carol123  (RENTER)
```

### Démarrer le frontend (dans un autre terminal)

```powershell
cd "C:\Users\ABC SALLES\Documents\GitHub\SpringBoot project\rental-frontend"
npm run dev
```

**Attendre** :
```
▲ Next.js 16.2.6 (Turbopack)
- Local:    http://localhost:3000
✓ Ready in 884ms
```

### URLs utiles

| URL | Quoi |
|---|---|
| http://localhost:3000 | **Frontend Next.js** |
| http://localhost:8080/swagger-ui.html | **Swagger UI** (API interactive) |
| http://localhost:8080/h2-console | **Console BDD** (JDBC: `jdbc:h2:mem:rentaldb`, user `sa`) |
| http://localhost:8080/api/items | API raw (JSON brut) |

### Comptes de démo

| Email | Password | Rôles |
|---|---|---|
| admin@rental.com | admin123 | ADMIN + OWNER + RENTER |
| bob@rental.com | bob123 | OWNER + RENTER |
| carol@rental.com | carol123 | RENTER |

---

## 8. Critères d'évaluation

Le sujet impose **5 points obligatoires** (sur 16 pts) :

### ✅ Critère 1 — 2 entités par membre (6 entités au total) avec CRUD + filtrage

- **Membre A** → User, Role (auth, RBAC)
- **Membre B** → Category, Item (avec filtrage Specifications)
- **Membre C** → Rental (workflow), Review

**CRUD complet sur** : Category, Item, Rental (modifié via PATCH), Review
**Filtrage** : `GET /api/items?categoryId=&city=&maxPrice=&available=&q=&page=&size=`

### ✅ Critère 2 — Persistance Spring Data JPA + Hibernate

- 6 entités `@Entity`
- 6 repositories `extends JpaRepository`
- Schéma BDD auto-généré par Hibernate (`spring.jpa.hibernate.ddl-auto=create-drop`)
- Transactions via `@Transactional`

### ✅ Critère 3 — Manipulation des relations

Toutes les relations JPA présentes :
- `@ManyToMany` : User ↔ Role (table `user_roles`)
- `@ManyToOne` / `@OneToMany` : Item → Category, Item → User (owner), Rental → Item, Rental → User (renter)
- `@OneToOne` : Rental → Review

### ✅ Critère 4 — Performances (N+1, chargement)

- `FetchType.LAZY` partout par défaut
- `@EntityGraph(attributePaths = {"owner", "category"})` sur `ItemRepository.findAll()`
- `JOIN FETCH` JPQL dans `RentalRepository`
- `spring.jpa.open-in-view=false` pour éviter les lazy en serialization
- **Démo mesurée** : 6 queries → 1 query (Session Metrics dans les logs)

### ✅ Critère 5 — Spring Security JWT + RBAC

- Filtre custom `JwtAuthFilter` qui intercepte chaque requête
- Tokens signés HMAC-SHA384 (JJWT 0.12)
- Passwords hashés en BCrypt
- 3 rôles : ADMIN, OWNER, RENTER
- RBAC à 2 niveaux : URL (`SecurityConfig`) + méthode (`@PreAuthorize`)
- Stateless (pas de session)

### ✅ Critère 6 — Constructor Injection

- `@RequiredArgsConstructor` (Lombok) sur tous les controllers et services
- Tous les champs en `private final`
- Pas un seul `@Autowired` field injection

### 🎁 Bonus implémentés

- **Frontend Next.js 16** complet avec Tailwind v4
  - Page de login avec comptes de démo cliquables
  - Catalogue d'items avec filtres dynamiques + cards modernes
  - Workflow de location de bout en bout
  - Gestion des reviews
  - Design responsive (mobile + desktop)
- **Swagger UI** : doc API auto-générée
- **H2 console** : visualisation directe de la BDD
- **Global Exception Handler** : erreurs formatées en JSON propre
- **Validation Bean Validation** : `@Email`, `@NotBlank`, `@Size`, `@Min/@Max`
- **Villes tunisiennes** : datalist de 26 gouvernorats

---

## 9. Préparation soutenance — Q&A

### Questions probables du jury

**Q : Pourquoi Spring Boot et pas Spring Framework classique ?**
> Spring Boot ajoute l'auto-configuration et un serveur embarqué (Tomcat). On peut démarrer un serveur HTTP en 1 ligne avec `SpringApplication.run()`. Sans Spring Boot, il faudrait des centaines de lignes de config XML.

**Q : C'est quoi l'IoC / DI ?**
> Inversion of Control : c'est le framework qui crée et connecte les objets entre eux, pas le code utilisateur. Quand je déclare `private final UserRepository userRepository`, Spring l'injecte automatiquement dans le constructeur. Mes classes ne créent jamais leurs dépendances elles-mêmes.

**Q : Pourquoi Constructor Injection plutôt que Field Injection (`@Autowired`) ?**
> Trois raisons : (1) les champs sont `final` → immutables, (2) testable sans Spring (je peux passer des mocks au constructeur), (3) échec rapide au démarrage si une dépendance manque. C'est la pratique recommandée par Spring depuis 2018.

**Q : C'est quoi le N+1 et comment vous l'avez résolu ?**
> Quand on charge N items, Hibernate fait une requête supplémentaire par item pour ses relations LAZY. Sur 100 items, on a 1 + 200 = 201 requêtes au lieu d'1 seule. J'ai résolu ça avec `@EntityGraph(attributePaths = {"owner", "category"})` sur `findAll()` → un seul SELECT avec JOINs. Mesuré : 6 queries → 1 query.

**Q : Pourquoi JWT et pas une session côté serveur ?**
> JWT est stateless : le serveur ne stocke rien. Tout est dans le token signé. Cela permet de scaler horizontalement (plusieurs serveurs derrière un load balancer sans session partagée). C'est aussi parfait pour les SPA et les apps mobiles qui n'ont pas de cookies.

**Q : Comment vous protégez les mots de passe ?**
> BCrypt. C'est un algorithme de hashage **lent par design**, avec salt aléatoire et coût ajustable. Même si la BDD fuite, déchiffrer un password prend des années. À chaque hash, le salt change → 2 hash du même password sont différents.

**Q : Qu'est-ce qui se passe si une exception est lancée pendant une transaction ?**
> Avec `@Transactional`, Spring fait un ROLLBACK automatique sur RuntimeException. Si je crée un Rental et que l'INSERT échoue à mi-chemin, toute la transaction est annulée → la BDD reste cohérente.

**Q : C'est quoi un DTO et pourquoi vous en utilisez ?**
> Data Transfer Object. C'est un objet qui définit la forme exacte des données échangées avec le client. (1) Je ne fuit pas le password du User. (2) Je peux changer l'entité sans casser l'API. (3) Je valide les entrées au bon endroit (`@Email`, `@NotBlank`). (4) J'évite les `LazyInitializationException` à la sérialisation JSON.

**Q : Comment marche le RBAC ?**
> 2 niveaux : (1) `SecurityConfig` filtre par URL avec `permitAll`/`authenticated`. (2) `@PreAuthorize("hasRole('OWNER')")` sur chaque méthode controller. Spring rejette automatiquement avec 403 si le rôle manque.

**Q : Pourquoi `Set<Role>` et pas `List<Role>` ?**
> Un user ne peut pas avoir le même rôle deux fois. `Set` garantit l'unicité au niveau Java. Hibernate optimise aussi mieux les ManyToMany avec `Set`.

**Q : Pourquoi `FetchType.LAZY` partout ?**
> Pour éviter de charger en cascade toute la BDD à chaque requête. EAGER charge toutes les relations + leurs relations → explosion. Avec LAZY, on contrôle finement ce qu'on charge (via `@EntityGraph` ou `JOIN FETCH` quand on en a besoin).

**Q : Comment vous gérez les filtres dynamiques ?**
> J'utilise les **JPA Specifications**. Chaque méthode statique retourne un prédicat SQL. Je les combine avec `Specification.allOf(...)`. Hibernate génère **un seul SQL** avec autant de `AND ...` que de filtres actifs. Si un filtre est null, on retourne `cb.conjunction()` (= true) → ce filtre disparaît du SQL.

**Q : Quelle est la différence entre `@RequestParam` et `@PathVariable` ?**
> `@PathVariable` lit dans l'URL : `/items/{id}` → 42. `@RequestParam` lit les query params : `/items?city=Tunis`.

**Q : Pourquoi avez-vous choisi H2 plutôt que PostgreSQL ?**
> Pour la simplicité d'évaluation : H2 in-memory démarre sans installation. La config `MODE=PostgreSQL` simule la syntaxe de Postgres. Pour la prod, il suffirait de changer `application.properties` (driver, URL) — le reste du code ne bouge pas grâce à JPA.

**Q : Pourquoi Next.js et pas du React classique ?**
> Next.js 16 (App Router) propose le routing basé sur les dossiers, des Server Components par défaut (perf), du hot-reload Turbopack ultra-rapide. C'est plus moderne et productif que CRA (obsolète).

**Q : Comment le frontend transporte le token ?**
> Le token est stocké dans `localStorage` après le login. Mon wrapper `api()` lit automatiquement `localStorage.getItem("token")` et l'ajoute en header `Authorization: Bearer <token>` sur chaque requête.

**Q : Que se passe-t-il si le token expire ?**
> `JwtService.isValid()` vérifie `claims.getExpiration().after(new Date())`. Si expiré, l'user reste anonyme → tout endpoint protégé renvoie 403. Côté front, on devrait gérer ça en redirigeant vers /login (à améliorer).

---

## 10. Démonstration recommandée

### Plan de démo (10 minutes)

**Phase 1 — Architecture (1 min)**
- Ouvrir VS Code, montrer la structure de packages backend
- Montrer l'image du schéma 6 entités + relations

**Phase 2 — Sécurité & RBAC (2 min)**
- Aller sur http://localhost:3000
- Login en tant que **Carol (RENTER)** → montrer qu'il n'y a pas de "+ Créer un item"
- Tenter d'accéder à `/create-item` manuellement → redirection / message d'erreur
- Logout
- Login en tant que **Bob (OWNER)** → le bouton "+ Créer un item" apparaît

**Phase 3 — CRUD + Filtrage (2 min)**
- Sur `/items` :
  - Montrer les 4 items
  - Filtrer par ville "Hammamet" → 1 item
  - Filtrer par catégorie "Camping" + prix max 15 → 1 item
  - Reset
- Créer un nouvel item via `/create-item`

**Phase 4 — Workflow location + transactions (2 min)**
- En Carol, louer le drill → status PENDING
- Logout, login Bob → confirmer la location → CONFIRMED
- Bob complete → COMPLETED
- Logout, login Carol → laisser un avis (rating 5)
- Retour aux items → l'avis est visible

**Phase 5 — Performances N+1 (2 min, LE GROS POINT)**
- Ouvrir le terminal Spring Boot
- Faire un GET /api/items
- Pointer dans les logs : `Session Metrics { ... 1 JDBC statements ... }`
- Ouvrir `ItemRepository.java`, commenter `@EntityGraph`, recompiler
- Refaire le GET → `Session Metrics { ... 6 JDBC statements ... }`
- Décommenter, dire : "**6 → 1, réduction par 6 sur seulement 4 items**"

**Phase 6 — Swagger + H2 (1 min)**
- Swagger UI : http://localhost:8080/swagger-ui.html
- Cliquer "Authorize" → coller un token
- Tester un endpoint protégé

### Points à insister

1. **"On a respecté tous les critères techniques obligatoires"**
2. **"Le N+1 mesuré dans les Session Metrics d'Hibernate, on passe de 6 à 1 requête"**
3. **"L'injection est entièrement par constructeur via Lombok"**
4. **"Les DTO protègent les passwords et découplent l'API de la BDD"**
5. **"Le filtrage utilise JPA Specifications combinables — pas de string concat SQL"**

### Erreurs à éviter pendant la démo

- ❌ Ne pas dire "Spring Boot est un langage" → c'est un framework Java
- ❌ Ne pas confondre `@Service` et `@Component` (Service hérite de Component mais sémantiquement c'est différent)
- ❌ Ne pas dire que le JWT est crypté → il est **signé** (lisible par tout le monde, mais non modifiable)
- ❌ Ne pas appeler `@EntityGraph` une "magie" → expliquer que c'est un hint qui demande à Hibernate de JOIN dès la query principale

---

## Annexe — Cheat sheet des annotations

### Spring

| Annotation | Rôle |
|---|---|
| `@SpringBootApplication` | Point d'entrée |
| `@RestController` | Controller HTTP renvoyant du JSON |
| `@Service` | Couche métier |
| `@Configuration` | Classe de config |
| `@Bean` | Déclare un bean dans une `@Configuration` |
| `@Component` | Bean générique |
| `@RequiredArgsConstructor` (Lombok) | Constructeur des `final` |

### HTTP

| Annotation | Rôle |
|---|---|
| `@RequestMapping("/api/x")` | Préfixe d'URL |
| `@GetMapping`, `@PostMapping`... | Verbe HTTP |
| `@RequestBody` | JSON → objet Java |
| `@PathVariable` | Variable d'URL |
| `@RequestParam` | Query param |
| `@Valid` | Active validation |
| `@AuthenticationPrincipal` | User connecté |

### JPA

| Annotation | Rôle |
|---|---|
| `@Entity`, `@Table` | Mapping table |
| `@Id`, `@GeneratedValue` | Clé primaire |
| `@Column` | Détails colonne |
| `@ManyToOne`, `@OneToMany`, `@ManyToMany`, `@OneToOne` | Relations |
| `@JoinColumn`, `@JoinTable` | Clés étrangères |
| `@Enumerated(EnumType.STRING)` | Enum en VARCHAR |
| `@Transactional` | Transaction BDD |
| `@EntityGraph` | Fetch anti-N+1 |
| `@Query` | JPQL custom |

### Sécurité

| Annotation | Rôle |
|---|---|
| `@EnableMethodSecurity` | Active `@PreAuthorize` |
| `@PreAuthorize("hasRole('X')")` | Contrôle d'accès méthode |

### Validation

| Annotation | Rôle |
|---|---|
| `@NotBlank`, `@NotNull` | Champ obligatoire |
| `@Email` | Format email |
| `@Size(min, max)` | Longueur |
| `@Min`, `@Max` | Borne numérique |
| `@DecimalMin` | Min pour BigDecimal |

---

*Document généré pour la soutenance du projet RentaTN — Spring Boot + Next.js*
