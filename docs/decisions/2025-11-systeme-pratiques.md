# Novembre 2025 - Systeme de pratiques modulaires

## Contexte

L'application calculait les indices P avec une logique PAN-Maitrise codee en dur.
Cela empechait d'autres enseignants d'utiliser leurs propres pratiques de notation.

## Probleme

Comment supporter plusieurs pratiques de notation sans dupliquer le code de calcul ?

## Alternatives considerees

### 1. Conditions if/else partout
- Avantages : Simple a implementer
- Inconvenients : Code spaguetti, difficile a maintenir, chaque nouvelle pratique = modifications partout

### 2. Configuration par parametres
- Avantages : Flexible
- Inconvenients : Limites aux variations prevues, pas vraiment extensible

### 3. Architecture modulaire avec interface
- Avantages : Extensible, separation des responsabilites, chaque pratique isolee
- Inconvenients : Plus complexe initialement

## Decision

**Option 3 : Architecture modulaire avec interface IPratique**

Chaque pratique est un module independant qui implemente une interface commune.
Le module principal (indices-cp.js) delegue les calculs a la pratique active.

## Consequences

### Positives
- Nouvelles pratiques ajoutables sans modifier le coeur
- Chaque pratique peut avoir sa logique specifique
- Tests isoles par pratique
- Respect des pratiques pedagogiques de chaque enseignant

### Negatives
- Complexite initiale plus elevee
- Necessite de documenter l'interface

### Mitigations
- Documentation complete (ARCHITECTURE_PRATIQUES.md, GUIDE_AJOUT_PRATIQUE.md)
- Tests automatises pour valider les implementations

## Statut

Implemente (Beta 91)

## References

- Commits : Phase 2-6 novembre 2025
- Documentation : ARCHITECTURE_PRATIQUES.md
