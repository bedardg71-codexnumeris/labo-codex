# SESSION ACTIVE - BETA 96

**Date** : 25 janvier 2026
**Version** : Beta 96 (build 0125-1105)
**Statut** : Application fonctionnelle pour H2026, A2024 archive

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
- **Graphique spaghetti** : Visualisation de l'évolution de tous les étudiants (nouveau Beta 96)

### Derniere tache completee (25 janvier - Beta 96)
- **GRAPHIQUE DISTRIBUTION ACPE** : Courbes de densité (style Gauss)
  - Visualise la répartition des indices A, C, P, E parmi les étudiants
  - Utilise l'algorithme KDE (Kernel Density Estimation) pour courbes lisses
  - Lignes verticales pointillées aux moyennes de chaque indice
  - Interprétation : courbe étroite = groupe homogène, courbe large = grande variabilité
  - **Fonction créée** : `creerGraphiqueDistributionACPE(canvasId)`
  - **Fichiers modifiés** : `index.html`, `js/graphiques-progression.js`, `js/tableau-bord-apercu.js`

### Tache precedente (25 janvier - Beta 96)
- **UNIFORMISATION DES GRAPHIQUES** : Tous les graphiques adoptent le même look
  - **Échelle Y dynamique** : S'adapte aux données (min-5% à max+5%) au lieu de 0-100% fixe
  - **Zones IDME dynamiques** : Utilisent l'échelle utilisateur partout (via `genererZonesDepuisEchelle()`)
  - **Étiquettes de zones** : Centrées dans le graphique avec couleurs saturées (rouge, orange, vert, bleu)
  - **Survol interactif** : Courbe survolée mise en évidence, autres atténuées, nom affiché au bout
  - **Graphiques uniformisés** :
    - `creerGraphiqueIndividuel` : Progression temporelle A-C-P (profil étudiant)
    - `creerGraphiqueGroupeMoyennes` : Moyennes A-C-P du groupe (tableau de bord)
    - `creerGraphiqueGroupeSpaghettiACP` : Trajectoires ACP par étudiant (tableau de bord)
    - `creerGraphiqueGroupeSpaghetti` : Trajectoires par production (tableau de bord)
    - `creerGraphiqueCriteres` : Développement des habiletés (profil étudiant)
  - **Fichiers modifiés** :
    - `js/graphiques-progression.js` : Ajout plugins, onHover, échelle dynamique
    - `index.html` : Notes de version Beta 96
  - **Plugins créés** :
    - `pluginEtiquettesZones` / `pluginEtiquettesZones100` : Étiquettes centrées
    - `pluginNomCritereSurvol` : Affiche nom du critère au survol

### Tache precedente (25 janvier - Beta 96)
- **GRAPHIQUE SPAGHETTI - TRAJECTOIRES D'APPRENTISSAGE** : Nouvelle visualisation
  - Affiche les **résultats bruts par artefact** (pas l'indice P agrégé)
  - Montre la volatilité réelle de l'apprentissage (hauts et bas)
  - Révèle les artefacts difficiles (convergence vers le bas)
  - Permet de voir la résilience (rebonds après difficultés)
  - Zones IDME colorées en arrière-plan avec étiquettes
  - Carte d'aide expliquant la différence avec l'indice P

### Tache precedente (25 janvier - Beta 95.7)
- **IMPORT HISTORIQUE A2024** : Archivage trimestre Automne 2024
  - Import retroactif : 55 etudiants, 2 groupes, 750 evaluations, 1650 presences
  - Echelle IDME documentee (I=40%, D=65%, M=85%, E=100%)
  - Pratique : 6 artefacts recents (60%) + Analyse finale (40%)
  - Correction tri "recents" par numero de production (pas par date)
  - Scripts d'import dans `docs/A2024/`
  - Trimestre archive en lecture seule
  - **Fichiers modifies** : `js/portfolio.js`, `js/profil-etudiant.js`

### Tache precedente (24 janvier)
- **NETTOYAGE DOUBLON GROUPE-COURS** : Groupe 1 de A25 apparaissait dans H26
  - **Symptome** : Le dropdown groupe-cours en H26 affichait 3 groupes (1, 2, 8) au lieu de 2 (2, 8)
  - **Cause** : La migration `migrerHorairesEtGroupesCours()` du 21 jan avait copie les donnees globales vers le trimestre actif, incluant le groupe 1 de A25 dans h2026_groupesCours
  - **Diagnostic** : Script console pour lister les groupes par trimestre
    - `db.getSync("h2026_groupesCours")` → 3 groupes (00001, 00002, 00008)
    - `db.getSync("a2025_groupesCours")` → 1 groupe (00001)
  - **Fix** : Nettoyage manuel via console (suppression du groupe 00001 de h2026_groupesCours)
    - Script : `db.setSync("h2026_groupesCours", db.getSync("h2026_groupesCours").filter(gc => gc.groupe !== "00001"))`
  - **Resultat** : H26 affiche maintenant seulement les groupes 2 et 8, A25 conserve son groupe 1
  - **Note** : Pas de changement de code, correction de donnees uniquement

- **CORRECTION AFFICHAGE TABLEAU DE BORD** : Messages "en attente" contradictoires
  - **Symptome 1** : Trimestre archive A25 affichait les moyennes (92%, 78%, 89%) ET "(X evaluations en attente)" simultanement
  - **Cause** : La condition d'affichage du message "en attente" ne verificait pas si une moyenne existait deja
  - **Fix** : Ajout condition `moyenneSignificative` - le message n'apparait que si la moyenne est 0%
  - **Symptome 2** : H26 sans evaluations affichait "100% en blocage critique" et "100% Niveau 3 intensif"
  - **Cause** : Le filtrage incluait les etudiants avec A > 0 mais C = P = 0 pour les patterns/RaI
  - **Fix** : Filtrage corrige pour ne considerer que les etudiants avec C > 0 OU P > 0
  - **Fichier modifie** : `js/tableau-bord-apercu.js`
    - `genererBarreDistribution()` : Condition `moyenneSignificative` (ligne 1418)
    - `afficherPatternsApprentissage()` : Filtrage `etudiantsAvecDonneesCP` sur C et P uniquement
    - `afficherNiveauxRaI()` : Meme correction pour les niveaux RaI
  - **Resultat** :
    - A25 (archive) : Moyennes affichees sans message "en attente" parasite
    - H26 (sans evaluations) : Message "En attente de donnees" pour Patterns et RaI

### Tache precedente (23 janvier)
- **CORRECTION BUG ANONYMISATION #2** : Liste etudiants vide en mode anonymise
  - **Symptome** : Passage Normal → Anonymise affichait "0 personne" et "Aucun etudiant trouve"
  - **Cause** : Le filtrage par groupe dans `obtenirEtudiantsCoursActif()` comparait le groupe anonymise (`AN.00001`) avec le groupe reel (`00001`)
    - `anonymiserDonnees()` remplacait `e.groupe` par `AN.${e.groupe}` sans preserver le groupe reel
    - La comparaison `normaliserGroupe(e.groupe) === normaliserGroupe(groupeCours)` echouait systematiquement
  - **Fix** : Ajout de `groupeReel` dans l'anonymisation + utilisation dans le filtrage
    - `anonymiserDonnees()` : Ajout `groupeReel: etudiant.groupe` (ligne 667)
    - `obtenirEtudiantsCoursActif()` : Utilise `e.groupeReel || e.groupe` pour le filtrage (ligne 889)
    - `etudiantDansCoursActif()` : Meme correction (ligne 955)
  - **Fichier modifie** : `js/modes.js`

- **CORRECTION BUG ANONYMISATION #1** : "Eleve introuvable" lors du changement de mode
  - **Symptome** : Checkbox Anonymiser ou dropdown mode affichait "Eleve introuvable"
  - **Cause** : Incoherence de filtrage dans `rafraichirContenuSelonMode()` (modes.js)
    - La verification utilisait `filtrerEtudiantsParMode` (sans filtre coursId)
    - Mais `afficherProfilComplet` utilisait `obtenirEtudiantsCoursActif()` (avec filtre coursId)
  - **Fix** : Utiliser `obtenirEtudiantsCoursActif()` partout pour coherence
  - **Fichier modifie** : `js/modes.js`

- **DIAGNOSTIC ET CORRECTION DONNEES A25** : Trimestre A2025 inutilisable (pas d'etudiants, pas d'indices)
  - **Symptome** : Groupe-cours 00001 de l'A25 n'affichait aucune donnee malgre 30 etudiants
  - **Cause 1** : Mismatch coursId - etudiants, evaluations, presences et productions avaient un ancien coursId
    - Fix : Script console pour corriger coursId dans toutes les entites
  - **Cause 2** : Pratique non reconnue - `pan-standards-bruno` (pratique utilisateur) non trouvee par `obtenirPratiqueParId()`
    - Fix : Changement vers `pan-standards` (pratique built-in)
  - **Cause 3** : Cache indicesCP ancien format causait erreur `historique.length`
    - Fix : Nettoyage cache et recalcul avec nouveau format
  - **Cause 4** : Configuration affichage manquante - `affichageTableauBord` non defini
    - Fix : Ajout `afficherAlternatif: true` dans `modalitesEvaluation`
  - **Resultat** : A25 affiche maintenant A=98%, C=92%, P=78%, E=89% + patterns + niveaux RaI
  - **Note** : Corrections via scripts console (pas de changement de code)

- **CORRECTION FILTRAGE PRESENCES PAR GROUPE-COURS** : Les presences etaient melangees entre les groupes
  - **Symptome** : Le groupe 2 affichait les presences du groupe 8 (indice A incorrect)
  - **Cause** : `chargerGroupesPresences()`, `chargerTableauPresences()` et `sauvegarderToutesPresences()` utilisaient `obtenirDonneesSelonMode('groupeEtudiants')` (retourne TOUS les etudiants du trimestre)
  - **Fix** : Utilisation de `obtenirEtudiantsCoursActif()` pour ne prendre que les etudiants du groupe-cours actif
  - **Fichier modifie** : `js/saisie-presences.js`

- **CORRECTION CALCUL MOYENNE A PAR GROUPE-COURS** : Le calcul incluait les presences d'autres groupes
  - **Symptome** : Groupe 2 affichait la moyenne A du groupe 8
  - **Cause** : Les presences n'etaient pas filtrees par `coursId` du groupe-cours actif
  - **Fix** : Ajout filtrage `presencesGlobal.filter(p => p.coursId === coursIdActif)` dans le calcul moyenneA
  - **Fichier modifie** : `js/etudiants.js`

- **CORRECTION DROPDOWN TRIMESTRE ACTIF** : Le dropdown affichait le mauvais trimestre
  - **Symptome** : Apres changement vers A2025, le dropdown affichait toujours "Demonstration"
  - **Cause** : La valeur du select n'etait pas forcee apres population des options
  - **Fix** : Ajout `select.value = trimestreActif.id` apres population des options
  - **Fichier modifie** : `js/trimestre-v2.js`

- **CORRECTION DOUBLONS TRIMESTRES** : Deux entrees "Demonstration" dans le dropdown
  - **Cause** : Doublons dans la liste des trimestres enregistres
  - **Fix** : Nettoyage automatique des doublons dans `obtenirTrimestres()` (detection par ID et par nom)
  - **Fichier modifie** : `js/trimestres.js`

- **MASQUAGE TRIMESTRE DEMO EN MODE NORMAL** : Le trimestre Demo n'apparait plus en mode Normal
  - Le trimestre Demo est maintenant visible uniquement en Mode Assiste
  - **Fichier modifie** : `js/trimestre-v2.js`

- **AJOUT BACKLOG #32** : Refonte architecture groupe Demo planifiee
  - Le groupe Demo devient un "bac a sable" accessible en Mode Assiste
  - Plus de switch de trimestre, mais switch de MODE (Normal/Assiste)
  - Dataset complet : 5 etudiants, ~8-10 semaines, presences variees, evaluations, productions
  - Prerequis : Documentation complete avant codage

### Tache precedente (21 janvier)
- **BUG CRITIQUE TRIMESTRES A2025/DEMO** : Données inaccessibles après changement de trimestre
  - **Symptôme** : "0 personne" affiché, aucun étudiant ni résultat visible
  - **Cause 1** : `changerTrimestreActif()` ne mettait pas à jour `window.trimestreActif`
    - Fix : Ajout `window.trimestreActif = id;` après `db.setSync` (trimestres.js)
  - **Cause 2** : `groupesCours` et `horaires` manquants dans `CLES_NAMESPACEES`
    - `cle('groupesCours')` retournait 'groupesCours' au lieu de 'a2025_groupesCours'
    - Fix : Ajout des deux clés à `CLES_NAMESPACEES` (trimestres.js)
  - **Cause 3** : Données demo n'avaient pas de groupe-cours
    - Fix : `fusionnerDonneesDemo()` crée maintenant automatiquement un horaire et groupe-cours demo
    - Fichier modifié : `js/donnees-demo.js`
  - **Cause 4** : Création automatique groupe-cours demo au changement de trimestre
    - Fix : Nouvelle fonction `creerGroupeCoursDemoSiNecessaire()` appelée dans `changerTrimestreActif()`
    - Crée `HOR_DEMO` et `GC_DEMO` si manquants quand on passe au trimestre demo
    - Fichier modifié : `js/trimestres.js`
  - **Résultat** : A2025 affiche maintenant 30 étudiants avec assiduité (98%)
  - **Problème résiduel A2025** : Complétion et Performance à 0% dans le tableau de bord agrégé
    - Cause probable : Grille d'évaluation originale (`GRILLE1759243306842 - Global-5 FR-HOLIS`) supprimée/modifiée
    - Les notes individuelles sont conservées mais le calcul agrégé échoue
    - Ce n'est pas un bug de code mais un problème de données

- **MIGRATION HORAIRES/GROUPESCOURS** : Données H2026 manquantes après ajout à CLES_NAMESPACEES
  - **Symptôme** : Horaires et groupe-cours créés pour H2026 n'apparaissaient pas
  - **Cause** : Données stockées dans `horaires`/`groupesCours` (sans préfixe) mais lues depuis `h2026_horaires`/`h2026_groupesCours`
  - **Fix** : Nouvelle fonction `migrerHorairesEtGroupesCours()` dans `initialiserModuleTrimestres()`
  - Migre automatiquement les données vers le trimestre actif au démarrage
  - **Fichier modifié** : `js/trimestres.js`

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

### 25 janvier 2026
- **IMPORT HISTORIQUE A2024** : Archivage complet du trimestre Automne 2024
  - Import retroactif des donnees historiques (session de developpement initial)
  - 55 etudiants, 2 groupes, 14 artefacts + 1 analyse finale
  - 750 evaluations (700 artefacts + 50 analyses finales)
  - 1650 presences importees
  - Echelle IDME A2024 creee dans bibliotheque (I=40%, D=65%, M=85%, E=100%)
  - Pratique de notation : 6 recents (60%) + Analyse finale (40%)
  - Analyse finale : 5 criteres (Structure 15%, Rigueur 20%, Plausibilite 10%, Nuance 25%, Francais 30%)
  - Correction tri "recents" : par numero de production (pas par date d'evaluation)
  - Scripts d'import et diagnostic dans `docs/A2024/`
  - Documentation complete dans `docs/A2024/README.md`
  - Trimestre archive en lecture seule
  - **Fichiers modifies** : `js/portfolio.js`, `js/profil-etudiant.js`

### 24 janvier 2026
- **NETTOYAGE DOUBLON GROUPE-COURS** : Groupe 1 de A25 retire de H26 (correction donnees via console)
- **CORRECTION AFFICHAGE TABLEAU DE BORD** : Messages "en attente" et patterns/RaI incoherents
  - Trimestre archive A25 : Moyennes affichees sans message "en attente" contradictoire
  - H26 sans evaluations : Message "En attente de donnees" au lieu de "100% blocage critique"
  - Corrections dans `genererBarreDistribution()`, `afficherPatternsApprentissage()`, `afficherNiveauxRaI()`
  - Fichier : `js/tableau-bord-apercu.js`

### 23 janvier 2026
- **BUG ANONYMISATION #2 CORRIGE** : Liste etudiants vide en mode anonymise
  - Cause : Comparaison groupe anonymise (`AN.00001`) vs groupe reel (`00001`) dans `obtenirEtudiantsCoursActif()`
  - Fix : Ajout `groupeReel` dans `anonymiserDonnees()` + utilisation dans le filtrage (modes.js)
- **BUG ANONYMISATION #1 CORRIGE** : "Eleve introuvable" lors du changement de mode (anonymisation)
  - Cause : Incoherence entre `filtrerEtudiantsParMode` et `obtenirEtudiantsCoursActif()`
  - Fix : Utiliser `obtenirEtudiantsCoursActif()` dans `rafraichirContenuSelonMode()` (modes.js)
- **DIAGNOSTIC DONNEES A25** : Corrections multiples pour rendre le trimestre A2025 fonctionnel
  - Mismatch coursId corrige pour etudiants (30), evaluations (305), presences (941), productions (11)
  - Pratique `pan-standards-bruno` → `pan-standards` (built-in)
  - Cache indicesCP nettoye (ancien format incompatible)
  - Configuration `affichageTableauBord.afficherAlternatif: true` ajoutee
  - Resultat : Tableau de bord A25 affiche tous les indicateurs (A, C, P, E, patterns, RaI)
- **CORRECTION FILTRAGE PRESENCES** : Presences et calcul A maintenant filtres par groupe-cours actif
  - Corrige la contamination croisee entre groupes (ex: groupe 2 affichait les donnees du groupe 8)
  - `chargerGroupesPresences()`, `chargerTableauPresences()`, `sauvegarderToutesPresences()` utilisent maintenant `obtenirEtudiantsCoursActif()`
  - Calcul moyenneA filtre les presences par `coursId`
  - **Fichiers** : `js/saisie-presences.js`, `js/etudiants.js`
- **CORRECTION DROPDOWN TRIMESTRE** : Synchronisation correcte apres changement
  - Le dropdown affiche maintenant le bon trimestre actif
  - Nettoyage automatique des doublons dans la liste des trimestres
  - Trimestre Demo masque en Mode Normal (visible seulement en Mode Assiste)
  - **Fichiers** : `js/trimestre-v2.js`, `js/trimestres.js`
- **BACKLOG #32 AJOUTE** : Refonte architecture groupe Demo planifiee
  - Concept : Demo devient un "bac a sable" accessible en Mode Assiste
  - Plus de switch de trimestre, mais switch de MODE
  - Prerequis : Documentation complete avant codage

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

**Derniere mise a jour** : 25 janvier 2026
