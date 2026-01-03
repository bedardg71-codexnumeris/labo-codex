# SESSION ACTIVE

**Date** : 2 janvier 2026
**Debut** : ~05:00
**Objectif initial** : Appliquer AUDIT_COMPLET_V4.md (Design System v7)

---

## ETAT MENTAL

**Ou j'en suis** :
Nettoyage documentation + corrections bugs coursId
- CLAUDE.md leger cree (60 lignes vs 2000+)
- Pointe vers docs/00-START-HERE.md
- Historique preserve dans archive/

**Prochain pas prevu** :
1. Tester le selecteur de pratique par cours
2. Valider isolation donnees entre trimestres

---

## TACHES DESIGN SYSTEM

### Audit AUDIT_COMPLET_V4.md (9 parties)
- [x] Variables CSS dans :root (pratiques, gradients, shadows, radius)
- [x] 4 Pratiques SOM/STD/SPE/DEN (badges + bulles)
- [x] Badges Tetris (7 familles harmonisees)
- [x] Badges materiel pedagogique
- [x] Gradients + box-shadow en-tete
- [x] Border-radius 12px conteneurs
- [x] Sidebars / Bibliotheques fond blanc
- [x] Boutons padding unifie
- [x] Migration pan -> std (CSS + JS)

### Audit AUDIT_V5.md (7 nouvelles parties)
- [x] Partie 10 : Modals (overlay bleu + blur)
- [x] Partie 11 : Alertes (border-radius 6px + shadow)
- [x] Partie 12-16 : Navigation, Formulaires, Tableaux, Barres, Wizard
- [x] 51 occurrences border-radius 8px -> var(--radius-grand)
- [x] Verification sidebars et bibliotheques

### Documentation
- [x] Archiver CLAUDE.md -> Archives/CLAUDE-md-archive-2025-12-29.md
- [x] Confirmer docs/ comme nouvelle reference
- [x] Creer AUDIT_V5.md (16 parties exhaustives)
- [x] Comparer et valider les documents d'audit

---

## TACHES CORRECTIONS (2 jan 2026 - apres-midi)

### Bugs corriges
- [x] Boutons Modifier/Supprimer empiles -> CSS .td-center-200 ajoute
- [x] Namespacing: etudiants A2025 apparaissaient dans H2026
  - groupe.js: obtenirTousLesEtudiants(), sauvegarderTousLesEtudiants()
  - cours.js: suppression cascade avec cles namespacees
  - migrations.js: 3 migrations corrigees pour namespace
  - primo-modal.js, import-export.js: productions avec namespace

### Nouvelles fonctionnalites
- [x] Selecteur pratique par cours (formulaire V2)
  - index.html: ajout select v2-pratiqueIdCours (lignes 8291-8306)
  - trimestre-v2.js: lecture/ecriture pratiqueId dans sauvegarderCoursV2()
  - trimestre-v2.js: pre-selection dans remplirFormCoursV2()

### Documentation
- [x] CLAUDE.md leger cree (60 lignes, pointe vers docs/)
- [x] SESSION.md mis a jour

---

## COMMITS DE LA SESSION

1. `ef81e7d` - style(design-system): harmonisation complete selon AUDIT_COMPLET_V4
   - 6 fichiers modifies (+340 / -210 lignes)
   - index.html, styles.css, js/main.js, js/etudiants.js, js/profil-etudiant.js, js/tableau-bord-apercu.js

2. `6f9285a` - chore: archiver CLAUDE.md (remplace par docs/)

3. `1f887f9` - docs(session): mise a jour SESSION.md

4. `a4abc66` - style(design-system): application AUDIT_V5 - harmonisation UI complete
   - 1 fichier modifie (+54 / -51 lignes)
   - Modal overlay, alertes, 51x border-radius 8px -> 12px

5. `7a702ba` - docs(design-system): ajout documentation complete Design System v7
   - 31 fichiers (+14885 lignes)
   - AUDIT_V5.md, AUDIT_BADGES.md, SPECS_TETRIS.md, 16 modules HTML demo

6. `3e98e7c` - style(fond-page): appliquer couleurs saturees selon 01a-palette-couleurs
   - Fond de page plus sature pour meilleur contraste
   - Mode Normal: #d4e6f5 -> #e8f2fd
   - Mode Assiste: #d4ebe5 -> #e8f5f2
   - Mode Anonymisation: #e0e8e8 -> #edf2f2

7. `4aff825` - style(variables): declarer toutes les variables CSS manquantes
   - Gradients: --gradient-entete, --gradient-fond-page
   - Ombres 5 niveaux: --shadow-subtil/normal/prononce/fort/inset
   - Border-radius 4 niveaux: --radius-petit/moyen/grand/pill
   - Tailles Tetris: --padding-compact/moyen/large, --font-compact/moyen

8. `1fb86d6` - style(typographie+boutons): appliquer 01b et 02a
   - Typographie H1-H4 globale (2rem/1.5rem/1.2rem/1rem)
   - .btn-large (12px 24px)
   - Regles auto-compact: .carte .btn, [id*="liste"] .btn, etc.

9. `5f73635` - style(sidebar): fond bleu pale au lieu de blanc (03b)
   - .sidebar-navigation et .sidebar-cartouches: var(--bleu-pale)

10. `d96aef1` - fix(layout): corriger marges inegales et fond non visible
   - Body padding: 20px → 30px pour cadre bleu plus visible
   - scrollbar-gutter: stable sur html pour symetrie

11. `e91b4ce` - fix(layout+modes): conteneur adaptatif et en-tete sensible au mode
   - Conteneur: max-width 1400px → 95% (adaptatif)
   - Gradient en-tete: hex fixes → var(--bleu-principal/fonce)

12. `8c033d4` - fix(layout+modes): correction styles embarques et gradient en-tete
   - Suppression width:100% et margin:0 embarques qui overridaient CSS externe
   - .entete utilise directement les variables (pas via --gradient-entete)
   - Cache buster mis a jour: v=2026010202

---

## DOCUMENTS DE REFERENCE

**Nouvelle structure** (remplace CLAUDE.md) :
- `docs/00-START-HERE.md` - Point d'entree
- `docs/01-MEMORY-PINS.md` - 10 regles immuables
- `docs/02-ARCHITECTURE-OVERVIEW.md` - Vision globale
- `docs/modules/*.md` - Documentation technique

**Design System** :
- `Design system - Modules/AUDIT_V5.md` - Reference principale (16 parties)
- `Design system - Modules/AUDIT_BADGES.md` - Detail 13 familles badges

**Hierarchie de verite** :
1. SESSION.md (ce fichier)
2. MEMORY-PINS.md
3. AUDIT_V5.md (pour le design)
4. legacy/*.md
5. modules/*.md

---

## DEVIATIONS

### Deviation 1 : Guide groupe-cours (2 jan ~10:30)

**Contexte** : Le travail sur les badges de pratique (SOM/STD/SPE/DEN) a conduit
a la configuration des cours, puis au guide groupe-cours.

**Travail non commite** :
- `index.html` : Encadre "Guide groupe-cours" avec 4 indicateurs visuels
- `js/trimestre-v2.js` : Fonction `mettreAJourGuideGroupeCours()`
- `index.html` : Notes de version mises a jour

**Etat** : En cours - a terminer avant retour a la tache principale

---

## PLAN DE MATCH (decision 2 jan ~11:00)

### Phase 1 : Terminer guide groupe-cours (30 min)
- [ ] Tester les 4 indicateurs (Cours/Groupe/Horaire/Etudiants)
- [ ] Ajuster si necessaire
- [ ] Commiter avec message clair

### Phase 2 : Nettoyage documentation
- [ ] Identifier documents non commites importants
- [ ] Identifier documents obsoletes a supprimer/archiver
- [ ] Commiter le nettoyage

### Phase 3 : Retour a AUDIT_V5
- [ ] Verifier quelles parties (1-16) sont reellement appliquees au code
- [ ] Appliquer les parties manquantes
- [ ] Executer CHECKLIST_AUDIT.md (9 audits specifiques)

### Phase 4 : Modularisation styles.css (anticipee)
**Probleme identifie** : styles.css est devenu trop gros pour etre gere convenablement
(comme index.html et design_system.html avant leur modularisation).
**A faire** : Planifier la separation en fichiers modulaires.

---

## DETTE TECHNIQUE (a traiter plus tard)

### 1. ~~Migration namespacing Primo~~ ✅ RESOLU
**Identifie** : 2 jan 2026
**Resolu** : 2 jan 2026 (commit 6de8927)

**Correction appliquee** :
- Ordre inverse : creerCoursInitial() AVANT creerSeancesHoraire()
- creerSeancesHoraire() lit infoCours.id
- Sauvegarde dans `seancesHoraire_{coursId}` (plus de cle globale)

**Note** : `horaireHebdomadaire` reste utilise comme stockage temporaire
pendant la configuration Primo (converti a la fin). C'est acceptable.

### 2. Ajouter option suppression cours
**Identifie** : 2 jan 2026
**Probleme** : Impossible de supprimer un cours depuis l'interface.
Ni dans le formulaire de modification, ni dans la bibliotheque de cours.

**Solution proposee** :
- Ajouter bouton "Supprimer" dans le formulaire de modification cours
- Ajouter action "Supprimer" dans la bibliotheque de cours
- Confirmer avant suppression (modal)
- Gerer la suppression des donnees liees (horaire, etudiants?)

**Priorite** : Moyenne (contournable via console)

### 3. Checkbox activer/desactiver systeme de jetons
**Identifie** : 2 jan 2026
**Probleme** : Dans Primo, on peut choisir de ne pas utiliser les jetons.
Mais dans Trimestre, le systeme de jetons semble obligatoire (pas de checkbox globale).

**Incohérence** : Primo permet "sans jetons", Trimestre impose les jetons.

**Solution proposee** :
- Ajouter checkbox "Activer le systeme de jetons" en haut de la section
- Si decoche : masquer/desactiver les 3 sous-sections (delai, reprise, ciblee)
- Synchroniser avec le choix fait dans Primo

**Priorite** : Haute (incoherence UX)

---

## OU REPRENDRE (si session s'arrete maintenant)

**Etat actuel** (fin 2 jan 2026, ~21:00) :
- Refonte "Construction de la note" : TERMINEE
- Sous-section "Pratiques de notation" : TERMINEE (sidebar + modal + formulaire)
- Variante Par-Objectifs (4 modes) : TERMINEE et integree au gabarit STD
- Ancienne section Pratique de notation : SUPPRIMEE
- Reorganisation Preferences : TERMINEE

**Action immediate au retour** :
1. Tester la refonte Construction (creation pratique, 4 modes, bibliotheque)
2. Verifier navigation Primo → Construction
3. Corriger bugs eventuels

---

## TACHES REFONTE CONSTRUCTION (2 jan 2026 - apres-midi/soir)

### Refonte section "Construction de la note" (ex-Materiel)
- [x] Renommer section "Materiel" → "Construction de la note" (config.js, navigation.js)
- [x] Ajouter sous-section "Pratiques de notation" avec pattern sidebar + modal bibliotheque
- [x] Creer `js/pratiques-materiel.js` (nouveau module ~1900 lignes)
- [x] Ajouter carte statistique "Pratiques de notation" dans l'apercu

### Variante Par-Objectifs (STD)
- [x] Integrer config Par-Objectifs dans le gabarit STD (index.html ~140 lignes)
- [x] 4 modes de calcul : Comptage (Bruno), Moyenne ponderee (Michel), Seuils critiques (Xavier), Holistique (Isabelle)
- [x] Liste d'objectifs dynamique (ajout/suppression)
- [x] Grille de conversion pour mode Comptage
- [x] Chargement/sauvegarde complet des donnees par-objectifs

### Migration Systeme de jetons
- [x] Deplacer accordeon "Systeme de jetons" des Reglages vers gabarit pratiques
- [x] Ajouter chargement/sauvegarde dans pratiques-materiel.js

### Reorganisation Preferences
- [x] Deplacer "Seuils de detection avances" vers "Configuration du depistage"
- [x] Separer boutons restauration (interpretation vs detection)
- [x] Deplacer "Indicateurs visuels des seuils" vers "Seuils d'interpretation"
- [x] Deplacer "Detection des patterns" vers "Configuration du depistage"
- [x] Renommer "Depistage A-C-P" → "Micro donnees ACP"
- [x] Deplacer "Mode comparatif SOM/PAN" vers "Affichage des ressources"

### Dropdown pratiques Trimestre
- [x] Charger dynamiquement depuis `pratiquesConfigurables`
- [x] Meme filtre que sidebar (`dansBibliotheque !== false`)

### Suppression ancienne section Pratique de notation
- [x] Supprimer HTML reglages-pratique-notation (~500 lignes)
- [x] Retirer de config.js (3 → 2 onglets Reglages)
- [x] Retirer case de navigation.js
- [x] Mettre a jour guidage.js, cours.js, primo-validation-champs.js

### Corrections bugs
- [x] Fix reactivation pratique retiree (dansBibliotheque: false → true)
- [x] Fix timing affichage mode par-objectifs (async/await)

### Commits (apres-midi/soir)
- `2ce6fb4` feat(construction): ajout carte statistique Pratiques de notation
- `ece909e` refactor(preferences): reorganisation des options Preferences
- `7d22321` refactor(preferences): reorganisation Configuration du depistage
- `b7430b7` feat(construction): integration variante Par-Objectifs dans gabarit STD
- `ce1ae9a` fix(pratiques): correction reactivation pratique retiree
- `65c33bf` fix(pratiques): correction timing affichage mode par-objectifs
- `4837182` refactor(reglages): suppression section Pratique de notation

---

## PLAN POUR LE 3 JANVIER 2026

### Priorite 1 : Tester la refonte Construction
- [ ] Tester creation nouvelle pratique STD avec Par-Objectifs
- [ ] Tester les 4 modes de calcul (Comptage, Moyenne, Seuils, Holistique)
- [ ] Tester sauvegarde/chargement des objectifs
- [ ] Tester bibliotheque pratiques (ajout, retrait, partage)

### Priorite 2 : Stabilisation
- [ ] Verifier qu'il n'y a pas de references orphelines a l'ancienne section
- [ ] Tester navigation Primo → Construction (guidage.js)
- [ ] Corriger bugs eventuels

### Priorite 3 : Documentation
- [ ] Mettre a jour docs/modules/ si necessaire
- [ ] Creer pratique "Par-Objectifs (Michel)" dans la bibliotheque officielle

### Priorite 4 : Dette technique
- [ ] Ajouter option suppression cours (formulaire + bibliotheque)
- [ ] Verifier checkbox jetons dans Reglages vs Primo

---

## NOTES POUR CLAUDE CODE

**Contexte actuel** :
- CLAUDE.md leger cree (60 lignes) -> pointe vers docs/
- docs/00-START-HERE.md est le point d'entree principal
- Design System v7 avec codes 3 lettres (SOM/STD/SPE/DEN)
- Namespacing: utiliser window.cle('nomCle') pour cles localStorage

**Rappels critiques** :
- Variable --pan-bleu supprimee (utiliser --std-bleu)
- Classes CSS -pan renommees en -std
- border-radius: 12px pour conteneurs (var(--radius-grand))
- border-radius: 6px pour petits elements (var(--radius-moyen))
- Ne jamais utiliser "complet" ou "final" dans les noms de fichiers
- Toujours lire/ecrire avec namespace: cle('groupeEtudiants') -> h2026_groupeEtudiants

---

**Derniere mise a jour** : 2 jan 2026, ~21:00
