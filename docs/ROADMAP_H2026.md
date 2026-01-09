# Roadmap H2026 - Vers Version 1.0

**Objectif** : Version 1.0 stable pour le colloque AQPC (3-5 juin 2026)
**Point de depart** : Beta 95 (1er janvier 2026)
**Duree** : 5 mois

---

## Etat actuel (9 janvier 2026)

### Accompli (novembre 2025 - janvier 2026)

| Date | Jalon | Statut |
|------|-------|--------|
| 19 nov 2025 | Presentation communaute PAN (387 membres) | ✅ |
| 25-26 nov | Migration IndexedDB (Beta 91.1) | ✅ |
| 27-30 nov | Primo Assistant (Beta 92) | ✅ |
| 3 dec | Systeme 100% universel (Beta 93) | ✅ |
| 10-12 dec | Snapshots hebdomadaires (Beta 94) | ✅ |
| 24-27 dec | Multi-trimestres + namespacing (Beta 95) | ✅ |
| 6-7 jan 2026 | Architecture modulaire Trimestre (Beta 95.2) | ✅ |
| 8-9 jan | Audit evaluation + UX modaux (Beta 95.3) | ✅ |

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
- [x] Architecture modulaire groupe-cours (6 accordeons)
- [x] Syntheses intelligentes sidebars
- [x] Import depuis trimestre precedent
- [x] Design System v7 (variables CSS)

---

## Calendrier H2026 (plan realiste)

> **Contexte** : 1 developpeur, pas de liberation, temps partiel.
> **Strategie** : Stabilite et usage personnel > nouvelles fonctionnalites.

### Feuille de route des versions

| Mois | Version | Objectif principal | Statut |
|------|---------|-------------------|--------|
| Janvier | **Beta 95** | Stabilisation + architecture modulaire | ✅ Complet |
| Fevrier | Beta 96 | Corrections usage reel + CSS modulaire | En attente |
| Mars | Beta 97 | Ameliorations UX | En attente |
| Avril | Beta 98 | Polish et stabilite | En attente |
| Mai | Beta 99 | Documentation + preparation | En attente |
| Juin | **Version 1.0** | Colloque AQPC | En attente |

---

### Janvier : Beta 95 - Stabilisation ✅ COMPLÉTÉ

**Objectif** : Architecture modulaire operationnelle AVANT les premieres evaluations

| Focus | Livrable | Statut |
|-------|----------|--------|
| Architecture modulaire groupe-cours | 6 accordeons (Cours, Enseignant, Groupe, Horaire, Groupe-cours, Trimestre) | ✅ |
| Verification coherence evaluations | Audit complet + 3 fixes critiques | ✅ |
| Configurer H2026 (cours, groupes, etudiants) | Donnees reelles importees | ✅ |
| Corriger bugs decouverts en usage | Beta 95.3 stable | ✅ |

**Point critique resolu** : Le module d'evaluation suit le MEME pattern d'assemblage :
- Production + Eleve + Grille + Echelle + Cartouche + Jetons → **Evaluation** (bibliotheque)
- Audit complet effectue le 9 janvier (16 548 lignes, 3 problemes resolus)

**Criteres de succes** :
- [x] Architecture modulaire validee dans Trimestre (6 accordeons, groupe-cours)
- [x] Pattern identique confirme dans module Evaluations (audit 9 janvier)
- [ ] 1+ groupe suivi avec l'application (en cours H2026)
- [x] Bugs bloquants corriges au fil de l'eau (Bruno + Olivier, 6 janvier)

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

## Backlog Beta 95 (janvier) - COMPLÉTÉ

### 7 janvier - Finaliser Trimestre modulaire ✅

- [x] Fonctions completes (CRUD toutes entites)
- [x] Boutons fonctionnels (sauvegarder, supprimer, dupliquer)
- [x] Interface terminee (tous les toggles → 6 accordeons)
- [x] Connexion avec vue calendaire
- [x] Connexion avec saisie des presences

### 8 janvier - Bibliotheques et Import/Export ✅

- [x] Valider import/export Productions
- [x] Valider import/export Grilles
- [x] Valider import/export Echelles
- [x] Valider import/export Cartouches
- [x] Valider import/export Pratiques

### 9 janvier - Beta 95.3 ✅

- [x] Auditer module evaluation (3/3 problemes critiques resolus)
- [x] Revoir le design de la page Trimestre (Design System v7)
- [x] Assurer compatibilite page Trimestre avec wizard Primo (detection config existante)
- [x] Creer un protocole de mise a jour des beta (docs/operations/ + scripts/)
- [x] Modal bibliotheque groupe-cours (vue liste, Activer, Supprimer)
- [x] Syntheses intelligentes dans sidebars (5 fonctions)
- [x] Import depuis trimestre precedent (Echelles, Grilles, Productions)
- [x] Nommage fichiers export standardise (genererNomFichierExport)
- [x] Section AIDE mise a jour (workflow Beta 95.3)

### Compatibilite et donnees (Beta 95.x) ✅

- [x] Assurer compatibilite donnees A2025 avec modifications au code
- [x] Tester l'application avec les donnees A2025 (validation complete)
- [x] Assurer la fonctionnalite des donnees demo (groupe 9999)

### Architecture modulaire - Verification coherence ✅

**Contexte** : L'architecture groupe-cours (Beta 95.2) utilise un pattern d'assemblage :
- Cours + Enseignant + Horaire + Groupe + Pratique → **Groupe-cours** (bibliotheque)

**Verification effectuee** (9 janvier 2026) : Audit complet du module evaluation
- Production + Eleve + Grille + Echelle + Cartouche + Jetons → **Evaluation** (bibliotheque)
- 16 548 lignes analysees, 3 problemes critiques identifies et resolus
- Namespacing evaluationsSauvegardees via cle() (34 occurrences, 7 fichiers)
- Integration groupeCoursId dans toutes les evaluations
- Validations references (etudiant/production/grille) avant sauvegarde

**Resultat** : Pattern d'assemblage coherent entre Trimestre et Evaluations

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

**Derniere mise a jour** : 9 janvier 2026
**Prochaine revue** : 1er fevrier 2026 (debut Beta 96)
