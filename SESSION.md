# SESSION ACTIVE - BETA 95.7

**Date** : 21 janvier 2026
**Version** : Beta 95.7 (build 0121-1005)
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
- **Dropdown "Cours (tous groupes)"** : Voir tous les groupes fusionnes
- Design harmonise (Design System v7)
- Message de bienvenue et notes de version a jour
- Variables CSS adoptees massivement (box-shadow 43%, border-radius 95%)
- **Badge nb personnes** : S'ajuste au groupe-cours selectionne
- **Vue calendaire** : Affiche correctement l'horaire du groupe-cours actif
- **Pratiques de notation** : Sauvegarde fiable via wizard et mode expert
- **Dropdown note maximale** : Peuplé dynamiquement selon l'échelle de performance

### Derniere tache completee (21 janvier)
- **EXPORT PDF GRILLES DESCRIPTIVES (#30)** : Améliorations mise en page
  - **Nouvelle disposition** :
    - En-tête droite : Code cours, Nom du cours, Trimestre (empilés verticalement)
    - Pied de page gauche : Nom complet de l'enseignant uniquement
    - Pied de page droite : Licence CC BY-NC-SA 4.0
  - **Corrections SST** (Single Source of Truth) :
    - `obtenirInfosCoursPDF()` : Lecture depuis `listeCours`/`cours` via `coursId` (comme trimestre-v2.js:4117-4120)
    - `obtenirNomEnseignantPDF()` : Gestion correcte `enseignantId === 'profil'` (comme trimestre-v2.js:4127-4140)
  - **Options simplifiées** :
    - Retiré : Option "Cours" du pied de page (maintenant dans l'en-tête)
    - Retiré : Taille police (fixée à "petit")
    - Ajouté : Checkbox "Afficher le trimestre"
  - **Marges réduites** : 0.5 inch au lieu de 1 inch
  - **Bug en cours** : Les infos cours/enseignant ne s'affichent pas encore dans le PDF
    - Prochaine étape : Ajouter logs de débogage pour identifier la source des données
  - **Fichiers modifiés** : `js/export-pdf.js`, `index.html`, `styles.css`

### Tache precedente (20 janvier)

- **CLARIFIER ARTEFACTS MEILLEURS VS OBLIGATOIRES (#3)** : Workflow amélioré
  - Primo : Nouvelle question "Combien de productions Obligatoires ?"
  - Primo : Message validation affiche total (ex: "4 meilleures + 2 obligatoires = 6 productions")
  - Wizard : Transfert config catégories Primo → pratique.configuration
  - Expert : Résumé visuel "📊 Construction de la note" avec calcul dynamique
  - **Fichiers modifiés** : `js/primo-questions.js`, `js/wizard-pratique-v2.js`, `js/pratiques-materiel.js`, `index.html`

- **DROPDOWN NOTE MAXIMALE (Beta 95.7)** : Reprise ciblée avec échelle dynamique
  - Champ texte remplacé par dropdown dans Construction > Pratiques et Réglages
  - Peuplé automatiquement avec les niveaux de l'échelle sélectionnée
  - **Fichiers modifiés** : `index.html`, `js/pratiques-materiel.js`, `js/pratiques.js`

- **ORDRE DISCIPLINES DROPDOWN (Beta 95.7)** : Correction ordre 100→600
  - Groupe 400 (Administration) était à la fin, maintenant après 300
  - **Fichier modifié** : `js/wizard-pratique-v2.js`

- **MESSAGE AIDE BIBLIOTHEQUE (Beta 95.7)** : Guide pour édition des pratiques
  - Message ajouté dans les modals bibliothèque (Construction et Réglages)
  - "Pour éditer une pratique, transférez-la d'abord dans la barre latérale..."
  - **Fichiers modifiés** : `js/pratiques-materiel.js`, `js/pratiques.js`

- **VALEURS PAR DEFAUT JETONS (Beta 95.7)** : Ajustement selon usage réel
  - Nombre de jetons par élève : 4 → **2**
  - Durée du délai : 7 → **2 jours**
  - **Fichiers modifiés** : `index.html`, `js/pratiques.js`, `js/pratiques-materiel.js`, `js/pratique-notation-v2.js`, `js/evaluation-jetons.js`, `js/profil-etudiant.js`, `js/pratiques/pratique-pan-specifications.js`

- **MENAGE REPERTOIRE PRINCIPAL (Beta 95.7)** : Réorganisation des fichiers
  - Fusion `archive/` dans `Archives/` (documentation + scripts obsolètes)
  - Fichiers temporaires déplacés vers `Archives/`
  - Documentation utilisateur → `docs/utilisateur/`
  - Fichiers de référence → `docs/references/`
  - Logo et images → `img/`
  - Racine nettoyée : uniquement fichiers essentiels

- **BACKLOG.md CREE** : Fichier dédié pour les tâches à faire
  - Accès rapide en début de session
  - Structure : À faire / Complété
  - Référencé dans CLAUDE.md

- **BACKLOG P2 ENRICHI** : 20 éléments ajoutés à la roadmap
  - **Fichier modifié** : `docs/ROADMAP_H2026.md`
  - **Éléments ajoutés** :
    - Clarifier nombre total d'artefacts (meilleurs vs obligatoires)
    - Persistance données Primo ↔ Mode Expert
    - Valeurs par défaut système de jetons
    - Reprise ciblée - dropdown note maximale
    - Gestion bibliothèques (boutons Supprimer/Dupliquer)
    - Message aide bibliothèque pratiques
    - Document backlog indépendant (BACKLOG.md)
    - Mettre à jour section AIDE + Notes de version
    - Message "Nouveautés de la beta" automatisé
    - Audit db.get() vs db.getSync()
    - Outil vérification intégrité données
    - Audit champs texte → dropdown
    - Consolidation wizard vs pratiques-materiel
    - Système changelog automatisé
    - Checklist tests de régression
    - Étendre aide contextuelle 😎
    - Ordre disciplines dans dropdown (100→600)
    - Mettre à jour liste programmes d'études

- **DROPDOWN DISCIPLINE (Beta 95.6)** : Remplacement du champ texte libre par dropdown
  - Champ "Discipline" dans l'édition d'une pratique (Construction > Pratiques)
  - Même dropdown que Primo avec 6 catégories (100-600)
  - **Fichier modifié** : `index.html`

- **CORRECTION SAUVEGARDE PRATIQUES (Beta 95.6)** : Bug critique corrigé
  - **Symptôme** : Pratiques créées disparaissaient au rechargement de la page
  - **Cause** : Désynchronisation IndexedDB ↔ localStorage
    - Lectures depuis IndexedDB (données anciennes) écrasaient localStorage (données récentes)
    - Wizard ne définissait pas `dansBibliotheque: true` ni `pratiques: ['STD']`
  - **Corrections** :
    - `js/pratiques-materiel.js` : Toutes les lectures utilisent `db.getSync()` (localStorage)
    - `js/pratiques-materiel.js` : Vérification explicite après sauvegarde
    - `js/wizard-pratique-v2.js` : Ajout `dansBibliotheque: true` et `pratiques: [type]`
    - `js/wizard-pratique-v2.js` : Sauvegarde async avec attente IndexedDB
    - `js/wizard-pratique-v2.js` : Rafraîchissement sidebar après création

### Tache precedente (19 janvier)
- **AIDE CONTEXTUELLE 😎 (Beta 95.6)** : Systeme de boutons d'aide en Mode Assiste
  - 15 sections d'aide couvrant toutes les zones critiques de l'application
  - Nouvelle section "Cartouches de rétroaction" (rôle dans les grilles descriptives)
  - Nouvelle section "Reflexion sur les objectifs d'apprentissage"
  - Tutoiement systematique (tu/ton/tes) pour ton chaleureux
  - Ordre de configuration clarifie : Echelles → Pratiques → Grilles → Productions
  - **Fichiers crees** : `js/aide-contextuelle.js`, `js/aide-contextuelle-contenu.js`
  - **Fichiers modifies** : `index.html`, `styles.css`

- **MODULARISATION DESIGN SYSTEM (Beta 95.6)** : Separation en modules
  - 16 modules HTML dans `Design system - Modules/`
  - Index navigable `design-system-index.html`
  - Redirection depuis `DESIGN_SYSTEM.html`
  - Archive du fichier monolithique

- **AUDIT CONFORMITE DS7 (Beta 95.6)** : Corrections styles.css et index.html
  - Border-radius non conformes corriges (3px→5px, 10px→12px, 15px→20px)
  - Box-shadow rgba(0,0,0) remplaces par rgba(3,46,92) via variables CSS
  - Styles inline corriges (border-radius 4px/8px, box-shadow)
  - Rapport d'audit : `docs/AUDIT_CONFORMITE_DS7.md`

- **BADGE NB ETUDIANTS (Beta 95.6)** : Uniformisation affichage
  - Badge "X personne(s)" dans "Indicateurs globaux" et "Étudiant·es inscrit·es"
  - Mise à jour automatique au changement de groupe-cours
  - **Fichiers modifiés** : `tableau-bord-apercu.js`, `trimestre-v2.js`

- **BUG VUE CALENDAIRE (Beta 95.6)** : Calendrier n'affichait pas les bons jours de cours
  - **Symptome** : Groupe Lun-Jeu affichait des cours le mardi, ne changeait pas selon groupe-cours actif
  - **Causes multiples** :
    1. Comparaison case-sensitive `seance.jour` ("lundi") vs `jourSemaine` ("Lundi")
    2. `obtenirSeancesHoraire()` priorisait clé legacy avant entité horaire du groupe-cours
    3. Logique `typeFinal` ne distinguait pas cours-reel vs jour-ouvrable
  - **Corrections** :
    - `js/horaire.js` : Priorité à l'entité Horaire du groupe-cours actif (ordre de recherche modifié)
    - `js/calendrier-vue.js` : Normalisation minuscules + logique typeFinal améliorée
    - `js/saisie-presences.js` : Normalisation minuscules pour filtrage dates
    - `js/presences-apercu.js` : Normalisation dans `calculerTotalSeances()` et `calculerProchaineSeance()`

### Tache precedente (11 janvier)
- **SEPARATION MODAL BIENVENUE (Beta 95.4)** : Deux modals distincts
  - ✉️ Modal News : Nouveautes par version (95.4, 95.3, 95.2, 95.1)
  - 😎 Modal Introduction : Guide de demarrage (Primo, Mode Assiste)
  - Deux boutons dans l'entete (a cote de ⚠️ backup)
  - Contenu Beta 95.1 integre depuis "Docu Pour les testeurs.txt"

- **COMPATIBILITE DONNEES A2025 (Beta 95.5)** : Correction affichage indices
  - **Probleme** : Badge "0 personne" et barres vides pour trimestres anterieurs
  - **Cause 1** : `infoCours` non initialise quand changement de trimestre
  - **Cause 2** : `tableau-bord-apercu.js` lisait directement `.SOM/.PAN` (ancien format)
  - **Corrections** :
    - Auto-selection du premier groupe-cours quand changement trimestre
    - Detection format ancien (SOM/PAN) vs nouveau (pratique unique)
    - Retrocompatibilite complete pour les deux formats
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : Auto-selection groupe-cours dans `peuplerDropdownGroupeCoursActif()`
    - `js/tableau-bord-apercu.js` : Detection format dans `calculerIndicesEtudiant()`

- **OPTIMISATION INDICES C/P (Beta 95.5)** : Migration IndexedDB + pratique unique
  - **Probleme resolu** : Saturation localStorage avec calcul DUAL SOM/PAN
  - **Solution** :
    - Stockage principal dans IndexedDB (pas de limite de taille)
    - Calcul d'une seule pratique (pratique active du groupe-cours)
    - Structure simplifiee : `{ date, pratique, C, P, E, details }`
  - **Nouvelles fonctions** :
    - `obtenirPratiqueActiveGroupeCours()` dans modes.js
    - `obtenirIndicesCPAsync(da)` pour lecture async
    - `calculerEtStockerIndicesCP()` maintenant async
  - **Retrocompatibilite** : `obtenirIndicesCP(da, 'SOM')` fonctionne toujours
  - **Bug corrige** : db.js memoryCache pour donnees > localStorage
  - **Fichiers modifies** :
    - `js/portfolio.js` : Refonte calcul + nouvelles fonctions lecture
    - `js/modes.js` : obtenirPratiqueActiveGroupeCours()
    - `js/db.js` : Fix memoryCache pour QuotaExceededError

- **BADGE NB PERSONNES** : Ajout et correction du filtrage par groupe-cours
  - **Ajout badge** : "Indicateurs globaux du groupe" affiche maintenant le nombre de personnes
  - **Terminologie** : "etudiant(s)" remplace par "personnes"
  - **Correction filtrage** : Le badge s'ajuste correctement quand on change de groupe-cours
  - **Probleme resolu** : `infoCours.id` utilisait l'ID groupe-cours au lieu de l'ID cours
  - **Probleme resolu** : `db.set` async n'ecrivait pas dans localStorage sature → utilisation `db.setSync`
  - **Suppression duplication** : `changerGroupeCoursActifV2` n'existe plus que dans trimestre-v2.js
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : Mise a jour directe de `infoCours` avec `db.setSync` + correction `id: gc.coursId`
    - `js/etudiants.js` : Badge dans header "Indicateurs globaux" + terminologie "personnes"
    - `js/modes.js` : Logs DEBUG pour diagnostic (a retirer plus tard)
    - `js/entites-ui.js` : Suppression fonctions dupliquees
    - `index.html` : Ajout span badge + mise a jour versions scripts

### Tache precedente (10 janvier)
- **REDESIGN UX** : Categories Selection/Obligatoires (Beta 95.4)
  - **Separation design/notation** : Champ categorie retire du formulaire Production
  - **Nouveau design** : Deux cartes cote a cote dans Structure des evaluations
    - Carte "Selection (N meilleures)" : nombre a retenir + ponderation + checkboxes
    - Carte "Obligatoires (toujours comptees)" : ponderation + checkboxes
  - **Calcul automatique** : Ponderation unitaire affichee en temps reel
    - Selection : 65% / 4 = 16.25% par production retenue
    - Obligatoires : 35% / 2 = 17.5% par production
  - **Checkboxes exclusives** : Une production ne peut etre que dans UNE categorie
    - Cocher dans Selection → grise dans Obligatoires
    - Indication visuelle quand deja assignee ailleurs
  - **Fichiers modifies** :
    - `index.html` : Nouveau HTML cartes avec checkboxes + retrait champ categorie
    - `js/pratiques-materiel.js` : Nouvelles fonctions checkboxes + calcul unitaire
    - `js/productions.js` : Preserve categorie existante (plus de lecture du champ retire)

- **Tache precedente** : Categories Selection/Obligatoires (implementation initiale)
  - Permet de distinguer des productions "pool" (N meilleures retenues) vs "toujours comptees"
  - **Cas d'usage** : 4 meilleures sur 8 artefacts (65%) + 2 certifications obligatoires (35%)
  - Fonction `calculerNoteAvecCategories()` dans portfolio.js
  - Questions Primo pour configurer les categories

- **Tache precedente** : Mode "Cours" dans le dropdown de l'en-tete
  - Permet de selectionner un cours entier (tous les groupes fusionnes)
  - Format dropdown : `SIGLE (X groupes)` dans section "Cours (tous groupes)"
  - Etudiants de tous les groupes affiches ensemble
  - Statistiques agregees pour le cours complet
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : `peuplerDropdownGroupeCoursActif()` + `changerGroupeCoursActifV2()`
    - `js/modes.js` : `obtenirEtudiantsCoursActif()` + `obtenirDonneesSelonMode()`
  - **Implementation** :
    - Valeur dropdown avec prefixe `cours:` pour le mode cours
    - Flag `modeCours: true` dans `groupeCoursActif` et `infoCours._modeCours`
    - Filtrage par coursId sans filtre groupe quand mode cours actif
  - **Amelioration** : Option "Cours" visible meme avec 1 seul groupe-cours actif (permet de voir tous les etudiants meme si d'autres groupes sont masques)
  - **Rafraichissement automatique** : Changement de groupe-cours dans l'entete rafraichit la liste des etudiants et reinitialise le filtre Groupe
  - **Suppression dropdown redondant** : L'ancien dropdown cours dans la zone contextuelle est supprime, seul le dropdown "Groupe-cours actif" reste
- **CORRECTIONS DE BUGS** (10 janvier) :
  - **Dropdown pratique de notation** : Utilise maintenant la bonne cle `pratiquesConfigurables` (etait `pratiquesNotation`)
  - **Echelle de performance** : Persiste correctement apres rechargement (ordre de chargement corrige dans pratiques-materiel.js)
  - **Grilles de criteres** : Modifications persistaient pas apres rechargement (synchronisation grilleTemplateActuelle ajoutee)
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : Cle dropdown pratique corrigee
    - `js/pratiques-materiel.js` : Dropdown echelles charge AVANT remplissage formulaire
    - `js/contexte.js` : Suppression dropdown cours redondant
    - `js/grilles.js` : 4 fonctions synchronisent maintenant grilleTemplateActuelle (modifierCritereGrille, deplacerCritereGrilleHaut/Bas, supprimerCritereGrille)

### Tache precedente (9 janvier)
- **BUG CRITIQUE CORRIGE** : Perte de donnees etudiants (55 → 29)
  - **Symptome** : Import 29 etudiants OK, import 26 de plus OK (55 total), mais dropdown affiche 29
  - **Cause racine** : `db.getSync()` lisait depuis localStorage qui contenait des donnees obsoletes
  - **Solution** : Convertir toutes les fonctions en async avec `await db.get/set` pour lire/ecrire depuis IndexedDB (source de verite)
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : 8 fonctions converties en async
      - `confirmerImportV2`, `soumettreEtudiantV2`, `supprimerEtudiantV2`
      - `reinitialiserEtudiantsV2`, `supprimerGroupeSelectionneV2`, `sauvegarderGroupeEtudiantsV2`
      - `chargerListeEtudiantsV2`, `filtrerParGroupeV2`, `chargerGroupesCoursV2`
    - `js/modes.js` : Normalisation des groupes pour comparaison ("1" == "00001")
  - **Suppression appels legacy** : `afficherListeEtudiants()` retire de `chargerListeEtudiantsV2`
- **Bouton "Supprimer ce groupe"** : Nouvelle fonctionnalite
  - Permet de supprimer tous les etudiants d'un groupe en un clic
  - Bouton visible uniquement quand un groupe est selectionne
  - Confirmation requise avant suppression
- **Support format Excel** : `="valeur"` maintenant reconnu lors de l'import
- **Section AIDE mise a jour** : Documentation Beta 95.3
  - Carte "Etapes de configuration" : Workflow Beta 95 unifie
  - Carte "Primo" : Integration Section Trimestre + detection config existante
  - Carte "Partage et communs" : Import trimestre precedent + nommage exports
  - Carte "Section Trimestre" : 6 accordeons + syntheses intelligentes
  - Carte "Groupe-cours" : 5 composantes + bibliotheque
- **Audit module evaluation** : 3/3 problemes critiques resolus
  - `docs/modules/AUDIT_EVALUATION.md` : 16 548 lignes analysees
  - Fix #1: Namespacing `evaluationsSauvegardees` (34 occurrences, 7 fichiers)
  - Fix #2: Integration groupe-cours (`groupeCoursId` + logs)
  - Fix #3: Validations references (etudiant/production/grille)
- **Compatibilite A2025** : Verifiee, donnees legacy nettoyees
- **Donnees demo (groupe 9999)** : Bug fusion corrige
- **Protocole mise a jour beta** : Documentation + script automatisation

---

## PROCHAINE TACHE

**Choisir une tache dans le backlog Beta 95.x**

---

## BACKLOG BETA 95.x (A FAIRE)

### Prioritaire (H2026)
- [x] **Separation modal Bienvenue** : Deux modals distincts (FAIT)
  - ✉️ News (nouveautes par version : 95.4, 95.3, 95.2, 95.1)
  - 😎 Introduction (guide demarrage, Primo, Mode Assiste)
  - Contenu Beta 95.1 integre depuis "Docu Pour les testeurs.txt"
- [x] **Systeme modals info 😎 (Mode Assiste)** : Aide contextuelle (FAIT Beta 95.6)
  - 15 sections d'aide couvrant toutes les zones critiques
  - Tutoiement systematique + ordre configuration clarifie
  - Visible uniquement en Mode Assiste
- [x] **Badge nb etudiants (uniformisation)** : Afficher badge "X etudiant(s)" (FAIT Beta 95.6)
  - En-tete "Indicateurs globaux du groupe" (Vue d'ensemble)
  - En-tete "Etudiant·es inscrit·es" (Liste des etudiant·es)
  - Mise a jour automatique au changement de groupe-cours
- [x] **Modularisation design_system.html** : Separation en 16 modules (FAIT Beta 95.6)
  - Index navigable + redirection + archive monolithique
- [x] **Audit conformite Design System v7** : Corrections styles.css et index.html (FAIT Beta 95.6)
  - Border-radius et box-shadow conformes aux specifications
- [ ] **Optimisation page Trimestre** : Performance et UX
- [ ] **Tests export/import metadata CC** : Verifier que les metadonnees CC sont correctement exportees et reimportees
- [ ] **Test securite donnees sensibles** : Audit des donnees stockees (localStorage, IndexedDB)

### Ameliorations rapport de bug (post-testeurs) — FAIT 18 jan 2026
- [x] **Stack trace complet** : Ajouter trace detaillee au lieu de juste fichier:ligne
- [x] **Historique actions recentes** : Capturer les 5-10 dernieres actions (clics, navigation) avant l'erreur
- [x] **Contexte de donnees** : Inclure infos pertinentes selon la section (ex: type de fichier importe, cles localStorage actives)
- [x] **Capture d'ecran integree** : Bouton pour capturer et joindre automatiquement une capture
- [x] **Etat stockage** : Inclure cles localStorage/IndexedDB pertinentes pour la section active

### Archivage trimestre (post-H2026)
- [ ] **Snapshot complet lors archivage** : Figer TOUTES les dependances d'un trimestre
  - Productions (`trimestre_productions`)
  - Grilles de criteres (`trimestre_grilles`)
  - Echelles de performance (`trimestre_echelles`)
  - Cartouches (`trimestre_cartouches`)
  - Pratique de notation (`trimestre_pratiques`)
  - **Objectif** : Garantir consultation des anciens trimestres meme si config evolue
- [ ] **Compatibilite donnees A2025** : Corriger les references cassees
  - Probleme : Evaluations A2025 referencent grilles/echelles supprimees
  - Cause : Productions/grilles/echelles modifiees pour H2026
  - Impact : Notes non calculees pour A2025
  - Solution : Reconstruire les metadonnees ou accepter perte partielle
- [ ] **Message groupe-cours manquant** : Quand aucun groupe-cours pour un trimestre
- [ ] **Pratique de notation fallback** : Utiliser defaut si pratique configuree n'existe plus

---

## DECISIONS RECENTES

| Decision | Date | Raison |
|----------|------|--------|
| Mode Cours (tous groupes) dans dropdown | 10 jan | Suivre plusieurs groupes simultanément |
| Migration massive variables CSS | 9 jan | Maintenabilite + coherence |
| Modularisation code reportee a Beta 96 | 8 jan | Priorite = stabilite pour H2026 |
| Garder tout dans trimestre-v2.js | 8 jan | Structure donnees deja modulaire |
| Design System v7 | 8 jan | Harmonisation border-radius 12px/6px |

---

## BACKLOG BETA 95.x (COMPLETE)

### Prioritaire (fait)
- [x] Valider import/export (Productions, Grilles, Echelles, Cartouches, Pratiques)
- [x] Connexion calendrier avec groupe-cours
- [x] Saisie des presences avec groupe-cours actif
- [x] Migration variables CSS (box-shadow, border-radius)

### Plus tard
- [x] **Bug trimestre par defaut** : Resolu - detection et correction auto si plusieurs trimestres actifs
- [x] **Incoherence profil enseignant** : Resolu - liste unifiee `enseignants` (migration auto de profilEnseignant)
- [x] **Bouton supprimer groupe-cours** : Deja implementé (bouton dans formulaire + liste)
- [x] **Modal bibliotheque groupe-cours** : Vue liste avec Activer/Supprimer (Beta 95.3)
- [x] **Affichage dropdown groupe-cours** : "Groupe 00001" au lieu de "??? gr.00001"
- [x] Optimiser utilisation de l'espace (limiter scrolling vertical)
- [x] Revoir design page Trimestre (harmonisation complete)
- [x] Compatibilite page Trimestre avec wizard Primo (dropdown pratique ajoute)
- [x] Creer protocole de mise a jour des beta (docs/operations/ + scripts/)
- [x] Auditer module evaluation (3/3 problemes critiques resolus)
- [x] Syntheses intelligentes dans sidebars (5 fonctions Beta 95.3)
- [x] **Filtres par discipline/cours** : Deja implementes dans Grilles, Echelles, Productions
- [x] **Import par trimestre filtrable par cours** : Section + filtre cours + preview (Productions)
- [x] **UX modal Echelles** : Section "Importer depuis un autre trimestre" ajoutee
- [x] **Filtres discipline Echelles/Grilles** : Capture auto discipline depuis infoCours
- [x] **Harmoniser largeur modaux** : Tous a 800px (cours 900→800, groupe-cours 700→800)
- [x] **Nommage fichiers export** : Fonction genererNomFichierExport() standardisee
- [x] **Audit design global** : 16 parties verifiees, toutes conformes

### Compatibilite et donnees
- [x] Assurer compatibilite donnees A2025 avec modifications au code
- [x] Tester l'application avec les donnees A2025
- [x] Assurer la fonctionnalite des donnees demo (groupe 9999)

---

## FICHIERS CLES MODIFIES (9 janvier)

| Fichier | Modification |
|---------|--------------|
| `js/groupe.js` | **FIX CRITIQUE** : Perte donnees etudiants + format Excel ="valeur" |
| `js/trimestre-v2.js` | Bouton supprimer groupe + reset dropdown + format Excel |
| `index.html` | Bouton "Supprimer ce groupe" + Section AIDE |
| `js/cc-license.js` | Fonction genererNomFichierExport() standardisee |
| `js/echelles.js` | Import trimestre + discipline auto + nommage export |
| `js/grilles.js` | Discipline auto + nommage export |
| `js/productions.js` | Filtre cours import + nommage export |
| `js/cours.js` | Modal 800px (etait 900px) |
| `js/evaluation.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/evaluation-jetons.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/portfolio.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/snapshots.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/donnees-demo.js` | Fix fusion demo - syncToLocalStorageCache() avant cle() |
| `docs/modules/AUDIT_EVALUATION.md` | Documentation audit module evaluation |

---

## RAPPELS CRITIQUES

### Architecture
- **Single Source of Truth** : Chaque donnee a UNE source unique
- **Namespacing** : Utiliser `cle('nomCle')` pour cles localStorage
- **Priorite testeurs** : Les retours utilisateurs passent AVANT le backlog

### Design System v7
- Conteneurs : `border-radius: var(--radius-grand)` (12px)
- Petits elements : `border-radius: var(--radius-moyen)` (6px)
- Box-shadow : 5 niveaux (subtil, normal, prononce, fort, inset)

### Zones protegees
- `js/config.js` - Ne pas modifier
- `js/navigation.js` - Ne pas modifier
- `noms_stables.json` - Ne pas modifier

---

## HISTORIQUE RECENT

### 21 janvier 2026
- **BUG CRITIQUE CORRIGÉ** : Données A2025/Démo inaccessibles après changement de trimestre
  - **Symptôme** : Aucun résultat, aucun élève, aucun travail affiché pour trimestres autres que H2026
  - **Causes multiples** :
    1. `changerTrimestreActif()` ne mettait pas à jour `window.trimestreActif`
    2. `groupesCours` et `horaires` manquaient dans `CLES_NAMESPACEES`
  - **Impact** :
    - Les modules lisaient l'ancienne valeur de `window.trimestreActif`
    - `cle('groupesCours')` retournait `'groupesCours'` au lieu de `'a2025_groupesCours'`
  - **Fix** :
    - Ajout `window.trimestreActif = id;` dans `changerTrimestreActif()`
    - Ajout `'groupesCours'` et `'horaires'` à `CLES_NAMESPACEES`
  - **Fichier** : `js/trimestres.js`

- **EXPORT PDF GRILLES DESCRIPTIVES (#30)** : Améliorations mise en page
  - Nouvelle disposition : cours/trimestre en haut à droite, enseignant en bas à gauche
  - Fonctions refactorisées selon SST de trimestre-v2.js
  - Options simplifiées (retrait option Cours du pied de page, taille fixe "petit")
  - Marges réduites à 0.5 inch
  - Bug en cours : infos cours/enseignant non affichées (à déboguer)

### 20 janvier 2026
- **EXPORT PDF GRILLES DESCRIPTIVES (#30)** : Première version fonctionnelle
  - Formulaire 2 étapes : sélection contenu → aperçu mise en page
  - Options : orientation, taille police, pied de page personnalisable (enseignant, cours, licence CC)
  - Titre inclut l'activité d'apprentissage (production.description)
  - Fichiers : export-pdf.js, index.html (modal aperçu)
- **DROPDOWN NOTE MAXIMALE (Beta 95.7)** : Reprise ciblée avec échelle dynamique
  - Champ texte → dropdown peuplé selon l'échelle de l'utilisateur
  - Fonctions : `peuplerDropdownNoteMaximaleMat()`, `peuplerDropdownPlafondNoteCiblee()`
- **ORDRE DISCIPLINES DROPDOWN** : Groupe 400 déplacé à la bonne position (après 300)
- **MESSAGE AIDE BIBLIOTHEQUE** : Guide pour édition des pratiques ajouté aux modals
- **VALEURS PAR DEFAUT JETONS** : Jetons par élève 4→2, Durée délai 7→2 jours
- **BACKLOG.md** : Fichier dédié créé pour accès rapide aux tâches
- **BACKLOG P2 ENRICHI** : 20 éléments ajoutés à docs/ROADMAP_H2026.md
  - Fiabilité : audit db.get/getSync, outil intégrité données
  - UX : clarifier artefacts, persistance Primo/Expert, dropdowns, gestion bibliothèques
  - Maintenance : changelog automatisé, checklist régression, section AIDE
  - Données : programmes d'études, ordre disciplines
- **CORRECTION SAUVEGARDE PRATIQUES** : Bug critique corrigé
  - Pratiques disparaissaient au rechargement (désync IndexedDB/localStorage)
  - Fix dans pratiques-materiel.js et wizard-pratique-v2.js
- **DROPDOWN DISCIPLINE** : Champ texte remplacé par dropdown (6 catégories)

### 19 janvier 2026
- **AIDE CONTEXTUELLE 😎** : Systeme complet de boutons d'aide en Mode Assiste
  - 15 sections : evaluations, construction (grilles, echelles, cartouches, productions, pratiques), tableau de bord, presences, reglages
  - Nouvelle section "Reflexion sur les objectifs d'apprentissage" (avant creation grilles)
  - Tutoiement systematique pour ton chaleureux et accessible
  - Ordre de configuration clarifie : Echelles → Pratiques → Grilles → Productions
  - Fichiers : aide-contextuelle.js, aide-contextuelle-contenu.js
- **MODULARISATION DESIGN SYSTEM** : Separation en 16 modules HTML
  - Index navigable design-system-index.html
  - Redirection depuis DESIGN_SYSTEM.html
  - Archive du fichier monolithique (4000+ lignes)
- **AUDIT CONFORMITE DS7** : Corrections styles.css et index.html
  - Border-radius : 3px→5px, 10px→12px, 15px→20px (utilisation variables CSS)
  - Box-shadow : rgba(0,0,0) → rgba(3,46,92) via variables CSS
  - Styles inline corriges (border-radius 4px/8px)
  - Rapport : docs/AUDIT_CONFORMITE_DS7.md
- **BADGE NB ETUDIANTS** : Uniformisation dans Vue d'ensemble et Liste
  - Mise à jour automatique au changement de groupe-cours (tableau-bord-apercu.js, trimestre-v2.js)
- **BUG VUE CALENDAIRE** : Calendrier n'affichait pas les bons jours selon groupe-cours actif
  - Causes : (1) Comparaison case-sensitive, (2) Ordre priorité dans obtenirSeancesHoraire(), (3) Logique typeFinal
  - Corrections : horaire.js (priorité entité), calendrier-vue.js (logique améliorée), saisie-presences.js, presences-apercu.js

### 11 janvier 2026
- **Separation modal Bienvenue** : Deux modals distincts ✉️ News / 😎 Introduction
- **Optimisation indices C/P** : Migration IndexedDB + calcul pratique unique
- **Compatibilite A2025** : Detection format ancien/nouveau + auto-selection groupe-cours
- **Fix db.js** : memoryCache pour QuotaExceededError

### 10 janvier 2026
- **Mode "Cours" dans dropdown entete** : Voir tous les groupes fusionnes d'un cours
  - Section "Cours (tous groupes)" dans le dropdown
  - Format : `SIGLE (X groupes)`
  - Filtrage par coursId sans filtre groupe
  - Flag `_modeCours` et `groupe: null` pour detecter le mode
- **FIX Grilles de criteres** : Modifications ne persistaient pas apres rechargement
  - Cause : grilleTemplateActuelle n'etait pas synchronisee apres modification inline
  - Solution : Synchroniser grilleTemplateActuelle dans 4 fonctions (modifierCritereGrille, deplacerHaut/Bas, supprimer)

### 9 janvier 2026
- **BUG CRITIQUE CORRIGE** : Perte donnees etudiants lors import/suppression
  - Cause : obtenirDonneesSelonMode() filtrait par coursId puis sauvegarderDonneesSelonMode() ecrasait TOUT
  - Fix : db.getSync() direct dans groupe.js (confirmerImport, supprimerEtudiant)
- **Bouton "Supprimer ce groupe"** : Permet de supprimer un groupe entier avec confirmation
- **Support format Excel** : `="valeur"` reconnu lors de l'import etudiants
- **Section AIDE mise a jour** : Documentation Beta 95.3 (workflow, Primo, import trimestre)
- **Modal bibliotheque groupe-cours** : Vue liste, Activer, Supprimer, bouton 📚
- **Syntheses intelligentes sidebars** : 5 fonctions (Cours, Enseignant, Groupe, Horaire, Groupe-cours)
- **Libelle dropdown groupe-cours** : "Groupe 00001" au lieu de "??? gr.00001" (5 endroits)
- **UX modal Echelles** : Section "Importer depuis un autre trimestre" (3 fonctions)
- **Import Productions filtrable par cours** : Dropdown filtre cours + preview
- **Harmonisation modaux** : Tous a 800px (cours, groupe-cours)
- **Nommage exports** : genererNomFichierExport() type-nom-cours-discipline-date
- **Filtres discipline** : Auto-capture depuis infoCours (echelles, grilles)
- **Audit module evaluation** : 16 548 lignes, 3 problemes critiques identifies et resolus
- **Fix #1 namespacing evaluationsSauvegardees** : 34 occurrences, 7 fichiers
- **Fix #2 integration groupe-cours** : groupeCoursId ajoute aux evaluations + logs
- **Fix #3 validations references** : Verification etudiant/production/grille avant sauvegarde
- **Compatibilite A2025** : Verifiee, donnees legacy nettoyees
- **Donnees demo (groupe 9999)** : Bug fusion corrige (sync cache avant cle())
- **Protocole mise a jour beta** : Documentation + script automatisation
- **Audit Design System v7 COMPLET** : 16 parties verifiees, toutes conformes

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
- **Fix discipline cours** : sauvegarderCoursV2() + remplirFormCoursV2() corriges
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

**Derniere mise a jour** : 20 janvier 2026
