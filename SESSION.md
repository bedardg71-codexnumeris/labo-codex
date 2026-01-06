# SESSION ACTIVE - BETA 95.1

**Date** : 6 janvier 2026
**Debut** : Retours de Bruno V. (premier testeur)
**Objectif** : Corriger les bugs signales et implementer les souhaits

---

## RETOURS DE BRUNO (5 janvier 2026)

**Testeur** : Bruno V. (Chimie organique, Cegep Andre-Laurendeau)
**Fichiers fournis** :
- `Retours des testeurs/bruno/bruno 5 janvier 2026.txt`
- `Retours des testeurs/bruno/PRATIQUE-COMPLETE-Bruno V.-2026-01-05.json`
- `Retours des testeurs/bruno/image.png` (capture erreur)

### Bugs signales et corriges

| # | Bug | Cause | Correction | Fichier |
|---|-----|-------|------------|---------|
| 1 | Erreur application pratique au cours | `obtenirConfigurationPratiqueParId()` ne cherchait pas dans `pratiquesConfigurables` | Ajout recherche dans les 3 sources | `pratiques-bibliotheque.js:663-677` |
| 2 | Grilles de criteres disparaissent | `dupliquerGrille()` n'ajoutait pas `dansBibliotheque: true` | Ajout du flag + refresh sidebar | `grilles.js:903-928` |
| 3 | Jour de semaine non reporte depuis Primo | Casse differente : Primo="lundi", Horaire="Lundi" | Harmonisation majuscules | `primo-questions.js`, `pack-demarrage.js` |

### Souhaits implementes

| # | Souhait | Correction | Fichiers |
|---|---------|------------|----------|
| 1 | Application automatique pratique depuis Primo MODULE 4 | Bug #1 corrigeait le problème ; message confirmation amélioré | `primo-modal.js:1318-1333` |
| 2 | Permettre heures non piles (8h55, 9h45...) | Changé `type: 'select'` → `type: 'time'` dans Primo et Trimestre | `primo-questions.js`, `horaire.js:645-648, 981-985` |

---

## ETAT MENTAL

**Ou j'en suis** :
Beta 95.1 - Système de notification automatique implementé

**Prochain pas** :
1. Attendre retour Bruno sur correction bug grilles
2. Planifier Import/Export v2 (voir docs/PLAN-IMPORT-EXPORT.md)

---

## RETOURS DE BRUNO (6 janvier 2026)

**Fichier** : `Retours des testeurs/bruno/Bruno 6 janvier 2026 a.txt`

| # | Point | Statut | Correction |
|---|-------|--------|------------|
| 1 | Application pratique au cours | ✅ OK | (deja corrige) |
| 2 | Grille non sauvegardée en bibliothèque | ✅ Corrigé | `sauvegarderGrilleComplete()` appelait la mauvaise fonction |

**Cause du bug #2** : `sauvegarderGrilleComplete()` appelait `sauvegarderNomGrille()` qui ne fonctionne que pour les grilles existantes (vérifie `grilleTemplateActuelle` qui est null pour une nouvelle grille).

**Correction** : Remplacé par appel direct à `await sauvegarderGrilleTemplate(false)` dans `grilles.js:3408-3411`

---

## SYSTÈME DE NOTIFICATION (6 janvier 2026) ✅ FAIT

**Objectif** : Notifier les testeurs des mises à jour sans les spammer par courriel.

**Mécanisme à deux niveaux** :

| Type | Déclencheur | Action au clic |
|------|-------------|----------------|
| Version majeure (95.2, 96...) | `VERSION_MAJEURE` différente | Modal Bienvenue |
| Correction de bug | `BUILD_ID` différent | Modal Bienvenue (avec encadré testeurs) |

**Configuration** (index.html, script inline) :
```javascript
const VERSION_MAJEURE = '95.1';      // Changer pour 95.2, 96, etc.
const BUILD_ID = '0106-1530';        // Format: MMJJ-HHMM (ex: 0106-1530 = 6 jan 15h30)
```

**Affichage entête** : `Beta 95.1 (b.0106-1530)`

**Clés localStorage** :
- `monitorage-version-vue` : dernière version majeure consultée
- `monitorage-build-vu` : dernier build consulté

**À chaque déploiement avec corrections** :
1. Mettre à jour `BUILD_ID` dans index.html
2. Ajouter la correction dans l'encadré "Pour les testeurs" du modal Bienvenue
3. Ajouter la correction dans Aide > Notes de version

---

## AMELIORATIONS FUTURES (backlog)

### Import de configurations (Beta 95.1)

**Etat actuel** : Option 3 implementee - seules les ressources pedagogiques (grilles, echelles, pratiques) sont importables depuis un collegue. Les donnees du cours (etudiants, presences, notes) sont bloquees pour eviter l'ecrasement.

**Ameliorations envisagees** :
- [ ] Mode "consultation" : importer les donnees d'un collegue dans un namespace separe (comme les donnees demo)
- [ ] Anonymisation automatique : remplacer les noms d'etudiants par des pseudonymes
- [ ] Trimestre virtuel "Import de [collegue]" pour explorer sans risque
- [ ] Fusion selective : permettre de copier des elements specifiques vers ses propres donnees

### Simplification boutons Import/Export (6 jan 2026)

**Probleme** : Trop de boutons dans les interfaces (productions, grilles, etc.) - confus pour l'utilisateur.

**Exemple Productions** : 5 boutons visibles (Exporter, Retirer, Ajouter a la bibliotheque, Exporter toutes, Importer)

**Ameliorations envisagees** :
- [ ] Regrouper les actions dans un menu deroulant ou une modale unique
- [ ] Harmoniser les boutons entre les differentes sections (grilles, echelles, productions, cartouches)
- [ ] Reduire la redondance : un seul point d'entree pour import/export par section

### Import selectif par element (6 jan 2026) ✅ FAIT

**Probleme** : Actuellement on importe par categorie complete (toutes les grilles, toutes les echelles, etc.)

**Solution implementee** (6 jan 2026) :
- [x] Checkbox par element individuel avec toggle par categorie
- [x] Donnees etudiantes (noms, presences, notes) grisees avec message de confidentialite
- [x] Detection heuristique des donnees demo a l'export

### Heures non piles dans Trimestre (6 jan 2026) ✅ FAIT

**Probleme** : Dans Trimestre > Horaire, les heures sont en format select avec heures piles seulement.

**Solution implementee** (6 jan 2026) :
- [x] Changé le select en input type="time" pour permettre 8h55, 9h45, etc.
- [x] Harmonisé avec Primo qui utilise déjà `type: 'time'`

### Comptage en periodes au lieu des heures (6 jan 2026) ✅ FAIT

**Probleme** : L'assiduite est comptee en heures, mais Bruno (et d'autres cegeps) comptent en periodes de 55 minutes.

**Solution implementee** (6 jan 2026) :
- [x] Config duree periode (50/55/60/75/90 min) dans Reglages > Trimestre > Horaire
- [x] Seances stockees en `nombrePeriodes` au lieu de `duree`
- [x] Saisie presences avec select de periodes (0 a X)
- [x] Preference affichage (periodes/heures/les-deux) dans Preferences
- [x] Migration auto des donnees existantes (migrations 6 et 7)

### Anonymisation et cryptage des donnees etudiantes (6 jan 2026)

**Probleme** : Les donnees etudiantes sont confidentielles et ne peuvent pas etre partagees.

**Ameliorations envisagees** :
- [ ] Anonymisation automatique : remplacer les noms par des pseudonymes pour partage
- [ ] Cryptage optionnel des exports pour securiser les sauvegardes
- [ ] Mode "consultation" : importer dans un namespace separe sans affecter ses propres donnees

---

## HISTORIQUE BETA 95 (archive)

**Date** : 4 janvier 2026
**Objectif** : Harmonisation Primo ↔ Formulaires Trimestre
**Archive** : `Archives/Beta-95-2026-01-04/`

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

**Etat actuel** (3 jan 2026) :
- Refonte "Construction de la note" : TERMINEE
- References orphelines : CORRIGEES (2 bugs)
- Audit CSS parties 10-16 : CONFIRME DEJA FAIT
- Code pret pour tests manuels

**Action immediate au retour** :
1. Tester manuellement la refonte Construction (creation pratique, 4 modes)
2. Tester le tutoriel interactif (nouvelle navigation)
3. Dette technique si temps disponible

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

## TACHES 3 JANVIER 2026

### Verification post-refonte
- [x] Verifier integrite du code Construction/Pratiques
- [x] Rechercher references orphelines a l'ancienne section
- [x] Verifier navigation Primo → Construction (guidage.js OK)

### Bugs trouves et corriges
- [x] `js/productions.js` : reference `#materiel-productions` → `#construction-productions`
- [x] `js/tutoriel-interactif.js` : redirection vers `Construction > Pratiques de notation`

### Audit CSS (parties 10-16)
- [x] Analyse comparative AUDIT_V5.md vs styles.css actuel
- **Resultat** : Toutes les parties 10-16 sont DEJA implementees
  - Partie 10 : Modals (overlay bleu rgba, blur, radius 12px, shadow-fort) ✅
  - Partie 11 : Alertes (radius-moyen, shadow-subtil) ✅
  - Partie 12 : Navigation (radius, hover states) ✅
  - Partie 13 : Formulaires (focus ring, border-radius 6px) ✅
  - Partie 14 : Tableaux (bleu-tres-pale hover, table-hover) ✅
  - Partie 15 : Barres progression (gradients, overlays) ✅
  - Partie 16 : Wizard V2 (etats active/completed) ✅

### Commit du jour
- `ef00ed9` fix(navigation): corriger references orphelines apres refonte Construction

---

## PLAN POUR LE 3 JANVIER 2026 (mis a jour)

### Priorite 1 : Tester la refonte Construction
- [ ] Tester creation nouvelle pratique STD avec Par-Objectifs
- [ ] Tester les 4 modes de calcul (Comptage, Moyenne, Seuils, Holistique)
- [ ] Tester sauvegarde/chargement des objectifs
- [ ] Tester bibliotheque pratiques (ajout, retrait, partage)

### Priorite 2 : Stabilisation
- [x] Verifier qu'il n'y a pas de references orphelines a l'ancienne section
- [x] Tester navigation Primo → Construction (guidage.js)
- [x] Corriger bugs eventuels (2 bugs corriges)

### Priorite 3 : Audit CSS (AUDIT_V5 parties 10-16)
- [x] ~~Partie 10 : Modals~~ DEJA FAIT
- [x] ~~Partie 11 : Alertes~~ DEJA FAIT
- [x] ~~Parties 12-16~~ DEJA FAIT
- [ ] Executer CHECKLIST_AUDIT.md (optionnel)

### Priorite 4 : Documentation
- [ ] Mettre a jour docs/modules/ si necessaire
- [ ] Creer pratique "Par-Objectifs (Michel)" dans la bibliotheque officielle

### Priorite 5 : Dette technique
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

**Derniere mise a jour** : 5 jan 2026
