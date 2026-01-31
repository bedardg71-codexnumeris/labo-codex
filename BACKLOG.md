# BACKLOG - Monitorage Pedagogique

> **Pour Claude** : Ce fichier liste les taches a faire. Consulte-le en debut de session.
> **Derniere mise a jour** : 31 janvier 2026 (Beta 96.2 - Build 0131-1500)

---

## A faire

### Priorite haute - UX / Interface

- [x] **#39** Courbes de distribution (densite) des indices ACPE ✅ FAIT (25 jan 2026)
  - Objectif : Visualiser la distribution des etudiants selon les indices A, C, P, E
  - Type : Courbe de densite (style Gauss) avec les 4 indices superposes
  - Couleurs : A=bleu, C=orange, P=vert, E=violet (coherence avec graphiques existants)
  - Emplacement : Tableau de bord, section Vue d'ensemble (apres graphique spaghetti)
  - Fonction creee : `creerGraphiqueDistributionACPE(canvasId)`
  - Algorithme : KDE (Kernel Density Estimation) avec regle de Silverman
  - **Fichiers modifies** : `index.html`, `js/graphiques-progression.js`, `js/tableau-bord-apercu.js`

- [x] **#30** Export PDF des elements pedagogiques ✅ CORRIGÉ (25 jan 2026)
  - [x] Grilles descriptives (grille + echelle + cartouche) avec jsPDF
  - [x] Formulaire preparation 2 etapes (selection contenu → apercu mise en page)
  - [x] Nouvelle disposition : cours/trimestre en haut a droite, enseignant en bas a gauche
  - [x] Options simplifiees : orientation, checkbox trimestre, pied de page (enseignant, licence CC)
  - [x] Marges reduites (0.5 inch)
  - [x] Fonctions SST : obtenirInfosCoursPDF(), obtenirNomEnseignantPDF()
  - [x] **Bug corrigé** : Infos cours/enseignant maintenant affichées
    - **Cause** : `window.trimestreActif` vide, pas de fallback
    - **Fix** : Utilisation de `obtenirTrimestreActif()` + fallbacks multiples
    - En-tête : code cours, nom cours, trimestre
    - Pied de page : nom enseignant, licence CC BY-NC-SA
  - [ ] **Ajustements futurs (optionnel)** :
    - Productions : liste des travaux
    - Echelles seules

### Bugs critiques

- [ ] **#49** Import CSV Omnivox : colonne SA non reconnue + accents mal gérés (Jordan, 18 jan)
  - **Symptôme** : Colonne "SA" (services adaptés) pas importée car Omnivox n'ajoute pas l'espace
  - **Symptôme 2** : Caractères accentués mal représentés (é, î) lors de l'import CSV
  - **Ligne exemple** : `="1234567";="00008";="Rigby";="Éléonore";="200.B1"; ;`
  - **Impact** : Données étudiants incomplètes ou corrompues
  - **Fichier concerné** : `js/import-etudiants.js` ou équivalent

- [ ] **#50** Primo : configuration incomplète après wizard (Bruno & Olivier, 5-6 jan)
  - **Symptôme Bruno** : Jour de la semaine du cours pas configuré après Primo
  - **Symptôme Olivier** : Retour page principale sans rien de nouveau après Primo
  - **Souhait Bruno** : Pratique créée via Primo devrait être appliquée automatiquement
  - **Impact** : Testeurs doivent reconfigurer manuellement ce que Primo aurait dû faire

- [ ] **#51** Création horaire : permettre heures non piles (Bruno, 5 jan)
  - **Symptôme** : Cadre-horaire limité aux heures piles (8h00, 9h00...)
  - **Besoin** : Certains cégeps ont des horaires atypiques (ex: 8h55-9h45)
  - **Impact** : Impossible de configurer correctement le calendrier pour ces cégeps

- [ ] **#52** Erreurs null dans objectifs.js et trimestre-v2.js (Jordan, 18 jan)
  - **Erreur 1** : `Cannot set properties of null (setting 'innerHTML')` - objectifs.js:73
  - **Erreur 2** : `Cannot set properties of null (setting 'value')` - trimestre-v2.js:3463
  - **Symptôme** : Bouton "Nouvel horaire" ne fonctionne pas
  - **Impact** : Blocage de la configuration du trimestre

- [ ] **#53** Menu "Format horaire" ne se met pas à jour automatiquement (Olivier, 6 jan)
  - **Symptôme** : Changer le nombre d'heures/semaine ne met pas à jour le format horaire
  - **Impact** : Choix incohérent affiché à l'utilisateur

- [ ] **#54** UX : Message "Partage impossible" trop peu visible (Grégoire, 30 jan)
  - **Symptôme** : Message en gris pâle, difficile à lire
  - **Correction** : Mettre en ROUGE pour attirer l'attention
  - **Fichier** : `js/import-export.js`

- [x] **#55** Pratique configurable non trouvée dans le registre ✅ CORRIGÉ (31 jan 2026)
  - **Symptôme** : Erreur `❌ Pratique "pratique-1768910384608" non disponible dans le registre`
  - **Cause 1** : `obtenirPratiqueParId()` ne cherchait pas dans `pratiquesConfigurables`
  - **Cause 2** : Les pratiques créées via wizard ont une structure différente (ID/échelle à la racine, pas dans `config`)
  - **Solution** : Nouvelle fonction `construireConfigComplete()` qui normalise les deux formats
    - Fusionne les champs racine + config interne
    - Charge l'échelle par ID depuis `echellesTemplates` si non embarquée
    - Fallback vers échelle IDME par défaut si référence introuvable
  - **Fichier modifié** : `js/pratiques/pratique-registre.js`

- [x] **#37** Incoherence indice P vs Note finale (tableau de bord) ✅ CORRIGÉ (25 jan 2026)
  - **Symptome** : Vincent affiche P=50% dans le tableau de bord mais Note finale=59% dans son profil
  - **Cause** : L'indice P était calculé avec TOUTES les évaluations (via `pratique.calculerPerformance()`)
    alors que la Note finale utilisait la méthode de sélection configurée
  - **Solution** : `calculerEtStockerIndicesCP()` utilise maintenant `calculerDetailsNoteFinale()`
    - L'indice P reflète la vraie note finale de session
    - Respecte la méthode de sélection (meilleurs, récents, récents-meilleurs)
    - Respecte les pondérations portfolio/terminale
    - Applique les règles de conformité (plafonnement)
  - **Fichiers modifiés** :
    - `js/portfolio.js` : `calculerEtStockerIndicesCP()` utilise `calculerDetailsNoteFinale()`
    - `js/profil-etudiant.js` : Export de `calculerDetailsNoteFinale` pour accès global

### Documentation / Aide

- [ ] **#2** Guide PDF pour utilisateurs (10-15 pages)
  - Version imprimable du contenu de la section Aide
  - Workflow de configuration pas-à-pas
  - Captures d'écran annotées

- [x] **#10** Mettre a jour section AIDE ✅ FAIT (26 jan 2026)
  - Notes de version Beta 96 ajoutées
  - Notes de version Beta 95.3-95.7 consolidées
  - Section Introduction et Configuration à jour

- [ ] **#11** Message "Nouveautes de la beta" automatise
  - Mise a jour automatique apres chaque correctif fonctionnel
  - Synchronise avec le numero de build

- [ ] **#18** Etendre aide contextuelle 😎
  - Ajouter aides pour cas d'erreur frequents
  - Pas seulement les sections, aussi les messages d'erreur

- [x] **#43** Apercu avant impression fidele au PDF final ✅ FAIT (28 jan 2026)
  - Correction des en-têtes de niveaux : fond blanc comme le PDF (au lieu de gris)
  - Alignement des styles avec le rendu PDF final
  - **Fichier modifie** : `js/export-pdf.js`

- [x] **#44** Effet 3D sur les bulles du tableau de bord ✅ FAIT (28 jan 2026)
  - Ombre décentrée simulant lumière latérale gauche→droite
  - Dégradé de fond pour profondeur
  - Highlight inset pour reflet
  - **Fichier modifie** : `styles.css` (classe `.barre-etudiant`)

- [x] **#45** Animation des bulles animees de l'entete ✅ FAIT (28 jan 2026)
  - Effet 3D harmonisé avec les bulles du tableau de bord
  - Dégradés de couleur pour chaque pratique (SOM, STD, SPE, DEN)
  - Ombre décentrée et highlights inset ajoutés
  - **Fichier modifie** : `index.html` (section styles bulles)

- [x] **#40** Boutons d'aide dans les modals de bibliothèques ✅ FAIT (28 jan 2026)
  - Ajout du bouton 😎 dans les 5 bibliothèques (grilles, échelles, cartouches, pratiques, productions)
  - Contenu d'aide expliquant les badges (Locale/Bibliothèque/Retirée) et les boutons
  - **Fichiers modifiés** : `js/aide-contextuelle-contenu.js`, `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/pratiques-materiel.js`, `js/productions.js`

- [x] **#41** Uniformiser présentation visuelle des sidebars ✅ FAIT (28 jan 2026)
  - Style uniforme pour les boutons "Consulter la bibliothèque" (font-size: 0.9rem)
  - Classe `.sidebar-vide` pour messages vides (remplace `.banque-vide`)
  - **Fichiers modifiés** : `index.html`, `styles.css`

- [x] **#42** Uniformiser présentation visuelle des bibliothèques ✅ FAIT (28 jan 2026)
  - Badges de source (Locale/Bibliothèque/Retirée) ajoutés aux 4 bibliothèques
  - Affichage ID court (#XXXX) pour identifier les éléments
  - Détection de doublons potentiels avec avertissement
  - **Fichiers modifiés** : `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/productions.js`

- [x] **#46** Corrections visuelles Beta 96.1 ✅ FAIT (28 jan 2026)
  - Z-index modal d'aide : 10002 (au-dessus des bibliothèques à 10000)
  - Doublon bouton "Consulter la bibliothèque" dans cartouches supprimé
  - Bouton "Préparer le PDF" ajouté à la section Productions
  - Footer PDF : espacement corrigé, nom enseignant correctement affiché
  - Effet 3D appliqué aux bulles de niveau dans les tableaux (classe `.bulle-niveau-tableau`)
  - **Fichiers modifiés** : `index.html`, `styles.css`, `js/export-pdf.js`, `js/profil-etudiant.js`

### Recherche / Analyse longitudinale

- [ ] **#35** Import historique H2024 (trimestre implementation portfolio)
  - **Contexte** : Premier trimestre du portfolio, pratique sommative uniquement
  - **Donnees disponibles** : TSV artefacts, etudiants, evaluations
  - **Caracteristiques** : Pas de PAN, pas de RaI, pas de patterns
  - **Objectif** : Avoir le baseline complet pour comparaison longitudinale
  - **Processus** : Meme methode que A2024 (scripts d'import console)
  - **Livrable** : Trimestre h2024 archive dans l'application

- [ ] **#36** Rapport comparatif inter-trimestres
  - **Objectif** : Comparer les trimestres pour valider le systeme et analyser la pratique
  - **Trimestres** : H2024, A2024, A2025, H2026
  - **Indicateurs** : A, C, P, E, patterns, niveaux RaI (quand disponibles)
  - **Variables systeme** : +Portfolio (H24), +PAN (A25), +RaI (A25), +Patterns (A25)
  - **Variables pratique** : Nombre d'artefacts, interventions, abandons
  - **Questions de recherche** :
    - Impact du RaI sur les interventions et les resultats ?
    - Impact de la reduction du nombre d'artefacts sur P ?
    - Evolution des patterns entre cohortes ?
  - **Hypothese principale** : L'introduction de la RaI (A25) a rendu l'enseignant plus proactif
    - Chaine causale : RaI → niveaux/patterns visibles → interventions precoces → moins de decrochages → meilleures moyennes
    - A valider : comparer taux de decrochage et moyennes finales A24 (sans RaI) vs A25+ (avec RaI)
    - Potentiel : communication AQPC si resultats concluants
  - **Variable confondante** : Profil des etudiants
    - A25 : beaucoup d'eleves en sciences (meilleurs resultats attendus)
    - Documenter le profil (programme d'etudes) par trimestre pour nuancer les conclusions
    - **Donnees disponibles** : programmes dans l'application et/ou tableurs sources
  - **Format** : Rapport genere (PDF ou markdown) avec tableaux et graphiques
  - **Prerequis** : #35 (Import H2024) pour avoir les 4 trimestres

### Planification pedagogique

- [ ] **#34** Module Planification de l'enseignement explicite (PLANIFICATION REQUISE)
  - **Concept** : Planifier les lecons et le calendrier du trimestre selon le modele de l'enseignement explicite
  - **Public cible** : Enseignants novices qui decouvrent l'enseignement explicite
  - **Concepteur** : Gregoire (5-6 ans de pratique, formation TELUQ en enseignement efficace)
  - **Primo comme wizard** : Guide de planification des lecons (objectifs, modelisation, pratique guidee, pratique autonome)
  - **Integration calendrier** : Repartition des lecons sur les semaines du trimestre
  - **Les 5 phases d'une lecon** :
    1. Ouverture (objectif, prerequis)
    2. Modelage ("je fais" - enseignant verbalise sa pensee)
    3. Pratique guidee ("nous faisons" - avec aide)
    4. Pratique autonome ("vous faites" - sans aide)
    5. Cloture (synthese, annonce suite)
  - **Liens avec le module actuel** :
    - Productions = evaluations planifiees
    - Objectifs d'apprentissage = cibles des lecons
    - Calendrier = visualisation des lecons sur les seances
    - Sequences d'enseignement = progression logique
  - **Questions a explorer** :
    - Quand tu as commence, qu'est-ce qui t'a le plus manque ?
    - Quelles erreurs font les novices ? (modelage trop long, pratique autonome trop tot, etc.)
    - L'outil doit-il "enseigner" la methode ou juste aider a planifier ?
    - Niveau de detail : sequence ou lecon individuelle ?
    - Wizard Primo (questions guidees) ou formulaire structure ?
  - **Fichier de specs** : `docs/enseignement explicite/SPEC-MODULE-PLANIFICATION.md`
  - **Reference PDF** : `docs/enseignement explicite/livret-enseignement_explicite_2024-01-03.pdf` (Academie de Paris)
  - **Prerequis** : Documentation complete de la logique pedagogique avant codage

### Mode simplifie

- [ ] **#33** Mode Tableur - Saisie directe des resultats (BETA 97 - MARS 2026)
  - **Concept** : Permettre d'utiliser l'application sans creer de productions, grilles, echelles, etc.
  - **Usage** : Entrer directement les resultats des etudiants comme dans un tableur
  - **Objectif** : Suivi de l'apprentissage avec calculs automatiques (moyennes, progression, distribution)
  - **Public cible** : Enseignants qui ont deja leur propre systeme d'evaluation ou qui veulent un outil simple
  - **A explorer** :
    - Format des notes (sur 100? lettres? echelle personnalisee?)
    - Nommage libre des evaluations ("Examen 1", "TP2", etc.)
    - Integration avec le tableau de bord (indices C/P)
    - Cohabitation avec le mode complet (pratiques de notation)
  - **Prerequis** : Documenter la logique complete avant codage

### Securite / Protection des donnees

- [x] **#48** BUG CRITIQUE : Import données personnelles bloqué sur nouvel appareil ✅ CORRIGÉ (31 jan 2026)
  - **Symptôme** : Le message "Partage impossible" s'affichait même pour sa propre sauvegarde
  - **Impact** : Impossible de restaurer étudiants, présences et notes sur un nouvel appareil (ex: iPad)
  - **Corrections apportées** :
    1. Checkbox "C'est ma propre sauvegarde" ajoutée pour bypasser la protection
    2. Cocher auto des cases Étudiants/Présences/Notes quand on confirme sa sauvegarde
    3. Préservation des IDs originaux (pratiques, grilles, échelles, productions)
    4. Import des données calendrier (`cadreCalendrier`, `horaireHebdo`, etc.)
  - **Fichiers modifiés** : `js/import-export.js`
  - **Résultat** : Synchronisation MacBook ↔ iPad fonctionnelle

- [ ] **#47** Mot de passe optionnel pour sauvegarde/restauration
  - **Objectif** : Renforcer la protection des données personnelles lors des transferts
  - **Fonctionnement** :
    - Option lors de l'export : "Protéger avec un mot de passe"
    - Chiffrement des données sensibles (étudiants, présences, notes) avec le mot de passe
    - Demande du mot de passe lors de l'import pour déverrouiller les données
  - **Algorithme** : AES-256 via Web Crypto API (natif navigateur)
  - **UX** : Le mot de passe n'est pas stocké, seulement utilisé pour chiffrer/déchiffrer
  - **Cas d'usage** :
    - Transfert entre appareils personnels (MacBook → iPad)
    - Sauvegarde sur cloud ou clé USB
    - Protection contre accès non autorisé au fichier JSON
  - **Prerequis** : Documenter la logique de chiffrement avant codage

### Fiabilite / Maintenance

- [ ] **#32** Refonte architecture groupe Demo (PLANIFICATION REQUISE)
  - **Concept** : Le groupe Demo n'est plus un trimestre separe, mais un "bac a sable" accessible en mode Assiste
  - **Principe** : On ne switch pas de trimestre, on switch de MODE
    - Mode Normal = donnees reelles
    - Mode Assiste = acces au groupe Demo pour experimenter
  - **Contenu du groupe Demo** (dataset complet et autonome) :
    - 5 etudiants anonymises (bases sur A25)
    - ~8-10 semaines de donnees sur 15
    - Presences saisies avec patterns varies (assidus, absents, irreguliers)
    - Evaluations avec differents niveaux de performance
    - Productions, grilles, echelles, cartouches, pratique - tout inclus
  - **Adaptation dynamique** : Les donnees Demo s'ajustent au calendrier du trimestre actuel (Hiver/Automne)
  - **Avantages** :
    - Plus de confusion trimestre Demo vs trimestres reels
    - L'utilisateur reste dans son contexte de travail
    - Experimentation sans risque pour les donnees reelles
  - **Prerequis** : Documenter la logique complete avant codage
  - **Remplace** : #31 (Formulaire groupe-cours Demo incomplet - obsolete avec cette refonte)

- [ ] **#12** Audit db.get() vs db.getSync()
  - Verifier tous les modules pour desynchronisation IndexedDB/localStorage
  - Meme probleme que pratiques pourrait exister ailleurs

- [ ] **#13** Outil verification integrite donnees
  - Comparer IndexedDB et localStorage
  - Detecter et signaler les incoherences

- [ ] **#15** Consolidation wizard vs pratiques-materiel
  - Code duplique pour creation de pratiques
  - Factoriser logique commune

- [ ] **#16** Systeme changelog automatise
  - Generer notes de version depuis commits ou SESSION.md
  - Reduire maintenance manuelle

- [ ] **#17** Checklist tests de regression
  - Documenter verifications manuelles apres chaque build
  - Creer pratique, evaluer, sauvegarder, recharger, etc.

- [ ] **#27** Documenter conventions nommage champs
  - nArtefactsPAN vs nbArtefactsSoumis vs nombreTotal
  - Creer reference dans docs/ pour coherence future

- [ ] **#28** Ajouter mode edition a Wizard V2
  - Permettre d'editer une pratique existante via wizard-pratique-v2
  - Actuellement l'edition utilise le wizard legacy

- [ ] **#29** Retirer wizard legacy (post #28)
  - Supprimer modalWizardPratique (~600 lignes HTML)
  - Supprimer fonctions legacy dans pratiques.js
  - Prerequis : #28 complete

### Bibliotheques

- [x] **#40** Boutons d'aide 😎 dans les modals de bibliotheques ✅ FAIT (28 jan 2026)
  - Aide contextuelle ajoutée expliquant le fonctionnement des bibliothèques
  - Distinction claire : Retirer ≠ Supprimer, Locale vs Bibliothèque, doublons
  - **Fichiers modifies** : `js/aide-contextuelle-contenu.js`, `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/pratiques-materiel.js`, `js/productions.js`

- [x] **#41** Uniformiser presentation visuelle des sidebars ✅ FAIT (28 jan 2026)
  - Bouton "Consulter la bibliothèque" ajouté aux cartouches
  - Style uniforme (font-size: 0.9rem) sur tous les boutons
  - Classe `.banque-vide` remplacée par `.sidebar-vide` pour cohérence
  - **Fichiers modifies** : `index.html`, `js/cartouches.js`

- [x] **#42** Uniformiser presentation visuelle des bibliotheques ✅ FAIT (28 jan 2026)
  - Vérification : ordre des boutons déjà uniforme (Dupliquer → Exporter → Retirer → Supprimer)
  - Badges source (Locale/Bibliothèque/Retirée) ajoutés aux 4 bibliothèques
  - IDs courts (#abc123) ajoutés pour identifier les doublons
  - **Fichiers modifies** : `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/pratiques-materiel.js`

- [x] **#7-a** Bouton Supprimer dans bibliotheques ✅ FAIT (28 jan 2026)
  - Suppression définitive avec confirmation (modal)
  - Vérification des dépendances (ex: cartouches liées à une grille)
  - Bouton "Retirer" changé de rouge à gris (action moins grave)
  - **Fichiers modifiés** : `js/grilles.js`, `js/cartouches.js`, `js/echelles.js`, `js/pratiques-materiel.js`, `js/productions.js`

- [x] **#7-b** Bouton Dupliquer dans bibliotheques ✅ FAIT (28 jan 2026)
  - Duplication avec nouvel ID et suffixe "(copie)"
  - Métadonnées CC nettoyées sur la copie
  - **Fichiers modifiés** : `js/grilles.js`, `js/cartouches.js`, `js/echelles.js`, `js/pratiques-materiel.js`, `js/productions.js`

### Configuration

- [ ] **#22** Mettre a jour fichier noms_stables.json
  - Verifier que tous les identifiants critiques sont documentes
  - Ajouter les nouveaux noms proteges

---

## Complete (Beta 96 - 25 janvier 2026)

- [x] **#38** Graphique spaghetti - Trajectoires d'apprentissage par artefact
  - Affiche les **resultats bruts par artefact** (pas l'indice P agrege)
  - Montre la volatilite reelle de l'apprentissage (hauts et bas, non-linearite)
  - Revele les artefacts difficiles (convergence vers le bas)
  - Permet de voir la resilience (rebonds apres difficultes)
  - Zones IDME colorees en arriere-plan avec etiquettes a droite
  - Carte d'aide 😎 expliquant pourquoi les resultats bruts vs indice P
  - **Decision pedagogique** : L'indice P (meilleures notes) masque la non-linearite
  - **Fichiers modifies** : `index.html`, `js/graphiques-progression.js`, `js/tableau-bord-apercu.js`
  - **Prochaine etape** : Courbes de distribution (densite) des indices ACPE

---

## Complete (Beta 95.7 - 25 janvier 2026)

- [x] **Import historique A2024** Archivage trimestre Automne 2024
  - Import retroactif : 55 etudiants, 2 groupes, 750 evaluations, 1650 presences
  - Echelle IDME (I=40%, D=65%, M=85%, E=100%) documentee dans bibliotheque
  - Pratique : 6 artefacts recents (60%) + Analyse finale (40%)
  - Correction tri "recents" par numero de production (pas par date)
  - Scripts d'import et diagnostic dans `docs/A2024/`
  - Trimestre archive en lecture seule
  - **Fichiers modifies** : `js/portfolio.js`, `js/profil-etudiant.js`

## Complete (Beta 95.7 - 22 janvier 2026)

- [x] **Calcul assiduite en periodes** (correction majeure)
  - Formule corrigee : `periodesPresentes / periodesOffertes` (au lieu de heures)
  - Resultat : 2/2 periodes = 100% (avant: 92% a cause de la conversion heures)
  - Etudiants absents affichent 0% (au lieu du tiret) si presences saisies
  - **Fichiers modifies** : `js/saisie-presences.js`, `js/etudiants.js`

- [x] **Moyenne A du groupe** affichee partout
  - Entete liste etudiants : `moy=93%` sous la colonne A
  - Barre Assiduite du tableau de bord : moyenne + 28 points individuels
  - Calcul inclut les 0% (absents) pour moyenne correcte
  - **Fichiers modifies** : `js/etudiants.js`, `js/tableau-bord-apercu.js`

- [x] **Points individuels** sur barre Assiduite
  - Distribution visible : 26 points a droite (100%), 2 points a gauche (0%)
  - Mode PAN active par defaut si aucun mode configure
  - Filtrage specifique pour A : inclut tous les etudiants avec presences saisies
  - **Fichier modifie** : `js/tableau-bord-apercu.js`

- [x] **Bug namespacing presences** Saisie presences ne fonctionnait pas
  - `db.getSync('presences', [])` utilisait la cle sans prefixe trimestre
  - Corrige dans : `saisie-presences.js`, `interventions.js`, `rapport-bug.js`
  - Ajoute protection `Array.isArray()` dans `presences-apercu.js`
  - **Fichiers modifies** : 4 fichiers JS
  - **Resultat** : Saisie presences fonctionne avec namespacing correct

- [x] **Synchronisation horaireHebdo** avec horaires du trimestre
  - Le calendrier ne reconnaissait pas les jours de cours du nouveau trimestre
  - `horaireHebdo` n'etait pas mis a jour lors de la sauvegarde d'un horaire
  - Ajout synchronisation automatique dans `sauvegarderHoraireV2()` et `supprimerHoraireV2()`
  - **Fichier modifie** : `js/trimestre-v2.js`
  - **Resultat** : Le calendrier reconnait correctement les jours de cours

- [x] **UX Saisie presences** Input numerique au lieu de dropdown
  - Remplacement du dropdown par un champ numerique (permet fractions: 1.5, etc.)
  - Affichage format `X/Y` (ex: `2/2` pour presence complete)
  - Colonne "Total heures" devient "Total per." (periodes)
  - **Fichiers modifies** : `js/saisie-presences.js`, `index.html`

- [x] **Affichage nom pratique** dans l'entete
  - L'entete affichait l'ID (pratique-xxx) au lieu du nom
  - Recherche dans `pratiquesConfigurables` si l'ID n'est pas dans les pratiques codees
  - Chargement async via `db.get()` si `db.getSync()` retourne tableau vide (timing IndexedDB)
  - **Fichier modifie** : `js/contexte.js`

## Complete (Beta 95.7 - 21 janvier 2026)

- [x] **Bug critique** Trimestres A2025/Demo inaccessibles
  - `changerTrimestreActif()` ne mettait pas a jour `window.trimestreActif`
  - `groupesCours` et `horaires` manquants dans `CLES_NAMESPACEES`
  - Donnees demo sans groupe-cours (maintenant cree automatiquement)
  - Nouvelle fonction `creerGroupeCoursDemoSiNecessaire()` dans trimestres.js
  - **Fichiers modifies** : `js/trimestres.js`, `js/donnees-demo.js`
  - **Resultat** : A2025 affiche 30 etudiants, Demo cree auto groupe-cours

- [x] **Migration horaires/groupesCours** vers trimestre actif
  - Donnees H2026 stockees sans prefixe mais lues avec prefixe
  - Nouvelle fonction `migrerHorairesEtGroupesCours()` dans trimestres.js
  - Migration automatique au demarrage de l'application

## Complete (Beta 95.7 - 20 janvier 2026)

- [x] **#20** Datalist programmes d'etudes (~130 programmes preuniversitaires + techniques)
- [x] **#25** Analyse fonctionnalites pour Claude Cowork (docs/ANALYSE-FONCTIONNALITES.md)
- [x] **#14** Dropdowns discipline : liste complete (~120 disciplines, 6 optgroups)
- [x] **#26** Audit versions Primo : pas de conflit, 3 recommandations ajoutees (#27-29)
- [x] **#24** Option hybride construction note portfolio (Primo + Expert)
- [x] **#23** Uniformiser boutons tous modals (Design System v7)
- [x] **#4** Persistance donnees Wizard -> Mode Expert (flag enChargementFormulaire)
- [x] **#5** Valeurs par defaut jetons : 2 jetons/eleve, 2 jours delai
- [x] **#6** Dropdown note maximale (reprise ciblee) : echelle dynamique
- [x] **#8** Message aide bibliotheque pratiques
- [x] **#9** Document backlog independant (BACKLOG.md)
- [x] **#19** Ordre disciplines dropdown (100->600, groupe 400 corrige)
- [x] **#21** Menage fichiers repertoire principal (fusion archive/, reorganisation)
- [x] **#3** Clarifier nombre total d'artefacts (meilleurs vs obligatoires)

---

## Complete (Beta 95.6 - 19 janvier 2026)

- [x] Dropdown discipline (champ texte -> dropdown 6 categories)
- [x] Correction sauvegarde pratiques (desync IndexedDB/localStorage)
- [x] Boutons 😎 aide contextuelle (14 themes)
- [x] Design System v7 (harmonisation styles)

---

## Reporte (Post-AQPC ou V1.1)

- [ ] PAN-Objectifs ponderes (Michel B.)
- [ ] Remplacement progression (Jordan R.)
- [ ] PAN-Jugement global (config JSON)

---

## Notes

### Priorites
- **Retours testeurs** passent TOUJOURS AVANT ce backlog
- Items classes par importance et facilite d'implementation

### Pour ajouter un item
```markdown
- [ ] **#XX** Description courte
  - Detail 1
  - Detail 2
```

### Pour marquer comme complete
Deplacer dans la section "Complete" avec [x]
