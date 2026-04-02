# START HERE - Application de suivi

**Tu es Claude Code ou un nouveau contributeur ? Lis ceci EN PREMIER.**

---

## Lecture obligatoire (5 min)

1. **01-MEMORY-PINS.md** (2 min) - Decisions critiques a ne JAMAIS oublier
2. **02-ARCHITECTURE-OVERVIEW.md** (3 min) - Structure globale du systeme

---

## Identifier ton contexte de travail

Avant de commencer, identifie ce sur quoi tu travailles :

### Je travaille sur le CALENDRIER/TRIMESTRE
- Lis : `modules/trimestres.md`
- ALERTE : `legacy/A2025-migration-incomplete.md`

### Je travaille sur les INDICES (A-C-P)
- Lis : `modules/indices-cp.md`
- Note : Ancien nom = portfolio.js (source de confusion)

### Je travaille sur les PRATIQUES DE NOTATION
- Lis : `modules/pratiques.md`
- Reference : `decisions/2025-11-systeme-pratiques.md`

### Je fais une MIGRATION ou REFACTORING
- Lis : `operations/migration-checklist.md`
- Execute : `operations/validation-architecture.js`

### Je travaille sur ETUDIANTS/GROUPES
- Lis : `modules/etudiants-groupes.md`

### Je travaille sur EVALUATIONS/PRODUCTIONS
- Lis : `modules/evaluations-productions.md`

---

## Pattern architectural principal

L'application utilise le pattern **"Bibliotheque + Assemblage"** :

- **Bibliotheque** : Entites reutilisables (NON namespacees, partagees)
- **Assemblage** : Combinaison d'entites pour un contexte specifique

Ce pattern est utilise dans :
1. **Construction de la note** : Pratiques → Configuration active
2. **Gestion du Trimestre** : Cours/Enseignants/Horaires → Groupe-cours

**Documentation complete** : `architecture/pattern-bibliotheque-assemblage.md`

---

## Etat actuel du projet

**Version** : Beta 99.02 (Build 0402-1655)
**Objectif** : Plan de consolidation avril 2026 — TOUS LES TIERS TERMINES (0→5.5) + Audit CSS 5.2
**Priorite** : **Securite + Proprete > Nouvelles fonctionnalites**

**Derniere session** : Voir `../SESSION.md` (racine du projet)

---

## Checkpoints obligatoires

ARRETE et demande validation a Gregoire AVANT de :

- Supprimer ou renommer une cle localStorage
- Modifier une structure de donnees existante
- Executer une migration de donnees
- Modifier plus de 3 fichiers simultanement
- Toucher aux modules proteges (config.js, navigation.js)

### Conformite visuelle (Design System)

**Tout element visuel nouveau ou modifie** doit etre conforme a la reference :
`design-system.html` (racine du projet)

- Utiliser les variables CSS de `styles.css` (jamais de couleurs en dur)
- Verifier le rendu en mode sombre ET en mode clair
- Respecter la hierarchie des surfaces, ombres et radius

---

## Protocole en cas de bug

```
Bug survient
    |
1. Noter dans SESSION.md (section DEVIATIONS)
2. Investiguer la cause
3. Appliquer le fix
4. Completer l'entree dans SESSION.md
5. Retourner au plan initial
```

**Ne JAMAIS laisser un bug consommer tout le contexte** et faire oublier le plan de travail.

---

## Hierarchie de verite

En cas de conflit d'information entre documents :

1. **SESSION.md** (etat actuel de la session en cours)
2. **MEMORY-PINS.md** (decisions immuables)
3. **legacy/*.md** (problemes connus specifiques)
4. **modules/*.md** (documentation technique)
5. **ARCHITECTURE-OVERVIEW.md** (vision globale)

**Gregoire a toujours raison sur** :
- L'architecture pedagogique
- Les decisions historiques
- L'etat reel des donnees (A2025, H2026, etc.)

---

## En cas de doute

**Pose la question plutot que de supposer.**

Les LLMs ont tendance a confabuler (inventer des souvenirs plausibles).
Gregoire a la memoire contextuelle reelle du projet.

---

**Derniere mise a jour** : 16 fevrier 2026
