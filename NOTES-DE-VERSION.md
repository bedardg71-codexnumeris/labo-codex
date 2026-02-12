# Notes de version — Monitorage pedagogique

> Document de gestion locale. Historique complet avec dates.
> Derniere mise a jour : 12 fevrier 2026

---

## Beta 97.5 (11-12 fevrier 2026)

**Migration palette Ocean & Boussole (C4) + Hierarchie des surfaces**

*Migration initiale (11 fevrier)*
- **Nouveau theme sombre definitif** : Migration complete de la palette « Nuit Elegante » vers « Ocean & Boussole » (C4). Fonds sombres (#0c1a22 a #244858), accent sarcelle (#6aacb8), accent laiton (#c8a060).
- **Variables :root** : Toutes les variables CSS (~1 327 usages de `var()`) basculees vers la palette ocean dans `styles.css` et `index.html`.
- **Surfaces hardcodees** : ~276 couleurs hex hardcodees (`white`, `#fff`, `#f8f9fa`, `#333`, `#666`, `#999`, etc.) remplacees par des variables semantiques (`--surface-conteneur`, `--texte-principal`, `--texte-secondaire`).
- **En-tete** : Gradient 4 stops (`#0a1820 → #142a38 → #1a3848 → #0e2028`) conforme a la maquette. Separateurs retires.
- **En-tetes de section** : 10 occurrences de `linear-gradient` remplacees par fond uni `#244858`.
- **Navigation transparente** : `.navigation-principale`, `.sous-navigation` et `.bandeau-groupe-cours` : fond `transparent`. Overrides `!important` alignes.
- **Tooltips C4** : Fond ocean profond, bordures sarcelle, animation pulse sarcelle.
- **Glassmorphism sarcelle** : Navigation et sous-navigation teintees sarcelle.
- **Composants** : Badges, alertes, tables, formulaires — tous en fonds semi-transparents adaptes au fond sombre.
- **Chart.js** : Grilles, labels et tooltips adaptes au fond sombre dans tous les fichiers JS de graphiques.
- **Planification** : Variables utilitaires adaptees; couleurs des noeuds conservees vives.
- **Impression** : `@media print` force les fonds blancs et textes sombres.
- **Scrollbars** : Stylisees sarcelle pour WebKit et Firefox.
- **Modes** : Simulation et Anonymisation adaptes a la base ocean sombre.
- **Boite a outils** : Textes corriges vers `--accent-primaire` / `--texte-principal`.
- **Accueil** : `.accueil-carte` et `.accueil-cours-actif` : fond uni `#0c1a22` avec bordure sarcelle.
- **Fallbacks JS** : 99 occurrences mises a jour dans 20 fichiers JS.

*Hierarchie des surfaces — 4 niveaux (12 fevrier)*
- **4 niveaux de surface** : N0 Page (`#0c1a22`), N1 Section (`#142428`), N2 Carte (`#1a3040`), N3 Element (`#244858`). Variables CSS : `--surface-page`, `--surface-section`, `--surface-carte`, `--surface-element`.
- **~130 radial-gradients supprimes** : remplaces par des fonds solides selon le role (N1 sections, N2 cartes/modales/panneaux, N3 inputs/hover).
- **`.section.active`** : fond N1 + padding 20px + border-radius 12px.
- **`.carte`** : fond N2 + `border-left: 3px solid` accent sarcelle.
- **Variables legacy alignees** : `--bleu-pale` → N2, `--bleu-tres-pale` → N1. 118 usages basculent automatiquement.
- **Inputs/textareas** : fond N3 pour lisibilite.
- **Fallbacks `#162c36` elimines** dans CSS et HTML.

---

## Beta 97.4 (8-11 fevrier 2026)

**Alignement pedagogique**

- **Systeme de clonage** : Double-cliquer un element de la carte pour ouvrir le panneau, puis « Cloner ». Les clones partagent titre et description — modifier l'un met a jour les autres. Indicateur 🧬 avec surbrillance au survol. Badges agreges tenant compte de tous les clones.
- **Verbes de liaison refondus** : 5 verbes verticaux automatiques (se decline en, se concretise dans, s'acquiert par, se verifie par, s'appuie sur) et 2 verbes horizontaux au choix (complete, conduit a). Direction amont → aval. Selection de verbe au clic sur un lien.
- **Evaluations dans la carte** : Nouveau type Evaluation (rose/magenta) dans la palette. Integrable dans les lecons avec champs Retroaction et Production dedies.
- **Carte d'aide flottante** : Deplacable, redimensionnable, fermable. Bouton « ? » dans la palette pour la reafficher.
- **Onglet renomme** : « Carte mentale » devient « Alignement pedagogique ».

**248 tooltips au survol**

- **Moteur de tooltips** : Delegation d'evenements, positionnement automatique (droite/gauche/bas/haut), base de contenu centralisee. Trois fichiers : `css/tooltips.css`, `js/tooltips.js`, `js/tooltips-contenu.js`.
- **En-tete (8)** : Logo, version/build, mode affichage, signaler un bug, pratique de notation, semaine courante, selecteur groupe-cours, bouton reglages.
- **Reglages (60)** : Trimestre (19 : panneaux accordeon + champs specifiques + boutons bibliotheque), Preferences (13), Depistage (14), Donnees (14).
- **Planification (34)** : Alignement pedagogique + Organisateur.
- **Tableau de bord (57)** : Apercu, Liste des individus, Profil etudiant, Interventions RaI.
- **Evaluations (24)** : Apercu, Liste des evaluations, Evaluer une production.
- **Construction de la note (31)** : Concepts transversaux, Apercu, Productions, Grilles, Echelles, Cartouches, Pratiques.
- **Navigation (34)** : 8 onglets principaux + 26 sous-onglets dynamiques generes via un mapping JS centralise (`TOOLTIPS_SOUS_NAV`).
- **Style** : Contour orange accent sur les bulles et les fleches (carre tourne a 45° pour support de bordure). Integration au theme via variables CSS (`--bleu-fonce`, `--shadow-fort`, `--radius-moyen`).
- **Curseur adaptatif** : `cursor: help` sur les elements informatifs, `cursor: pointer` preserve sur la navigation et les boutons interactifs.
- **Nettoyage** : 11 attributs `title` natifs redondants retires au profit des tooltips enrichis.

**Correctifs**

- **Fix Horaire/Groupe-cours invisibles** : Les formulaires des sections Horaire et Groupe-cours dans l'onglet Trimestre restaient invisibles meme quand un element etait selectionne dans le dropdown. Cause : `style="display: none"` inline vs `classList.remove('u-hide')`. Corrige en remplacant les styles inline par `class="u-hide"`.
- **Nettoyage inline styles** : Remplacement systematique de `style="display: none"` par `class="u-hide"` dans tous les accordeons Trimestre pour coherence avec le pattern JS existant.

---

## Beta 97.2 (6 fevrier 2026)

**Demo et accueil**

- **Nouveau systeme de demo** : La demo est desormais une route isolee (et non plus un mode). Entrez et sortez librement via un bouton dedie, vos donnees reelles sont preservees.
- **Pack demo 20 etudiants** : Donnees reelles A2025 anonymisees — 20 etudiants, 200 evaluations, 627 presences, 11 productions, 3 grilles de criteres.
- **Page d'accueil permanente** : Nouvel ecran d'accueil par defaut avec deux etats — premier lancement (creer un cours ou explorer la demo) et retour (4 cartes par intention). Mode expert dans Reglages pour court-circuiter vers le tableau de bord.
- **Guidage contextuel** : En mode demo, chaque section affiche un encart explicatif decrivant ce que vous voyez (16 encarts couvrant toutes les sous-sections).
- **Bandeau demo** : Barre verte fixe en bas de l'ecran en mode demo avec bouton « Quitter la demo ».

---

## Beta 97.1 (6 fevrier 2026)

**Interface**

- **Bulles en-tete** : Nouveau mouvement helicoidal — oscillation sinusoidale autour d'un axe de derive horizontal (parallaxe conservee).
- **Tableau de bord** : Titres renommes — « Etat des lieux » (Vue d'ensemble), « Observer » (Indicateurs ACPE), « Intervenir » (Indicateurs d'apprentissage), « Developpement du groupe » et « Developpement individuel ».
- **Qualite CSS** : 475+ couleurs hex remplacees par variables CSS dans 40+ fichiers. 171 styles inline retires dans index.html. 38 `!important` retires sur 75 dans styles.css — specificite corrigee a la source.
- **Qualite JS** : 3 fonctions `formaterDate` canoniques centralisees dans main.js. 136 patterns defensifs `typeof cle` nettoyes dans 24 fichiers. Design System synchronise.
- **Module Travaux — Panneau retractable** : La sidebar de fichiers se replie automatiquement en mode annotation pour maximiser l'espace de travail. Un onglet lateral permet de la rouvrir au besoin.
- **Module Travaux — Tampons de retroaction** : 12 autocollants visuels (3 qualite + 9 diagnostic) a poser directement sur le travail annote. Popup flottante, pose au clic, gomme et annuler/retablir inclus.
- **Module Travaux — Export PDF** : Genere un PDF unique contenant les pages annotees (traits, formes, autocollants aplatis) + une page de synthese avec les criteres, niveaux, retroaction et note finale.
- **Module Travaux — Revision avant export** : Ecran intermediaire affichant un resume des annotations et un apercu des cartouches de retroaction avant la generation du PDF.

---

## Beta 97 (6 fevrier 2026)

**Module Travaux**

- **Nouvel onglet Travaux** : Gestion complete des travaux etudiants directement dans Monitorage (import, annotation, archivage).
- **Import de fichiers** : Glissez vos PDF et images dans la zone de depot. Detection automatique du DA etudiant dans le nom du fichier. Association manuelle possible via dropdown.
- **Visionneuse integree** : Ouvrez vos PDF et images directement dans l'application. Navigation entre les pages, zoom avant/arriere, ajustement automatique a la fenetre.
- **Annotation au stylet** : Annotez directement sur les travaux avec le stylo, le surligneur, la gomme, des formes (cercle, fleche, rectangle) et des symboles (crochet, croix). Support Apple Pencil avec sensibilite a la pression et rejet de la paume.
- **Annuler/Retablir** : Ctrl+Z / Ctrl+Maj+Z pour annuler ou retablir vos annotations (jusqu'a 50 niveaux). Sauvegarde automatique.
- **Voir le travail depuis Evaluations** : Bouton « Voir le travail » dans la page d'evaluation pour afficher le document cote a cote avec la grille de criteres.
- **Travaux dans le Profil etudiant** : Nouvelle section « Travaux soumis » avec grille de miniatures et export ZIP par etudiant.
- **Archivage ZIP** : Exportez les travaux par etudiant, par production ou pour le semestre complet. Inclut les versions annotees.
- **Stockage sur disque (Mac)** : Option File System Access API pour stocker les fichiers sur votre disque au lieu d'IndexedDB. Recommande sur Mac pour les gros volumes.

**35 correctifs**

- **Fiabilite des donnees** : Correction de 5 bugs critiques (cles de stockage incoherentes, collisions d'ID, calcul d'assiduite, format de presences).
- **Calculs corriges** : Taux de completion, tendances, mode « recents-meilleurs », statistiques d'archive — tous recalculent correctement.
- **Multi-trimestre** : Namespacing renforce dans ~20 fichiers — les donnees restent bien isolees par trimestre.
- **Stabilite** : Erreurs silencieuses remplacees par des diagnostics, elements DOM manquants proteges, race conditions corrigees.
- **Design system** : Couleurs et ombres harmonisees avec la palette « Nuit Elegante ».

---

## Beta 96.2 (30 janvier — 4 fevrier 2026)

**4 fevrier**

- **Notes de presences dans Confidentiel** : Les notes saisies dans la page Presences sont maintenant visibles et editables dans le modal Confidentiel du profil etudiant (Accompagnement > Confidentiel).
- **Nouveau module Gestion des ressources** : Outil dans Reglages > Donnees > Maintenance pour auditer et nettoyer les ressources accumulees.
- **5 types de ressources** : Pratiques de notation, Grilles de criteres, Cartouches de retroaction, Echelles de performance, Productions.
- **Interface simplifiee** : Dropdown unique avec compteurs (ex: "Pratiques de notation (12)") au lieu de 5 accordeons.
- **Informations detaillees** : Chaque ressource affiche son statut (Sidebar/Masquee) et son usage (cours, evaluations).
- **Suppression definitive** : Bouton pour supprimer les ressources non utilisees avec verification des dependances.

**1er fevrier — Corrections testeurs**

- **Modal de bienvenue** : Les nouveaux utilisateurs sont accueillis avec un choix : configuration guidee ou exploration libre.
- **Animation bulles** : Effet 3D et parallaxe dans l'en-tete (grandes=proches rapides, petites=loin lentes).
- **Suppression grilles corrigee** : Le bouton supprimer dans la barre laterale fonctionne a nouveau.
- **Import productions corrige** : Les productions namespacees sont maintenant detectees et importees.
- **Horaires par trimestre** : Les horaires sont maintenant isoles par trimestre (apercu presences fonctionnel).
- **Cours A2025 corrige** : Les nouveaux cours sont crees dans le bon trimestre.
- **Section Trimestre responsive** : Affichage correct sur iPad (dates et boutons visibles).
- **Export horodate** : Les sauvegardes incluent maintenant l'heure (YYYY-MM-DD-HH-MM-SS).
- **Supprimer pratiques hors-bibliotheque** : Nouveau bouton pour supprimer les pratiques non utilisees.

**31 janvier PM — Correction registre pratiques**

- **Pratiques configurables corrigees** : Les pratiques creees via l'assistant (wizard) sont maintenant correctement chargees depuis le registre.
- **Normalisation des formats** : Fusion automatique des champs racine + config interne pour compatibilite totale.
- **Chargement echelles par ID** : Les pratiques referencant une echelle par ID la chargent maintenant depuis la bibliotheque.

**31 janvier AM — Synchronisation multi-appareils**

- **Import donnees personnelles corrige** : L'import sur un nouvel appareil (iPad, nouveau PC) fonctionne maintenant. Cochez "C'est ma propre sauvegarde" et les cases Etudiants/Presences/Notes se cochent automatiquement.
- **Preservation des IDs** : Les pratiques, grilles, echelles et productions conservent leurs IDs originaux lors de l'import (plus de references cassees).
- **Import donnees calendrier** : Les bornes du trimestre, horaires et evenements sont maintenant importes correctement.
- **Synchronisation MacBook / iPad** : Export sur un appareil, import sur l'autre — toutes les donnees sont transferees fidelement.

**30 janvier — Correction critique Export/Import**

- **Export complet depuis IndexedDB** : La "Sauvegarde complete" exporte maintenant TOUTES les donnees, y compris celles stockees uniquement dans IndexedDB (groupes-cours, horaires, donnees volumineuses).
- **Import groupe-cours et horaires** : L'import reconnait maintenant les cles `*_groupesCours`, `*_horaires` et `enseignants`.
- **Affichage "Structure du trimestre"** : Nouvelle section dans le modal d'import pour visualiser les groupes-cours et horaires avant importation.
- **Correction UTF-16 Safari** : Le bouton "Envoyer par courriel" des rapports de bug fonctionne maintenant sur Safari/iPad.
- **Archivage local des rapports** : Les rapports de bug sont sauvegardes localement (max 50).

---

## Beta 96.1 (28 janvier 2026)

- **Boite a outils — Tirage au sort** : Nouvelle section avec un outil pour tirer des etudiants au hasard (animation roulette, mode avec/sans remise, exclusions manuelles, persistance).
- **Questions Flash** : Deuxieme outil pour tirer des questions au hasard, avec organisation par categories, filtre par categorie, et gestion complete (ajout, modification, suppression, changement de categorie).
- **Icone Reglages** : Le texte "Reglages" remplace par une icone d'engrenage dans la navigation principale.
- **Animation 3D des points (Tableau de bord)** : Les points blancs dans les barres oscillent avec un effet de rotation 3D (desactivable dans Preferences > Experience visuelle).
- **Modal Confidentiel (Profil etudiant)** : Nouveau bouton dans la section Accompagnement pour saisir des informations sensibles (EPGC, cours anterieur, services adaptes, defis particuliers, notes personnelles).
- **Correlations significatives uniquement** : Les messages de correlation A/P et C/P ne s'affichent que si r >= 0.5 (moderee ou plus).
- **Anonymisation des groupes** : En mode Anonymisation, les numeros de groupe sont remplaces par des lettres (00001 = Gr. A).
- **Graphique Trajectoire ameliore** : La courbe de l'eleve selectionne apparait au premier plan.
- **Bouton Supprimer dans les bibliotheques** : Suppression definitive des elements avec confirmation et verification des dependances.
- **Bouton Dupliquer dans les bibliotheques** : Creez rapidement une copie d'un element existant.
- **Isolation des templates archives** : Supprimer un template en H2026 n'affecte plus les trimestres archives.

---

## Beta 96 (25 janvier 2026)

- **Uniformisation des graphiques** : Tous les graphiques adoptent le meme look et comportement coherent.
- **Echelle Y dynamique** : Les graphiques s'adaptent automatiquement aux donnees (fini l'echelle fixe 0-100%).
- **Zones IDME dynamiques** : Les zones colorees (Insuffisant, Developpement, Maitrise, Etendu) utilisent votre echelle personnalisee partout.
- **Etiquettes de zones centrees** : Les noms des zones s'affichent au centre du graphique avec des couleurs saturees pour une meilleure lisibilite.
- **Survol interactif** : Survolez une courbe pour la mettre en evidence (les autres s'attenuent), le nom s'affiche au bout de la courbe.
- **Verrouillage au clic** : Cliquez sur une courbe ou son nom pour la verrouiller, cliquez ailleurs pour deverrouiller.
- **Points uniformises** : Tous les points des graphiques et barres ACEP ont le meme style (blanc avec contour bleu pale, noir au survol).
- **Distribution ACPE** : Nouveau graphique montrant la repartition des indices A, C, P, E avec des courbes de densite (style Gauss).

---

## Beta 95.7 (21-23 janvier 2026)

**23 janvier**

- **Mode Anonymise corrige** : La liste des etudiants s'affiche correctement en mode anonymisation.
- **Filtrage presences par groupe-cours** : Les presences sont correctement isolees par groupe-cours.
- **Calcul moyenne A corrige** : Chaque groupe affiche sa propre moyenne d'assiduite.
- **Dropdown trimestre synchronise** : Le selecteur de trimestre affiche le bon trimestre actif.
- **Nettoyage doublons trimestres** : Les entrees en double sont automatiquement detectees et supprimees.
- **Mode Demo clarifie** : Le trimestre Demonstration n'apparait plus en Mode Normal.

**22 janvier**

- **Saisie presences amelioree** : Input numerique remplace le dropdown (permet fractions: 1.5, 2.5...), affichage X/Y per.
- **Calcul assiduite corrige** : Formule en periodes (2/2 = 100%, pas 92%). Etudiants absents affichent 0% (pas tiret).
- **Moyenne A du groupe** : Affichee dans l'entete de la liste des etudiants et sur la barre Assiduite du tableau de bord.
- **Points individuels** : La barre Assiduite du tableau de bord affiche maintenant les 28 points (distribution visible).
- **Calendrier synchronise** : L'horaire du trimestre actif est correctement reconnu par le calendrier.
- **Affichage nom pratique** : L'entete affiche le nom de la pratique au lieu de son ID technique.

**21 janvier**

- **Export PDF grilles descriptives** : Genere un PDF de ta grille avec les retroactions (grille + echelle + cartouche). Options : orientation, taille police, pied de page personnalisable (enseignant, cours, licence CC).
- **Autocompletion programmes** : Tapez le code (200, 300, 420...) pour voir les programmes officiels.
- **Dropdowns discipline complets** : Liste complete (~120 disciplines) pour les 48 cegeps du Quebec.
- **Option Hybride portfolio** : Nouveau mode "N meilleures + Obligatoires" disponible dans Primo et Mode Expert.
- **Persistance Primo → Expert** : Les valeurs configurees (artefacts, construction note, echelle) persistent correctement.
- **Boutons uniformises** : Tous les modals respectent le Design System v7 (Annuler orange, Confirmer vert).

---

## Beta 95.6 (19 janvier 2026)

- **Boutons d'aide** : En Mode Assiste, des boutons apparaissent pour expliquer chaque section (14 themes couverts).
- **Ordre de configuration clarifie** : Echelles → Pratiques → Grilles → Productions (chaque element depend du precedent).
- **Design System v7** : Harmonisation des styles (border-radius, box-shadow) selon la charte graphique.
- **Tiret au lieu de 0%** : La liste des etudiants affiche un tiret quand aucune donnee n'est saisie.
- **Barres "En attente"** : Les barres de distribution indiquent "En attente de donnees" au lieu de 0%.
- **Dropdown synchronise** : Le selecteur d'etudiant se met a jour lors du changement de groupe-cours.
- **Calendrier corrige** : L'horaire affiche correspond au groupe-cours actif.

---

## Beta 95.5 (10-18 janvier 2026)

**10 janvier**

- **Categories Selection/Obligatoires** : Nouveau design avec deux cartes et checkboxes pour classer tes productions (N meilleures vs toujours comptees).
- **Metadonnees uniformisees** : Panneau coherent pour tous les elements avec titre dynamique.
- **Tracabilite contributeurs CC** : Les contributeurs sont automatiquement ajoutes lors des modifications.
- **Wizard Primo ameliore** : Champs Prenom/Nom separes, pre-remplissage auto, dropdown disciplines.

**18 janvier — Corrections testeurs**

- **Creation d'horaire** : Le bouton fonctionne a nouveau (merci Jordan).
- **Export des donnees** : Le bouton d'export repond correctement (merci Jordan).
- **Import CSV Omnivox** : Detection intelligente des colonnes (SA, Nom, etc.) quelle que soit leur position (merci Jordan).
- **Encodage fichiers** : Support automatique Windows-1252 pour les accents.
- **Rapport de bug ameliore** : Stack trace complet, historique des clics, contexte section, bouton capture d'ecran.

---

## Beta 95.3 (9 janvier 2026)

- **Modal bibliotheque groupe-cours** : Bouton pour voir, activer ou supprimer tes groupes-cours.
- **Syntheses intelligentes** : Chaque accordeon affiche un resume calcule (nb etudiants, heures/sem, etc.).
- **Import depuis trimestre precedent** : Reutilise tes echelles, grilles et productions.
- **Audit module evaluation** : 3 problemes critiques corriges.

---

## Beta 95.2 (6-8 janvier 2026)

**Architecture modulaire**

- **Toggles separes** : Cours, Enseignant, Horaire et Groupe-cours sont des entites independantes.
- **Profil auteur** : Source unique pour les metadonnees CC.
- **Assemblage flexible** : Combine cours + enseignant + horaire + pratique.
- **Migration automatique** : Tes donnees existantes sont converties.

---

## Beta 95.1 (1-5 janvier 2026)

**Corrections testeurs**

- **Periodes au lieu d'heures** : Format horaire dynamique selon le nombre de periodes (merci Olivier).
- **Finalisation Primo** : L'interface se met a jour apres la configuration (merci Olivier).
- **Sauvegarde des grilles** : Les nouvelles grilles s'ajoutent a la bibliotheque (merci Bruno).
- **Heures non piles** : Entree d'heures comme 8h55 dans Primo (merci Bruno).
- **Import/Export ameliore** : Import selectif, protection des donnees (merci Bruno, Gregoire).
