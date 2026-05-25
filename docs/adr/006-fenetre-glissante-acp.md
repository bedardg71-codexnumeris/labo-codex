# ADR-006 : Fenêtre glissante de 3 artefacts pour A-C-P

**Statut** : Acté rétroactivement
**Date de décision originale** : automne 2025 (formalisation : 14 mai 2026)
**Auteur** : Grégoire Bédard

---

## Contexte

Les trois indices Assiduité-Complétion-Performance (A-C-P) sont conçus pour fournir un signal **récent** sur l'engagement et la performance d'un étudiant. Plusieurs choix de fenêtre étaient possibles :
- **Depuis le début du trimestre** : agrégation cumulative qui dilue les évolutions récentes.
- **Depuis la dernière intervention RàI** : adaptatif mais introduit une dépendance à un événement externe.
- **Fenêtre glissante fixe** : taille à choisir.

L'indice **P** en particulier sert au diagnostic d'un blocage émergent vs persistant : il doit être sensible à un changement de trajectoire sans être bruité par les fluctuations d'un seul devoir.

Une fenêtre de **3 artefacts** a été choisie comme compromis entre signal et bruit, validé par 7 ans de pratique d'enseignement explicite.

---

## Décision

**L'indice de performance P (et par extension les indicateurs dérivés comme l'IPB — Indice Pondéré de Blocage) est calculé sur une fenêtre glissante des 3 dernières productions évaluées non-portfolio.**

- **Type d'artefact retenu** : toute production ayant donné lieu à une évaluation sauvegardée, à l'exclusion explicite des productions de type `portfolio` (agrégations différées).
- **Ordre** : par `dateEvaluation` décroissante.
- **Si moins de 3 productions** : l'indice est calculé sur ce qui est disponible, avec un signal de cadrage (fenêtre incomplète).
- **Pondération** : selon la pratique de notation active (cf. ADR-001 et `docs/decisions/2025-11-systeme-pratiques.md`).

L'indice d'assiduité (A) suit une logique distincte (mesure d'engagement par présences sur des périodes offertes), validée séparément dans l'audit 1.2.

L'indice de complétion (C) est calculé sur l'ensemble des productions attendues, pas sur la fenêtre glissante (C mesure la mobilisation cumulée, pas la trajectoire récente).

---

## Conséquences

### Positives

- **Signal sensible aux changements récents** : un étudiant qui chute sur les 3 dernières productions est immédiatement détecté, même s'il avait bien performé en début de trimestre.
- **Stabilité contre le bruit** : trois mesures réduisent l'impact d'un mauvais devoir isolé.
- **Compatibilité avec le diagnostic croisé** : la fenêtre de 3 alimente la matrice de patterns (blocage émergent, plateau, persistance, etc.).
- **Cohérence inter-disciplines** : la même règle de fenêtre s'applique partout, indépendamment du nombre total de productions par cours.

### Négatives

- **Effet de seuil au passage 2 → 3 productions** : la fiabilité du diagnostic change qualitativement. Mitigation : afficher un cadrage « fenêtre incomplète » tant que < 3.
- **Étudiants avec moins de 3 productions** restent sans signal P fiable. À surveiller en début de trimestre.
- **Non-portfolio en dur** : l'exclusion des portfolios est codée comme règle générale. Si une discipline considère le portfolio comme un artefact comme un autre, il faudra paramétrer cette exclusion (cf. backlog).

### Neutres

- **Choix de 3 vs 5 vs 4** : aucune validation statistique formelle, c'est un jugement pédagogique. Pourrait être réévalué par recherche-action.

---

## Alternatives considérées

### Option A : Fenêtre depuis le début du trimestre

**Écartée** parce qu'elle dilue les changements récents et masque les blocages émergents.

### Option B : Fenêtre depuis la dernière intervention RàI

Adaptative et pertinente sur le plan pédagogique. **Écartée** parce qu'elle introduit une dépendance à un événement non garanti — un étudiant sans intervention reçoit une fenêtre cumulative, ce qui crée une asymétrie de traitement entre étudiants.

### Option C : Fenêtre de 5 artefacts

**Écartée** parce qu'elle lisse trop les signaux et retarde la détection des blocages émergents.

### Option D : Moyenne mobile pondérée (decay exponentiel)

Aurait été techniquement défendable. **Écartée** parce qu'elle aurait introduit un paramètre supplémentaire (le facteur de decay) sans gain de lisibilité pédagogique pour l'enseignant.

---

## Références

- `SKILL_RaI.md` — diagnostic croisé, patterns d'apprentissage.
- `SKILL_labo_codex.md` — architecture, indices A-C-P.
- Audit annuel 2026, sous-audit 1.2 Validation numérique — confirmation de la formule IPB.
- Pratique de notation modulaire (PAN-Standards, PAN-Spécifications) — implémentation de la pondération par pratique.

---

## Notes de révision

À réviser si :
- Une recherche-action en cours produit des données empiriques sur la taille optimale de fenêtre.
- Un enseignant tiers utilisateur d'une autre pratique de notation a besoin d'une fenêtre paramétrable.

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
