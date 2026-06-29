# START HERE - Application de suivi

**Tu es Claude Code ou un nouveau contributeur ? Lis ceci EN PREMIER.**

---

## Lecture obligatoire (8 min)

1. **01-MEMORY-PINS.md** (2 min) - Decisions critiques a ne JAMAIS oublier
2. **02-ARCHITECTURE-OVERVIEW.md** (3 min) - Structure globale du systeme
3. **architecture/ECOSYSTEME-DONNEES.md** (3 min) - Codex, Reserve, Voute : les 4 concepts de gestion des donnees

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
- Consulte : `DATA-OWNERSHIP.md` (registre de propriete des cles de stockage)

### Je travaille sur le CODEX, l'IMPORT/EXPORT ou les DONNEES
- Lis : `architecture/ECOSYSTEME-DONNEES.md` (document fondateur — Codex, Reserve, Voute)
- Lis : `DATA-OWNERSHIP.md` (registre de propriete des cles de stockage)
- Code : `js/codex.js`, `js/import-export.js`, `js/travaux-stockage.js`, `js/db.js`

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

## Decisions architecturales (ADRs)

Les choix structurants du projet sont formalises dans des **Architecture Decision Records** (format Michael Nygard) :

**Index complet** : [`adr/README.md`](adr/README.md)

Consulter avant de remettre en cause une decision (framework, stockage, echelles pedagogiques, licences, mode hors-ligne, etc.). 12 ADRs au total, tous actes retroactivement le 14 mai 2026 sur la base de l'usage existant — produits dans le cadre du sous-audit 4.1 Documentation de l'audit annuel 2026.

---

## Etat actuel du projet

**Version** : voir `../version.json` (source unique de verite) — « Beta publique » est un libelle d'affichage.
**Objectif** : Suivi de l'apprentissage (depistage SOLO). Horizon et etat courants : `../ETAT-PROJET.md`.
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

**Derniere mise a jour** : 28 juin 2026 (etat volatil delegue a SESSION.md / version.json / ETAT-PROJET.md)
