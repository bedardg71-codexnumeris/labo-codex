# Decembre 2025 - Introduction du namespacing

## Contexte

Toutes les donnees calendrier etaient stockees dans des cles partagees.
Changer de trimestre ecrasait les donnees du trimestre precedent.
Impossible de gerer A2025 et H2026 simultanement.

## Probleme

Comment isoler les donnees de chaque trimestre pour eviter les melanges ?

## Alternatives considerees

### 1. Sous-objets par trimestre
- Format : `calendriers: { a2025: {...}, h2026: {...} }`
- Avantages : Structure claire
- Inconvenients : Modification majeure de tous les modules

### 2. Prefixage des cles (namespacing)
- Format : `a2025_calendrierComplet`, `h2026_calendrierComplet`
- Avantages : Changement minimal, retrocompatibilite possible
- Inconvenients : Necessite helper `cle()` partout

### 3. Bases de donnees separees
- Une base IndexedDB par trimestre
- Avantages : Isolation complete
- Inconvenients : Complexite technique, pas necessaire

## Decision

**Option 2 : Prefixage des cles (namespacing)**

Helper `cle(nomCle)` retourne la cle prefixee avec le trimestre actif.

```javascript
cle('calendrierComplet') -> 'h2026_calendrierComplet'
```

## Consequences

### Positives
- Isolation complete des donnees par trimestre
- Migration progressive possible
- Retrocompatibilite avec donnees existantes

### Negatives
- Necessite modifier tous les acces aux cles namespacees
- Risque d'oubli du helper `cle()`

### Mitigations
- Script de validation pour detecter les oublis
- Documentation claire des cles namespacees vs globales

## Statut

Implemente (Beta 95)

## References

- Commits : decembre 2025
- Documentation : docs/modules/trimestres.md
