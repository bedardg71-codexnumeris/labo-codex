# Roadmap H2026 - Vers Version 1.0

**Objectif** : Version 1.0 stable pour le colloque AQPC (3-5 juin 2026)
**Point de depart** : Beta 95 (1er janvier 2026)
**Duree** : 5 mois

---

## Etat actuel (1er janvier 2026)

### Accompli (novembre-decembre 2025)

| Date | Jalon | Statut |
|------|-------|--------|
| 19 nov 2025 | Presentation communaute PAN (387 membres) | ✅ |
| 25-26 nov | Migration IndexedDB (Beta 91.1) | ✅ |
| 27-30 nov | Primo Assistant (Beta 92) | ✅ |
| 3 dec | Systeme 100% universel (Beta 93) | ✅ |
| 10-12 dec | Snapshots hebdomadaires (Beta 94) | ✅ |
| 24-27 dec | Multi-trimestres + namespacing (Beta 95) | ✅ |

### Resultats du sondage (6 cartographies analysees)

| Enseignant | Discipline | Pratique | Statut |
|------------|------------|----------|--------|
| Etienne L. | Administration | PAN-Standards | ✅ Supportee (`sommative`) |
| Helene C. | Philosophie | Hybride | ✅ Supportee (`sommative`) |
| Olivier L. | Geographie | Sommative | ✅ Supportee (`sommative`) |
| Isabelle M. | Biologie | PAN-Jugement global | 🟠 Config JSON possible |
| Michel B. | Mathematiques | PAN-Objectifs ponderes | 🟠 Priorite elevee |
| Jordan R. | Philosophie | Remplacement progression | 🔴 Nouveau a developper |

**Analyse complete** : `Autres pratiques de notation/ANALYSE_CARTOGRAPHIES.md`

### Realite des ressources

| Ressource | Plan initial | Realite |
|-----------|--------------|---------|
| Testeurs engages | 15-20 | **0** |
| Developpeurs contributeurs | 3-5 | **0** |
| Liberation (h/semaine) | 20-30 | **0** |
| Developpeur actif | 1 | **1 (Gregoire seul)** |

**Consequence** : Plan doit etre realiste pour 1 developpeur en temps partiel.

### Fonctionnalites operationnelles

- [x] Architecture hybride IndexedDB/localStorage
- [x] Systeme de pratiques modulaire (IPratique)
- [x] 3 pratiques : PAN-Maitrise, Sommative, PAN-Standards
- [x] Indices A-C-P avec historique
- [x] Snapshots longitudinaux
- [x] Multi-trimestres avec namespacing
- [x] Import/export avec Creative Commons
- [x] Primo Assistant (onboarding)
- [x] Groupe demo 9999

---

## Calendrier H2026 (plan realiste)

> **Contexte** : 1 developpeur, pas de liberation, temps partiel.
> **Strategie** : Stabilite et usage personnel > nouvelles fonctionnalites.

### Feuille de route des versions

| Mois | Version | Objectif principal |
|------|---------|-------------------|
| Janvier | **Beta 95** | Stabilisation + architecture modulaire |
| Fevrier | Beta 96 | Corrections usage reel |
| Mars | Beta 97 | Ameliorations UX |
| Avril | Beta 98 | Polish et stabilite |
| Mai | Beta 99 | Documentation + preparation |
| Juin | **Version 1.0** | Colloque AQPC |

---

### Janvier : Beta 95 - Stabilisation

**Objectif** : Architecture modulaire operationnelle AVANT les premieres evaluations

| Focus | Livrable |
|-------|----------|
| Architecture modulaire groupe-cours | Toggles separes (Cours, Enseignant, Horaire, Groupe-cours) |
| Verification coherence evaluations | Pattern assemblage identique partout |
| Configurer H2026 (cours, groupes, etudiants) | Donnees reelles importees |
| Corriger bugs decouverts en usage | Beta 95.x stable |

**Point critique** : Le module d'evaluation suit le MEME pattern d'assemblage :
- Production + Eleve + Grille + Echelle + Cartouche + Jetons → **Evaluation** (bibliotheque)
- Verifier que l'architecture est coherente dans tous les modules

**Criteres de succes** :
- [ ] Architecture modulaire validee dans Trimestre
- [ ] Pattern identique confirme dans module Evaluations
- [ ] 1+ groupe suivi avec l'application
- [ ] Bugs bloquants corriges au fil de l'eau

### Fevrier : Beta 96

**Objectif** : Corrections basees sur usage reel janvier

| Focus | Livrable |
|-------|----------|
| Architecture modulaire styles.css | CSS organise par modules |
| Correction bugs prioritaires | Application stable |
| Migration A2025 finalisee (si necessaire) | Donnees propres |

### Mars : Beta 97

**Objectif** : Ameliorations UX basees sur retours

| Focus | Livrable |
|-------|----------|
| Ameliorations UX mineures | Interface polie |
| Frictions identifiees resolues | Usage fluide |

### Avril : Beta 98

**Objectif** : Stabilite pour fin de session

**Criteres de succes** :
- [ ] 0 bugs critiques
- [ ] Application fiable pour fin de session

### Mai : Beta 99 - Documentation

**Objectif** : Documentation suffisante pour presentation

| Focus | Livrable |
|-------|----------|
| Guide rapide (10-15 pages) | PDF telecharger |
| 2-3 videos courtes | Installation + evaluation |
| Section Aide complete | Dans l'application |

**Criteres de succes** :
- [ ] Nouvel utilisateur peut demarrer seul
- [ ] FAQ couvre questions frequentes

### Juin : Version 1.0 - Colloque AQPC

**Date** : 3-5 juin 2026 (Drummondville)

**Livrables realistes** :
- [ ] Presentation recit de pratique (pas atelier)
- [ ] Version stable telecharger
- [ ] Lien documentation en ligne
- [ ] Contact pour questions (pas support formel)

---

## Backlog Beta 95 (janvier)

### 7 janvier - Finaliser Trimestre modulaire

- [ ] Fonctions completes (CRUD toutes entites)
- [ ] Boutons fonctionnels (sauvegarder, supprimer, dupliquer)
- [ ] Interface terminee (tous les toggles)
- [ ] Connexion avec vue calendaire
- [ ] Connexion avec saisie des presences

### 8 janvier - Bibliotheques et Import/Export

- [ ] Valider import/export Productions
- [ ] Valider import/export Grilles
- [ ] Valider import/export Echelles
- [ ] Valider import/export Cartouches
- [ ] Valider import/export Pratiques

### Plus tard (Beta 95.x)

- [ ] Compatibilite donnees A2025 avec nouveaux formats
- [ ] Verification donnees demo encore fonctionnelles
- [ ] Auditer module evaluation (meme pattern assemblage?)

### Architecture modulaire - Verification coherence

**Contexte** : L'architecture groupe-cours (Beta 95.2) utilise un pattern d'assemblage :
- Cours + Enseignant + Horaire + Pratique → **Groupe-cours** (bibliotheque)

**Verification requise** : Le module d'evaluation utilise-t-il le MEME pattern ?
- Production + Eleve + Grille + Echelle + Cartouche + Jetons → **Evaluation** (bibliotheque)

**Echeance** : Avant les premieres evaluations du trimestre (mi-janvier)

---

## Priorites de developpement

### P1 - Critiques (usage personnel)

1. **Bugs bloquants decouverts en usage**
   - Corriger au fil de l'eau
   - Documenter dans SESSION.md

2. **Migration A2025 si necessaire**
   - Resoudre etat hybride namespace
   - Valider integrite donnees

3. **Verification architecture modulaire** (NOUVEAU)
   - Confirmer pattern identique Trimestre ↔ Evaluations
   - Harmoniser avant usage reel

### P2 - Importantes (si temps disponible)

1. **Ameliorations UX**
   - Basees sur usage personnel
   - Frictions identifiees

2. **Documentation**
   - Section Aide complete
   - Guide rapide

### P3 - Reportees (post-AQPC ou V1.1)

1. **Nouvelles pratiques** (analyse cartographies)
   - PAN-Objectifs ponderes (Michel B.)
   - Remplacement progression (Jordan R.)
   - PAN-Jugement global (Isabelle M.)

2. **Fonctionnalites collaboratives**
   - Bibliotheque grilles partagees
   - Mode Cohorte

3. **Export avances**
   - PDF profil etudiant
   - Export CSV

---

## Ressources

### Realite

| Role | Prevu | Reel |
|------|-------|------|
| Developpeur | 1 | 1 (Gregoire, temps partiel) |
| Testeurs externes | 15-20 | 0 |
| Liberation | 20-30h/sem | 0 |

### Strategie d'adaptation

- **Testeur principal** : Gregoire lui-meme (usage reel H2026)
- **Validation** : Par usage quotidien, pas par equipe de test
- **Priorisation** : Ce qui bloque l'usage > nice to have
- **Scope** : Version stable pour presentation, pas V1.0 complete

---

## Risques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Bugs critiques en session | Usage bloque | Correction immediate prioritaire |
| Temps insuffisant | Fonctionnalites manquantes | Scope reduit, focus stabilite |
| Scope creep | Instabilite | Dire "non" ou "V1.1" |

---

## Definition de succes (revisee)

### Minimum viable pour AQPC juin 2026

- [ ] Application stable utilisee personnellement tout H2026
- [ ] 0 bugs critiques
- [ ] Documentation minimale (guide + aide integree)
- [ ] Presentation recit de pratique possible

### Nice to have

- [ ] 1-2 testeurs externes avant juin
- [ ] Guide video
- [ ] Site web dedie

### Reporte a V1.1 (automne 2026+)

- [ ] Nouvelles pratiques (objectifs ponderes, remplacement, jugement global)
- [ ] Equipe de testeurs structuree
- [ ] Fonctionnalites collaboratives

---

## References

- **Plan initial ambitieux** : `docs/archive/ROADMAP_V1_AQPC2026.md`
- **Analyse cartographies** : `Autres pratiques de notation/ANALYSE_CARTOGRAPHIES.md`
- **Architecture** : `docs/02-ARCHITECTURE-OVERVIEW.md`
- **Regles** : `docs/01-MEMORY-PINS.md`

---

**Derniere mise a jour** : 6 janvier 2026
**Prochaine revue** : 1er fevrier 2026 (fin janvier)
