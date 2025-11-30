# Identyfikacja i Debugowanie Problemów

## Mapa Debugowania - Odkrywanie Root Causes

```mermaid
graph TD
    A["❌ PROBLEM<br/>94 Tests Failing<br/>AggregateError"]
    
    B["🔍 VERBOSE TEST RUN<br/>--verbose flag"]
    
    C["📊 RZECZYWISTOŚĆ<br/>Tylko 6 z 94 faile"]
    
    D1["🎵 Tracks Tests<br/>404 Errors"]
    D2["🎤 Artists Delete<br/>artistId not null"]
    D3["📀 Albums Delete<br/>albumId not null"]
    
    E1["❓ Why tracks 404?<br/>FavoritesService queries DB<br/>but Tracks in RAM"]
    E2["❓ Why artistId not null?<br/>Using Promise.all<br/>race condition possible"]
    E3["❓ Why albumId not null?<br/>Same race condition<br/>in cascade delete"]
    
    F1["💡 ROOT CAUSE<br/>Tracks in-memory storage<br/>not Prisma ORM"]
    F2["💡 ROOT CAUSE<br/>Promise.all not atomic<br/>operations not ordered"]
    
    A --> B
    B --> C
    C --> D1
    C --> D2
    C --> D3
    
    D1 --> E1
    D2 --> E2
    D3 --> E3
    
    E1 --> F1
    E2 --> F2
    E3 --> F2
    
    style A fill:#ff6b6b,color:#fff
    style C fill:#ffd93d
    style D1 fill:#ff6b6b
    style D2 fill:#ff6b6b
    style D3 fill:#ff6b6b
    style F1 fill:#4c6ef5
    style F2 fill:#4c6ef5
```

## Analiza Błędów - Detailing Issues

### Issue #1: Tracks Service In-Memory Storage

```
┌─────────────────────────────────────────────────────────────┐
│ PROBLEM ANALYSIS                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ TracksController                                           │
│   └─> POST /tracks                                         │
│       └─> TracksService.create()                          │
│           └─> this.tracks.push() ❌ IN-MEMORY ONLY        │
│                                                             │
│ FavoritesController                                        │
│   └─> GET /favs/tracks                                    │
│       └─> FavoritesService.getTracks()                    │
│           └─> prisma.track.findUnique() ❌ DATABASE      │
│                └─> NULL (track never saved to DB)        │
│                                                             │
│ RESULT: 404 - Track Not Found                             │
│ TWO DIFFERENT STORAGE LAYERS = INCONSISTENCY             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Issue #2: Cascade Delete Race Condition

```
┌──────────────────────────────────────────────────────────────┐
│ RACE CONDITION IN ARTISTS DELETE                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Promise.all(                                               │
│   updateTracksWithArtistId(null),   ← Starts             │
│   updateAlbumsWithArtistId(null),   ← Starts             │
│   disconnectFromFavorites(),        ← Starts             │
│   deleteArtist()                    ← Can start anytime! │
│ )                                                          │
│                                                              │
│ TIMELINE:                                                  │
│ T=0ms: Promise.all([update1, update2, update3, delete])  │
│ T=5ms: delete() finishes BEFORE update() completes      │
│ T=10ms: update() tries to set artistId=null on deleted   │
│         artist's tracks → silently fails                  │
│ RESULT: artistId still has old UUID (not null)          │
│                                                              │
│ DATABASE STATE: INCONSISTENT                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Proces Debugowania - Krok po Kroku

```mermaid
sequenceDiagram
    actor User
    participant Agent as Copilot Agent
    participant Tests as Jest Tests
    participant Code as Source Code

    User->>Agent: "sprawdz testy"
    
    Agent->>Tests: npm test (no verbose)
    Tests-->>Agent: AggregateError (confusing!)
    
    Agent->>Agent: 🤔 That's odd... 94 errors?
    
    Agent->>Tests: npm test -- --verbose
    Tests-->>Agent: ✅ Detailed output
    
    Agent->>Agent: 📊 Analyze: Only 6 real failures<br/>not 94!
    
    Agent->>Code: Read tracks tests
    Agent->>Code: Read artists tests
    Agent->>Code: Read albums tests
    
    Agent->>Agent: 💡 Pattern found:<br/>- Tracks: 404<br/>- Artists: artistId<br/>- Albums: albumId
    
    Agent->>Code: Read TracksService
    Agent->>Code: Aha! private tracks = []
    
    Agent->>Code: Read ArtistsService.remove()
    Agent->>Code: Aha! Promise.all([...])
    
    Agent->>User: ✅ Root causes identified<br/>Fix #1: Tracks to Prisma<br/>Fix #2: Add transactions
```

## Debugging Checklist

```mermaid
graph TB
    A["1. Zidentyfikuj symptomy<br/>❌ 94 test failures"]
    B["2. Zbierz rzeczywiste dane<br/>✅ Verbose output: 6 failures"]
    C["3. Szukaj wzorów<br/>✅ All failures track/artist/album related"]
    D["4. Przeanalizuj kod powiązany<br/>✅ Found in-memory storage"]
    E["5. Sformułuj hipotezy<br/>✅ Two storage layers cause mismatch"]
    F["6. Testuj hipotezy<br/>✅ Migrate tracks to Prisma"]
    G["7. Zweryfikuj fixes<br/>✅ Re-run tests"]
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    
    style A fill:#ff6b6b,color:#fff
    style B fill:#ffd93d
    style C fill:#ffd93d
    style D fill:#4c6ef5
    style E fill:#4c6ef5
    style F fill:#51cf66
    style G fill:#51cf66
```

## Key Learnings

1. **Verbose Output is Critical** 🔍
   - Non-verbose output showed "AggregateError" (misleading)
   - Verbose flag revealed actual 6 failures
   - Always use `--verbose` for debugging test suites

2. **Consistent Storage Layers** 🗄️
   - All services must use same ORM (not mixed in-memory + Prisma)
   - Database queries must hit actual database
   - One source of truth

3. **Atomic Operations** 🔒
   - Promise.all = concurrent, not ordered
   - $transaction = sequential, atomic (all or nothing)
   - Critical for multi-step database operations

4. **Test-Driven Debugging** 🧪
   - Failing tests point to code issues
   - Each failing test = one specific problem
   - Systematic approach: identify → isolate → fix

