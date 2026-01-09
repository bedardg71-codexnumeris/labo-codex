# SESSION ACTIVE - BETA 95.2

**Date** : 8 janvier 2026
**Version** : Beta 95.2 (build 0108-1432)
**Statut** : Application fonctionnelle pour H2026

---

## POUR REPRENDRE

> **Lire ce fichier puis demander : "Ou en sommes-nous ?"**

---

## ETAT ACTUEL

### Ce qui fonctionne
- Section Trimestre operationnelle (tous les accordeons)
- Creation et selection de groupe-cours
- Dropdown groupe-cours dans l'en-tete
- Design harmonise (Design System v7)
- Message de bienvenue et notes de version a jour

### Derniere tache completee (8 janvier)
- Import/export valide pour 5 modules (Productions, Grilles, Echelles, Cartouches, Pratiques)
- Correction persistance groupe-cours au rechargement (restauration complete)
- Correction persistance horaire selectionne (nouvelle cle horaireSelectionne)
- Bouton suppression horaire (pas de banque necessaire, change chaque trimestre)
- Simplification UI horaire (carte resume masquee quand formulaire visible)
- Bouton "Voir le calendrier" dans sidebar groupe-cours
- Connexion calendrier/presences avec groupe-cours actif (filtrage par coursId)
- **Primo dynamique** : Detection config existante (enseignant, cours, trimestre)
- **Correction bug Primo** : Groupe-cours maintenant cree automatiquement (dropdown fonctionnel)
- **5 dropdowns groupe-cours** : Trimestre + Cours + Groupe + Horaire + Enseignant
- **Multi-profils enseignants** : Dropdown selection, creation, suppression de profils
- **Alignement SST Primo/Trimestre** : Memes sources de donnees (listeCours, enseignants)
- **Fix discipline cours** : Sauvegarde et affichage correct par cours
- **Fix affichage cours** : Formulaire s'affiche quand cours selectionne dans dropdown

---

## PROCHAINE TACHE

**Backlog 8 janvier** : Valider import/export
- [x] Productions (export + import CC)
- [x] Grilles (export + import CC)
- [x] Echelles (export + import CC)
- [x] Cartouches (export + import CC)
- [x] Pratiques (export + import CC)

**Prochaine etape** : Optimiser utilisation de l'espace (limiter scrolling vertical)

---

## DECISIONS RECENTES

| Decision | Date | Raison |
|----------|------|--------|
| Modularisation code reportee a Beta 96 | 8 jan | Priorite = stabilite pour H2026 |
| Garder tout dans trimestre-v2.js | 8 jan | Structure donnees deja modulaire |
| Design System v7 | 8 jan | Harmonisation border-radius 12px/6px |

---

## BACKLOG BETA 95.x

### Prioritaire
- [x] Valider import/export (Productions, Grilles, Echelles, Cartouches, Pratiques)
- [x] Connexion calendrier avec groupe-cours
- [x] Saisie des presences avec groupe-cours actif

### Plus tard
- [ ] **Bug trimestre par defaut** : Au rechargement, tombe sur A2025 au lieu de H2026 (investigation)
- [x] **Incoherence profil enseignant** : Resolu - liste unifiee `enseignants` (migration auto de profilEnseignant)
- [ ] **Bouton supprimer groupe-cours** : Ajouter modal bibliotheque pour gerer/supprimer les groupes-cours
- [ ] **Affichage dropdown groupe-cours** : Afficher nom lisible au lieu de GC_timestamp quand donnees incompletes
- [ ] Optimiser utilisation de l'espace (limiter scrolling vertical)
- [ ] Revoir design page Trimestre (harmonisation complete)
- [ ] Compatibilite page Trimestre avec wizard Primo
- [ ] Creer protocole de mise a jour des beta
- [ ] Auditer module evaluation (meme pattern assemblage?)
- [ ] Filtres par discipline/cours avec listes controlees (dropdowns standardises)
- [ ] Import par trimestre filtrable par cours
- [ ] Verifier lecture champs discipline/pratique dans filtres bibliotheque Echelles
- [ ] UX modal Echelles : bouton Export avec sidebar, bouton Import avec section disponibles
- [ ] Harmoniser largeur modaux bibliotheque (Cartouches plus etroit que Echelles)
- [ ] Revoir nommage fichiers export : nom personnalise OU nomenclature standard (type-cours-discipline-date)
- [ ] **Audit design global** : Terminer l'audit du design system sur toutes les pages

### Compatibilite et donnees
- [ ] Assurer compatibilite donnees A2025 avec modifications au code
- [ ] Tester l'application avec les donnees A2025
- [ ] Assurer la fonctionnalite des donnees demo (groupe 9999)

---

## FICHIERS CLES MODIFIES (8 janvier)

| Fichier | Modification |
|---------|--------------|
| `js/trimestre-v2.js` | Consolidation entites-ui.js, fix init db-ready |
| `js/saisie-presences.js` | Filtrage presences par coursId |
| `js/primo-modal.js` | Correction bug groupe-cours (creerGroupeCoursDepuisPrimo) |
| `js/primo-questions.js` | Primo dynamique (detection config existante) |
| `styles.css` | Nouvelles classes .bloc-section (+160 lignes) |
| `index.html` | Message bienvenue, BUILD_ID, classes CSS |
| `DESIGN_SYSTEM.html` | Mise a jour v7, variables CSS |
| `Documentation/Changelogs/BETA_95_CHANGELOG.md` | NOUVEAU |
| `docs/ROADMAP_H2026.md` | Backlog mis a jour |

---

## RAPPELS CRITIQUES

### Architecture
- **Single Source of Truth** : Chaque donnee a UNE source unique
- **Namespacing** : Utiliser `cle('nomCle')` pour cles localStorage
- **Priorite testeurs** : Les retours utilisateurs passent AVANT le backlog

### Design System v7
- Conteneurs : `border-radius: 12px` ou `var(--radius-grand)`
- Petits elements : `border-radius: 6px` ou `var(--radius-moyen)`
- Box-shadow : 5 niveaux (subtil, normal, prononce, fort, inset)

### Zones protegees
- `js/config.js` - Ne pas modifier
- `js/navigation.js` - Ne pas modifier
- `noms_stables.json` - Ne pas modifier

---

## HISTORIQUE RECENT

### 8 janvier 2026
- Consolidation entites-ui.js → trimestre-v2.js
- Correction dropdown groupe-cours (namespacing)
- Harmonisation design section Trimestre
- Persistance groupe-cours et horaire au rechargement
- Bouton suppression horaire + simplification UI
- Bouton "Voir le calendrier" dans sidebar groupe-cours
- Connexion presences avec groupe-cours (filtrage par coursId dans saisie-presences.js)
- Primo dynamique : detection config existante (enseignant, cours, trimestre)
- Correction bug Primo : creerGroupeCoursDepuisPrimo() pour que le dropdown fonctionne
- **5 dropdowns groupe-cours** : Trimestre, Cours, Groupe, Horaire, Enseignant selectionnables
- **Multi-profils enseignants** : Liste unifiee `enseignants` avec dropdown, boutons nouveau/supprimer
- Migration automatique profilEnseignant → enseignants au chargement
- **Alignement SST Primo/Trimestre** : obtenirCoursExistants() utilise listeCours + filtrage trimestre
- **Fix discipline cours** : sauvegarderCoursV2() + remplirFormCoursV2() corrigés
- **Fix affichage cours** : chargerDropdownCoursV2() appelle changerCoursSelectionneV2()

### 6-7 janvier 2026
- Corrections bugs testeurs (Bruno, Olivier)
- Systeme de notification automatique
- Architecture modulaire Trimestre

### 24-27 decembre 2025
- Multi-trimestres avec namespacing
- Archivage automatique trimestres termines

---

## CONTACTS TESTEURS

| Testeur | Discipline | Derniers retours |
|---------|------------|------------------|
| Bruno V. | Chimie organique | 6 jan (bugs corriges) |
| Olivier L. | Geographie | 6 jan (bugs corriges) |

---

## LIENS UTILES

- `docs/00-START-HERE.md` - Point d'entree documentation
- `docs/ROADMAP_H2026.md` - Feuille de route et backlog
- `Design system - Modules/AUDIT_V5.md` - Reference design
- `Documentation/Changelogs/BETA_95_CHANGELOG.md` - Notes de version

---

**Derniere mise a jour** : 8 janvier 2026, 18:30 (Toronto)
