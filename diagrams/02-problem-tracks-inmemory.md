# Problem 2: Tracks Service - In-Memory vs Prisma

## Architektura Przed Poprawą

```mermaid
graph TB
    subgraph "❌ Nieprawidłowa architektura"
        Users["👤 Users Service<br/>Prisma ORM"]
        Albums["📀 Albums Service<br/>Prisma ORM"]
        Artists["🎤 Artists Service<br/>Prisma ORM"]
        Tracks["🎵 Tracks Service<br/>❌ IN-MEMORY<br/>private tracks: Track[]"]
        Favorites["⭐ Favorites Service<br/>Prisma ORM"]
    end
    
    Users -->|Prisma| DB[("🗄️ SQLite DB")]
    Albums -->|Prisma| DB
    Artists -->|Prisma| DB
    Tracks -->|❌ Memory| Memory["RAM Array<br/>❌ Nie persistuje<br/>❌ Tracone przy restart"]
    Favorites -->|Prisma| DB
    
    style Tracks fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style Memory fill:#ff6b6b,stroke:#c92a2a,color:#fff
```

## Problem w Testach

```mermaid
sequenceDiagram
    participant Test as 🧪 Test Suite
    participant Tracks as Tracks Service<br/>❌ IN-MEMORY
    participant DB as 🗄️ Database<br/>✅ Prisma
    participant Favs as Favorites Service<br/>✅ Prisma
    
    Test->>Tracks: POST /track (create)
    Tracks->>Tracks: Dodaj do RAM array
    Tracks-->>Test: ✅ 201 Created
    
    Test->>Tracks: GET /track
    Tracks->>Tracks: Czytaj z RAM array
    Test-->>Test: ✅ Test 1 przechodzi
    
    Test->>Favs: POST /favs/track/:id
    Favs->>DB: Szukaj track w DB
    DB-->>Favs: ❌ Track nie znaleziony!
    Favs-->>Test: ❌ 404 Not Found
    Test-->>Test: ❌ TEST FAILS!
    
    Note over Tracks,DB: Tracks w RAM nie są w DB!
```

## Rozwiązanie - Migracja na Prisma

```mermaid
graph TB
    subgraph "✅ Prawidłowa architektura"
        Users["👤 Users Service<br/>Prisma ORM"]
        Albums["📀 Albums Service<br/>Prisma ORM"]
        Artists["🎤 Artists Service<br/>Prisma ORM"]
        Tracks["🎵 Tracks Service<br/>✅ Prisma ORM"]
        Favorites["⭐ Favorites Service<br/>Prisma ORM"]
    end
    
    Users -->|Prisma| DB[("🗄️ SQLite DB")]
    Albums -->|Prisma| DB
    Artists -->|Prisma| DB
    Tracks -->|✅ Prisma| DB
    Favorites -->|Prisma| DB
    
    style Tracks fill:#51cf66,stroke:#2f9e44,color:#fff
    style DB fill:#51cf66,stroke:#2f9e44,color:#fff
```

## Implementacja Poprawki

### Krok 1: TracksModule Import Prisma

```typescript
// ❌ PRZED
@Module({
  controllers: [TracksController],
  providers: [TracksService],
})

// ✅ PO
@Module({
  imports: [PrismaModule],
  controllers: [TracksController],
  providers: [TracksService],
})
```

### Krok 2: TracksService - Zmiana na Async + Prisma

```mermaid
sequenceDiagram
    participant ctrl as Controller
    participant svc as Service
    participant db as Prisma
    
    ctrl->>svc: findAll()
    svc->>db: prisma.track.findMany()
    db-->>svc: [Track[], Track[], ...]
    svc-->>ctrl: Promise<Track[]>
    ctrl-->>client: JSON
```

## Porównanie Metod

| Operacja | IN-MEMORY ❌ | PRISMA ✅ |
|----------|-------------|----------|
| `create()` | `this.tracks.push()` | `prisma.track.create()` |
| `findAll()` | `return this.tracks` | `prisma.track.findMany()` |
| `findOne()` | `array.find()` | `prisma.track.findUnique()` |
| `update()` | `array[i] = {...}` | `prisma.track.update()` |
| `remove()` | `array.splice()` | `prisma.track.delete()` |
| **Persistence** | ❌ RAM tylko | ✅ DB |
| **Multi-service** | ❌ Niedostępne | ✅ Widoczne |

## Rezultat

```
❌ PRZED: 4/10 testów Tracks przechodzą (40%)
          Favs/Tracks: 404 errors
          
✅ PO:    10/10 testów Tracks przechodzą (100%)
          Favs/Tracks: działa prawidłowo
```
