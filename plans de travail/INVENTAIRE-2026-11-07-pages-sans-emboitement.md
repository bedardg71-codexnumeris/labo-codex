# Inventaire — lot « Les pages sans emboîtement », étape 1 (7 nov. 2026)

Sans code. Soumis à Grégoire ; l'étape 2 attend son accord. Écrit par Claude Code. Branche `lot/en-tete-epure`,
HEAD `9296b35c9`. Consigne et règle validée : `CONSIGNE-2026-11-07-chaine-des-quatre-lots.md`, § Lot 4.

**Comment c'est mesuré.** Un banc WebKit ouvre les 38 onglets et l'accueil, avec les données de la démo, dans les
deux thèmes, à 1180 et à 820 px. Il ouvre tous les accordéons, puis, en Conception, un élément de chaque liste
(une production, une grille…), parce que c'est là que les cadres s'empilent. Est compté comme **cadre** tout bloc
d'au moins 160 × 40 px qui a une ombre, une bordure sur trois côtés ou plus, ou un fond distinct de ce qu'il y a
derrière lui. Le **niveau** d'un contenu, c'est le nombre de cadres sans fonction qui l'entourent. Résultat :
**les mêmes niveaux dans les deux thèmes et aux deux largeurs** (0 écart sur 78 relevés).

**Ce que j'ai classé seul** (à corriger en dix secondes si c'est faux) :
- **Ne sont pas des cadres** : un tableau (ses lignes sont sa structure), les barres des indices et les mois du
  calendrier (des graphiques), et la bande de titre d'une carte (la bande bleu marine « Évaluations », l'en-tête
  d'un accordéon) : elle fait partie de sa carte.
- **Cadres à fonction, qui restent** : les deux zones de dépôt (Préparer, Partage), les champs, les palettes et
  les nœuds de la carte d'alignement (canevas), la recherche collée de l'Aide, la navigation flottante
  d'Animation, les fenêtres. La copie à annoter aussi, mais la démo n'en livre aucune : Annoter est mesurée vide
  (voir § 4).

## Vue d'ensemble

| | Pages |
|---|---|
| Au moins deux niveaux aujourd'hui | **38 sur 39** (toutes sauf Labo › Suivi longitudinal) |
| … à cause du seul panneau commun (§ 1) | 17 : elles deviennent conformes quand le panneau part |
| … et une carte dans une carte en plus (§ 2) | **20**, plus l'Aide si les alertes ne sont pas des cadres à fonction (question 1) |
| Le plus profond | 3 niveaux sans fonction : Préparer, Liste, Calendrier, Données |

## 1. Le composant commun : le panneau de section

**Toutes les pages** posent leur contenu dans le même panneau : `.section.active` (`styles.css`), le grand cadre
blanc du thème clair (`--surface-section` sur `--surface-page`) et vert-gris du thème sombre. En clair, le blanc
vient aussi de `.conteneur` ; l'onglet Suivi › Groupe, hors de sa section dans le code, a sa propre copie du
panneau. **C'est là qu'il faut agir** : une règle retire le premier niveau de toutes les pages d'un coup.

Ensuite, la carte (`.carte`) est le seul niveau permis. Elle est commune à presque toutes les pages, et c'est
**dedans** que se trouve l'emboîtement : une quinzaine de petits composants, presque chacun propre à une page.
Le seul autre composant partagé : la **barre de filtres grise** (`carte-grise-mb20`), sur trois pages.

## 2. Les pages qui gardent une carte dans une carte

Niveaux comptés panneau compris, cadres à fonction exclus. « Part » : le cadre qui disparaît à l'étape 2 ; son
contenu reste, posé sur la carte, séparé par l'espace (et un titre s'il en a un).

| Section › onglet | Niveaux | Ce qui est emboîté (et ce qu'il contient) | Part | Reste (fonction) |
|---|---|---|---|---|
| **Évaluation › Préparer** | 3 | carte blanche ombrée › carte grise de l'étape (`pipeline-etape` : pastille, titre, zone de dépôt) ; dans la même carte, un encadré pointillé d'explication (`travaux-zero-state`) | le panneau, la carte, la carte de l'étape (esquisse 68) ; les pointillés de l'encadré d'explication, qui imitent une zone de dépôt | la zone de dépôt, pleine largeur |
| Évaluation › Liste | 3 | carte › **carte** (bande « Évaluations ») › barre de filtres grise ; le tableau | la carte extérieure, le fond de la barre de filtres | — |
| Évaluation › Exporter | 2 | carte › deux cartes d'export (`travaux-archivage-carte`), l'espace de stockage (`travaux-quota-section`) | les trois sous-cartes | — |
| Cadre › Trimestre | 2 | six accordéons-cartes › barre de sélection (`rangee-selection`), blocs teintés vert et bleu (identification, bornes), formulaire d'ajout, import, résumé de l'horaire, aperçu du nom du groupe-cours | les fonds des blocs, la barre de sélection en carte | la liste des étudiant·es (tableau) |
| Cadre › Calendrier | 3 | carte › légende encadrée › quatre tuiles de légende | le cadre de la légende et des tuiles | les mois (graphique) |
| Suivi › Étudiant·es | 2 | carte › barre de filtres grise ; le tableau | le fond de la barre | — |
| Suivi › Présences | 2 | carte › barre grise (date, ← Précédent / Suivant →, filtres), compteur teinté de la séance ; le tableau | le fond de la barre et du compteur | — |
| Suivi › Profils | 2 | section de la note finale › deux composantes et le résultat, chacun encadré | les cadres des composantes | le tableau des productions |
| Suivi › Animation | 2 | carte de l'outil › zone d'affichage encadrée (la question tirée) | le cadre de la zone d'affichage | la navigation flottante |
| Labo › Observation | 2 | trois cartes-piliers › 12 blocs d'option encadrés (case, texte, liens) | les cadres des blocs | — |
| Labo › Exploration | 2 | carte de l'arbre › têtes de nœud teintées ; carte du contenu › encadré « Outil en développement » | les fonds des têtes, l'encadré | — |
| Labo › Bilan | 2 | encadré d'aide › deux astuces encadrées | les cadres des astuces | — |
| Réglages › Préférences | 2 | carte › quatre réglages sur fond bleu pâle (thème, chrono…) | les fonds | — |
| Réglages › Données | 3 | carte › deux blocs bleu pâle (exports) ; accordéon › zone teintée › trois tuiles de mesures ; accordéon › zones de maintenance | les fonds et les tuiles | la zone de dépôt du partage |
| Conception › Grilles (une grille ouverte) | 2 | formulaire teinté › cinq critères encadrés (`item-liste`) | le fond du formulaire ou les cadres des critères (un seul des deux) | les champs |
| Conception › Échelles (une échelle ouverte) | 2 | formulaire teinté › niveaux encadrés, « Repères de maîtrise » encadré | idem | les champs, le choix de couleur (fenêtre) |
| Conception › Productions (une production ouverte) | 2 | formulaire teinté › définition du type teintée | le fond de la définition | les champs personnalisés |
| Conception › Pratiques (une pratique ouverte) | 2 | accordéon « Système de jetons » › trois réglages sur fond bleu pâle | les fonds | — |
| Aide › Codex et archives | 2 | accordéon « Collaboration » › encadré violet « Ressources partageables » | le fond violet | — |
| Accueil | 2 | bannière de bienvenue (carte) › bande teintée « Tu as besoin de support humain ? » | le fond de la bande | — |

**Laissée telle quelle** : Conception › Alignement. Sa barre (bande d'outils › couple bibliothèque-sélecteur)
est celle de l'esquisse 67, approuvée au lot 3 ; le reste est canevas et palettes, des cadres à fonction.

## 3. Les pages conformes dès que le panneau part

Conception › Mon matériel, et Productions, Grilles, Échelles, Cartouches, Pratiques quand rien n'est ouvert ;
Évaluation › Annoter (vide, voir § 4) ; Suivi › Groupe (cartes de graphiques), Interventions, Rencontres ; Labo › Modélisation, Rythme, Études, Suivi
longitudinal ; Réglages › À propos ; l'Aide (Commencer, Cadre, Conception, Évaluation, Suivi, Labo, Référence),
**si** les alertes dans ses accordéons sont des cadres à fonction (question 1).

## 4. À savoir pour l'étape 2

- **Contraste en clair** : sans le panneau blanc, le texte discret (`--texte-muted`, #666677) passe sur le bleu
  pâle de la page (#d4e6f5) à **4,40:1**, sous le seuil de 4,5:1. Le texte principal (5,71:1 pour le secondaire)
  et l'accent (4,99:1) tiennent. À l'étape 2, j'assombris le texte discret du thème clair juste assez pour
  passer le seuil (une couleur, pas un texte). Le thème sombre tient partout.
- **Annoter** : mesurée vide. Avec une copie, la page a deux blocs teintés (`bloc-section`) autour de la copie
  et de la grille ; je la mesurerai à l'étape 2 avec une copie de test.
- **Un reste du lot 3, à moi de le finir** : sur Préparer et Exporter, un filet de 52 px reste sous le « i » de
  l'aide (la bordure du titre masqué). Je le retire à l'étape 2.
- 26 de ces sous-cadres sont des fonds écrits dans la page elle-même (`style="background: var(--bleu-tres-pale)"`,
  surtout Pratiques et Préférences) plutôt que dans un composant : ils partent un par un.

## 5. Une question pour Grégoire

**Question 1 — Les alertes et encadrés d'information** (fond teinté et filet de couleur à gauche : « À vérifier »,
« Important — les données de tes étudiant·es… », les encadrés de guidage de la démo). La règle ne les nomme pas.
Dans une carte, ils font un deuxième niveau (Aide, Trimestre, Données, Productions).

- **(a) Ce sont des cadres à fonction : ils restent partout** (recommandé). Leur couleur dit quelque chose
  (attention, information) ; sans fond, on ne les distingue plus du texte.
- (b) Dans une carte, ils perdent leur fond et gardent seulement leur filet de couleur à gauche.

## 6. Décisions reçues à l'étape 2

- **Question 1 : (a).** Les alertes (attention, information, succès, erreur) et les encadrés de guidage de la
  démo sont des cadres à fonction : ils restent partout, tels quels. Les autres encadrés teintés (le violet de
  « Ressources partageables », les astuces du Bilan, « Outil en développement ») partent comme classés au § 2.
- **La pastille pleine est réservée aux étapes à faire** (Grégoire, sur la première capture de Préparer). Dans
  un bloc d'explication, le chiffre reste, sans disque, à au moins 4,5:1 sur le fond de la page. À reprendre
  sur toute autre page où une explication numérotée voisine de vraies étapes. Fait sur Préparer (`056275301`).
