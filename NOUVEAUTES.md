# Nouveautes — Monitorage pedagogique

> Ce document accompagne l'application. Il presente les nouveautes de chaque version sans details internes.

---

## Beta 97.5

**Theme Ocean & Boussole — Hierarchie des surfaces**

- **Interface sombre definitive** : L'application adopte la palette ocean profond avec des accents sarcelle et laiton. Fonds sombres, textes clairs, contraste optimise.
- **Hierarchie visuelle en 4 niveaux** : Les cartes ressortent clairement du fond de section grace a 4 niveaux de surface distincts. Chaque carte est marquee d'un trait sarcelle a gauche.
- **Surfaces solides** : Les ~130 degrades radial-gradient identiques sont remplaces par des fonds unis, plus lisibles et coherents.
- **En-tete atmospherique** : Gradient 4 stops conforme a la maquette C4.
- **Navigation epuree** : Barres de navigation transparentes, glassmorphism sarcelle.
- **Inputs ameliores** : Les zones de saisie ont un fond plus clair pour une meilleure lisibilite.
- **Tooltips** : Bulles bleu-vert profond avec bordures sarcelle.
- **Graphiques** : Grilles et labels adaptes pour le fond sombre.
- **Impression** : Les couleurs repassent en clair automatiquement a l'impression.

---

## Beta 97.4

**Alignement pedagogique**

- **Systeme de clonage** : Double-cliquer un element pour le cloner. Les clones partagent titre et description. Indicateur 🧬 avec surbrillance au survol.
- **Verbes de liaison refondus** : 5 verbes verticaux automatiques et 2 verbes horizontaux au choix pour decrire les relations pedagogiques. Selection de verbe au clic sur un lien.
- **Evaluations dans la carte** : Nouveau type Evaluation (rose/magenta) integrable dans les lecons avec champs Retroaction et Production.
- **Carte d'aide flottante** : Deplacable, redimensionnable, fermable.

**248 tooltips au survol**

- **Aide contextuelle au survol** : Survolez n'importe quel element de l'interface pour obtenir une description de son role. 248 tooltips couvrant l'en-tete (8), les reglages (60), la planification (34), le tableau de bord (57), les evaluations (24), la construction de la note (31) et la navigation (34).
- **Navigation enrichie** : Chaque onglet et sous-onglet affiche un tooltip decrivant le contenu de la section.
- **Positionnement intelligent** : La bulle se place automatiquement pour rester visible dans la fenetre.
- **Style soigne** : Bulles avec contour orange accent et fleche bordee assortie.

---

## Beta 97.2

**Demo et accueil**

- **Nouveau systeme de demo** : La demo est desormais une route isolee. Entrez et sortez librement via un bouton dedie, vos donnees reelles sont preservees.
- **Pack demo 20 etudiants** : Donnees A2025 anonymisees — 20 etudiants, 200 evaluations, 627 presences, 11 productions, 3 grilles de criteres.
- **Page d'accueil permanente** : Nouvel ecran d'accueil par defaut avec deux etats — premier lancement (creer un cours ou explorer la demo) et retour (4 cartes par intention). Mode expert dans Reglages pour court-circuiter vers le tableau de bord.
- **Guidage contextuel** : En mode demo, chaque section affiche un encart explicatif decrivant ce que vous voyez.
- **Bandeau demo** : Barre verte fixe en bas de l'ecran en mode demo avec bouton « Quitter la demo ».

---

## Beta 97.1

**Interface et qualite**

- **Bulles en-tete** : Nouveau mouvement helicoidal avec oscillation sinusoidale et parallaxe.
- **Tableau de bord** : Titres renommes — « Etat des lieux », « Observer », « Intervenir », « Developpement du groupe » et « Developpement individuel ».
- **Qualite CSS** : 475+ couleurs hex remplacees par variables CSS. 171 styles inline retires. 38 `!important` retires.
- **Qualite JS** : Fonctions `formaterDate` centralisees. 136 patterns defensifs nettoyes. Design System synchronise.

**Module Travaux**

- **Panneau retractable** : La sidebar de fichiers se replie automatiquement en mode annotation pour maximiser l'espace de travail.
- **Tampons de retroaction** : 12 autocollants visuels (3 qualite + 9 diagnostic) a poser directement sur le travail annote.
- **Export PDF** : Genere un PDF unique contenant les pages annotees + une page de synthese avec criteres, niveaux, retroaction et note finale.
- **Revision avant export** : Ecran intermediaire affichant un resume des annotations et un apercu des cartouches avant la generation du PDF.

---

## Beta 97

**Module Travaux**

- **Nouvel onglet Travaux** : Gestion complete des travaux etudiants directement dans Monitorage (import, annotation, archivage).
- **Import de fichiers** : Glissez vos PDF et images dans la zone de depot. Detection automatique du DA etudiant dans le nom du fichier.
- **Visionneuse integree** : Ouvrez vos PDF et images directement dans l'application. Navigation entre les pages, zoom, ajustement automatique.
- **Annotation au stylet** : Stylo, surligneur, gomme, formes (cercle, fleche, rectangle) et symboles (crochet, croix). Support Apple Pencil avec sensibilite a la pression.
- **Annuler/Retablir** : Ctrl+Z / Ctrl+Maj+Z pour vos annotations (jusqu'a 50 niveaux). Sauvegarde automatique.
- **Voir le travail depuis Evaluations** : Bouton pour afficher le document cote a cote avec la grille de criteres.
- **Travaux dans le Profil etudiant** : Section « Travaux soumis » avec grille de miniatures et export ZIP.
- **Archivage ZIP** : Exportez les travaux par etudiant, par production ou pour le semestre complet.
- **Stockage sur disque (Mac)** : Option File System Access API pour les gros volumes.

**Correctifs**

- Fiabilite des donnees : 5 bugs critiques corriges (cles de stockage, collisions d'ID, calcul d'assiduite, format de presences).
- Calculs corriges : taux de completion, tendances, mode « recents-meilleurs », statistiques d'archive.
- Multi-trimestre : namespacing renforce — les donnees restent bien isolees par trimestre.
- Stabilite : erreurs silencieuses remplacees par des diagnostics, elements DOM proteges, race conditions corrigees.

---

## Beta 96.2

- **Notes de presences dans Confidentiel** : Les notes saisies dans Presences sont visibles et editables dans le modal Confidentiel du profil etudiant.
- **Module Gestion des ressources** : Outil dans Reglages pour auditer et nettoyer les ressources accumulees (pratiques, grilles, cartouches, echelles, productions).
- **Interface simplifiee** : Dropdown unique avec compteurs au lieu de 5 accordeons.
- **Suppression definitive** : Supprimez les ressources non utilisees avec verification des dependances.
- **Modal de bienvenue** : Les nouveaux utilisateurs sont accueillis avec un choix entre configuration guidee et exploration libre.
- **Animation bulles** : Effet 3D et parallaxe dans l'en-tete.
- **Import productions corrige** : Les productions namespacees sont correctement detectees et importees.
- **Horaires par trimestre** : Les horaires sont isoles par trimestre.
- **Export horodate** : Les sauvegardes incluent l'heure.
- **Pratiques configurables corrigees** : Les pratiques creees via l'assistant sont correctement chargees.
- **Import donnees personnelles corrige** : L'import sur un nouvel appareil fonctionne correctement.
- **Preservation des IDs** : Les pratiques, grilles, echelles et productions conservent leurs IDs lors de l'import.
- **Import donnees calendrier** : Bornes du trimestre, horaires et evenements importes correctement.
- **Export complet depuis IndexedDB** : La sauvegarde complete exporte toutes les donnees.
- **Correction UTF-16 Safari** : Le bouton « Envoyer par courriel » des rapports de bug fonctionne sur Safari/iPad.

---

## Beta 96.1

- **Boite a outils — Tirage au sort** : Outil pour tirer des etudiants au hasard (animation roulette, mode avec/sans remise, exclusions, persistance).
- **Questions Flash** : Outil pour tirer des questions au hasard, avec categories et filtre.
- **Icone Reglages** : Icone d'engrenage dans la navigation principale.
- **Animation 3D des points** : Les points dans les barres du tableau de bord oscillent avec un effet de rotation 3D (desactivable dans Preferences).
- **Modal Confidentiel** : Saisie d'informations sensibles dans le profil etudiant (EPGC, services adaptes, notes personnelles).
- **Correlations significatives** : Les messages de correlation ne s'affichent que si r >= 0.5.
- **Anonymisation des groupes** : Les numeros de groupe sont remplaces par des lettres en mode anonymisation.
- **Graphique Trajectoire ameliore** : La courbe de l'eleve selectionne apparait au premier plan.
- **Boutons Supprimer et Dupliquer** : Disponibles dans toutes les bibliotheques avec verification des dependances.

---

## Beta 96

- **Uniformisation des graphiques** : Tous les graphiques adoptent le meme look et comportement.
- **Echelle Y dynamique** : Les graphiques s'adaptent automatiquement aux donnees.
- **Zones IDME dynamiques** : Les zones colorees utilisent votre echelle personnalisee.
- **Etiquettes de zones centrees** : Noms affiches au centre avec couleurs saturees.
- **Survol interactif** : Survolez une courbe pour la mettre en evidence.
- **Verrouillage au clic** : Cliquez sur une courbe pour la verrouiller.
- **Points uniformises** : Style coherent pour tous les points et barres.
- **Distribution ACPE** : Nouveau graphique avec courbes de densite.

---

## Beta 95.7

- **Mode Anonymise corrige** : Affichage correct en mode anonymisation.
- **Filtrage presences par groupe-cours** : Presences isolees par groupe-cours.
- **Calcul moyenne A corrige** : Chaque groupe affiche sa propre moyenne d'assiduite.
- **Dropdown trimestre synchronise** : Le selecteur affiche le bon trimestre actif.
- **Saisie presences amelioree** : Input numerique (fractions: 1.5, 2.5...), affichage X/Y periodes.
- **Calcul assiduite corrige** : Formule en periodes (2/2 = 100%). Etudiants absents affichent 0%.
- **Moyenne A du groupe** : Affichee dans l'entete et sur la barre Assiduite du tableau de bord.
- **Points individuels** : La barre Assiduite affiche les points de distribution.
- **Calendrier synchronise** : L'horaire du trimestre actif est reconnu.
- **Export PDF grilles descriptives** : PDF de la grille avec retroactions, options d'orientation et pied de page personnalisable.
- **Autocompletion programmes** : Tapez le code pour voir les programmes officiels.
- **Option Hybride portfolio** : Mode « N meilleures + Obligatoires ».

---

## Beta 95.6

- **Boutons d'aide** : En mode assiste, des boutons apparaissent pour expliquer chaque section.
- **Ordre de configuration clarifie** : Echelles → Pratiques → Grilles → Productions.
- **Design System v7** : Harmonisation des styles selon la charte graphique.
- **Tiret au lieu de 0%** : Affichage d'un tiret quand aucune donnee n'est saisie.
- **Barres « En attente »** : Indication « En attente de donnees » au lieu de 0%.
- **Dropdown synchronise** : Le selecteur d'etudiant se met a jour lors du changement de groupe-cours.

---

## Beta 95.5

- **Categories Selection/Obligatoires** : Deux cartes avec checkboxes pour classer les productions (N meilleures vs toujours comptees).
- **Metadonnees uniformisees** : Panneau coherent pour tous les elements.
- **Tracabilite contributeurs CC** : Ajout automatique lors des modifications.
- **Wizard Primo ameliore** : Champs separes, pre-remplissage auto, dropdown disciplines.
- **Creation d'horaire corrigee** : Le bouton fonctionne a nouveau.
- **Export des donnees corrige** : Le bouton d'export repond correctement.
- **Import CSV Omnivox** : Detection intelligente des colonnes quelle que soit leur position.
- **Encodage fichiers** : Support automatique Windows-1252 pour les accents.
- **Rapport de bug ameliore** : Stack trace complet, historique des clics, bouton capture d'ecran.

---

## Beta 95.3

- **Modal bibliotheque groupe-cours** : Bouton pour voir, activer ou supprimer les groupes-cours.
- **Syntheses intelligentes** : Chaque accordeon affiche un resume calcule.
- **Import depuis trimestre precedent** : Reutilisez vos echelles, grilles et productions.

---

## Beta 95.2

- **Toggles separes** : Cours, Enseignant, Horaire et Groupe-cours sont des entites independantes.
- **Profil auteur** : Source unique pour les metadonnees CC.
- **Assemblage flexible** : Combine cours + enseignant + horaire + pratique.
- **Migration automatique** : Les donnees existantes sont converties.

---

## Beta 95.1

- **Periodes au lieu d'heures** : Format horaire dynamique selon le nombre de periodes.
- **Finalisation Primo** : L'interface se met a jour apres la configuration.
- **Sauvegarde des grilles** : Les nouvelles grilles s'ajoutent a la bibliotheque.
- **Heures non piles** : Entree d'heures comme 8h55 dans Primo.
- **Import/Export ameliore** : Import selectif, protection des donnees.
