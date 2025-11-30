# Problem 1: Linting Errors

## Diagram - Nieużywane zmienne

```mermaid
graph TD
    A["❌ Linting Errors<br/>6 błędów w kodzie"] --> B["Albums Service<br/>Unused 'Album' import"]
    A --> C["Favorites Service<br/>Unused 'UnprocessableEntityException'"]
    A --> D["Users Service - 4 błędy<br/>Unused 'password' variable<br/>w destrukturyzacji"]
    
    B -->|❌ Błąd ESLint| B1["@typescript-eslint/no-unused-vars<br/>import nie używany"]
    C -->|❌ Błąd ESLint| C1["@typescript-eslint/no-unused-vars<br/>exception nie używany"]
    D -->|❌ Błąd ESLint| D1["@typescript-eslint/no-unused-vars<br/>password destructured ale nie użyty"]
    
    B1 -->|✅ ROZWIĄZANIE| B2["Usunąć import"]
    C1 -->|✅ ROZWIĄZANIE| C2["Usunąć import"]
    D1 -->|✅ ROZWIĄZANIE| D2["Zmienić destrukturyzację<br/>na jawne mapowanie pól<br/>bez hasła"]
    
    B2 --> E["✅ Lint: 0 błędów"]
    C2 --> E
    D2 --> E
```

## Szczegóły Poprawy - Users Service

```mermaid
sequenceDiagram
    participant old as ❌ Stary kod
    participant new as ✅ Nowy kod
    
    old->>old: const { password, ...user } = obj
    note right of old: password nie jest używany<br/>ESLint error!
    
    new->>new: return {<br/>  id: obj.id,<br/>  login: obj.login,<br/>  version: obj.version,<br/>  createdAt: obj.createdAt,<br/>  updatedAt: obj.updatedAt<br/>}
    note right of new: Jawnie mapujemy pola<br/>bez hasła - nie ma errora!
```

## Rezultat

| Plik | Błędy Przed | Błędy Po | Status |
|------|-------------|----------|--------|
| albums.service.ts | 1 | 0 | ✅ |
| favorites.service.ts | 1 | 0 | ✅ |
| users.service.ts | 4 | 0 | ✅ |
| **RAZEM** | **6** | **0** | **✅ FIXED** |
