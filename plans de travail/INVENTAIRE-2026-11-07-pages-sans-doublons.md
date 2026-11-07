# Inventaire — lot « Les pages sans doublons », étape 1 (7 nov. 2026)

Sans code. Soumis à Grégoire ; l'étape 2 attend son accord. Écrit par Claude Code (relevé des textes : un agent en
lecture seule, vérifié par sondage ; mesure du témoin : banc WebKit). Branche `lot/en-tete-epure`, HEAD `ed5ecef3b`.

**Ce qui manque** : la consigne du lot lui-même. Je n'ai reçu que les ajouts de Cowork (§ A, B et C ci-dessous). Si le
lot a une première partie, l'inventaire n'est pas complet tant que je ne l'ai pas.

## Vue d'ensemble

| Partie | Nombre | À l'étape 2 |
|---|---|---|
| A. Renvois d'onglet par l'ancien libellé long | 160 (Aide 76, visite 7, infobulles 7, glossaire 70) | remplacement mécanique par le libellé court |
| B. Mentions de l'en-tête ou de l'accueil d'avant | 18 (Aide 11, glossaire 7) | **des phrases à réécrire** : tes mots (question 2) |
| C. Pages où le témoin flottant couvre un bouton ou un champ | 20 en haut de page ; presque toutes en défilant | une place dans la page (question 1) |
| Ambiguës | une quarantaine | **laissées telles quelles** par défaut (question 3) |

## Les questions

1. **Le témoin (C)**. La mesure montre qu'en faisant défiler, il couvre quelque chose sur presque toutes les pages :
   déclarer une place page par page en ferait une trentaine. Deux voies :
   - **(a) Une règle commune** *(recommandée)* : sous 780 px, le « Non enregistré » se pose sous le titre de la page
     affichée, et revient à l'écran s'il n'y est pas ; les présences gardent leur place au-dessus de « ← Précédent ».
   - **(b) Une place choisie page par page**, pour les 20 pages couvertes en haut de page.
2. **Les phrases devenues fausses (B)** : prendre les reformulations proposées au § B (colonne « proposé »), ou tu
   les écris toi-même ?
3. **Les ambiguës** : les laisser telles quelles (elles nomment un outil, une carte de l'Aide ou le sens courant) ?
4. **« dans Suivi du groupe »** sans la section devant (6 cas, p. ex. Aide 10800) : « dans Groupe » se lit mal.
   Écrire « dans Suivi › Groupe » (deux mots de plus), ou « dans Groupe » ?
5. **La fenêtre d'aide « Données démo »** (popup `accueil-donnees-demo`) n'est plus ouverte par rien depuis le retrait
   de la case : la rattacher à un « i » près d'« Explorer », ou la retirer ?

## A. Renvois d'onglet par l'ancien libellé long → libellé court

Règle de l'étape 2 : seul le libellé change, « sans autre changement de texte ». Le glossaire : « le bouton
Assistance de l'en-tête » devient « la ligne Assistance du menu » (consigne). Numéros de ligne relevés le 7 nov. sur
`ed5ecef3b` (± 1).

### Aide (`index.html`, section Aide ; `js/accompagnement-contenu-popup.js`) — 76

| Ligne | Ancien → court |
|---|---|
| 9882, 10126, 10620, 11108 | Pratiques de notation → Pratiques |
| 9896, 10718, 10756, 10800, 11230 | Suivi du groupe → Groupe (10800 : voir question 4) |
| 9930, 10209 | Carte d'alignement → Alignement |
| 9995, 10433, 10722, 10741, 10758, 10848, 10854, 10883, 10900, 10916, 10918, 11032, 11058, 11084, 11378 | Outils d'observation → Observation |
| 10078 | Calendrier scolaire → Calendrier ; Saisie des présences → Présences |
| 10133, 10191, 11371 | Productions étudiantes → Productions |
| 10230, 10279 (×3), 10285, 10298, 10334, 11086, 11090 | Grilles de critères → Grilles |
| 10279, 10378, 10484 | Échelles de performance → Échelles |
| 10255 | Apporter mon matériel → Mon matériel |
| 10497 | Cartouches de rétroaction → Cartouches |
| 10523 | Préparer et importer → Préparer |
| 10535, 10537, 10577, 10622, 10640 | Annoter et évaluer → Annoter |
| 10537, 10556, 10605, 10624, 10659 | Liste des évaluations → Liste |
| 10685 | Exporter les travaux → Exporter |
| 10816, 11407 | Saisie des présences → Présences |
| 10839 | Profils individuels → Profils ; Liste des étudiant·es → Étudiant·es (« de Liste » devient « d'Étudiant·es ») |
| 11034, 11106 | Exploration des pratiques → Exploration |
| 11035 | Rythme de travail → Rythme |
| 11037, 11137 | Bilan réflexif → Bilan |
| popup 158, 789 | Grilles de critères → Grilles |
| popup 287, 789 | Outils d'observation → Observation |
| popup 497 | Annoter et évaluer → Annoter |
| popup 589 | Préparer et importer → Préparer |
| popup 1014 | Carte d'alignement → Alignement |
| popup 1262, 1277 | Suivi du groupe → Groupe (fenêtre orpheline, question 5) |

### Visite guidée (`js/accompagnement.js`) — 7

| Ligne | Ancien → court |
|---|---|
| 1146 | Apporter mon matériel → Mon matériel |
| 1163 (×3) | Suivi du groupe → Groupe (×2) ; profils individuels → profils |
| 1170 | titre de l'étape « Carte d'alignement (optionnel) » → « Alignement (optionnel) » |
| 1179 | Outils d'observation → Observation |
| 1200 | titre court du bouton « Suivant : Carte d'alignement » → « Suivant : Alignement » |

### Infobulles (`js/accompagnement-contenu-hover.js`) — 7

| Ligne | Ancien → court |
|---|---|
| 180 | Suivi du groupe → Groupe |
| 285, 497, 891, 909 | Grilles de critères → Grilles |
| 320, 909 | Échelles de performance → Échelles |

### Glossaire (`js/accompagnement-contenu-terme.js`) — 70

Surtout les renvois « voir : Section › Onglet » au bas de chaque terme.

| Ancien → court | Lignes |
|---|---|
| Grilles de critères → Grilles | 99, 109, 131, 140, 149, 167, 178, 187, 197, 539, 579, 588, 598 |
| Productions étudiantes → Productions | 72, 81, 90, 197, 539 |
| Pratiques de notation → Pratiques | 81, 215, 242, 466, 475, 484, 493, 502, 539, 607 |
| Échelles de performance → Échelles | 119, 158, 357, 539 |
| Cartouches de rétroaction → Cartouches | 206, 539 |
| Annoter et évaluer → Annoter | 224, 233, 242, 251, 376, 385, 616 |
| Saisie des présences → Présences | 260, 616 |
| Suivi du groupe → Groupe | 270, 280, 290, 299, 309 |
| Liste des étudiant·es → Étudiant·es | 309, 318 |
| Outils d'observation → Observation | 317, 318, 347, 367 |
| Profils individuels → Profils | 376, 394, 403 |
| Carte d'alignement → Alignement | 412, 421, 430, 439, 448, 457 |
| Bilan réflexif → Bilan | 529 |
| Exploration des pratiques → Exploration | 549, 557, 558, 567 |
| Liste des évaluations → Liste | 624, 625 |

## B. Mentions de l'en-tête ou de l'accueil d'avant — des phrases à réécrire (question 2)

| Où | Ce qu'il dit | Proposé |
|---|---|---|
| Aide 9878 | « Données démo, une case de la page d'accueil » | « Explorer, un bouton de la page d'accueil (porte « Tu es conseiller·ère pédagogique ? ») » |
| Aide 9879 | « Visite guidée, un bouton de l'en-tête » | « une ligne du menu de l'en-tête » |
| Aide 9880 | « Assistance, une case de la page d'accueil et un bouton de l'en-tête » | « la ligne Assistance du menu, avec son interrupteur » |
| Aide 9896 | « Cocher « Données démo » sur la page d'accueil ouvre un cours fictif » | « Le bouton « Explorer » de la page d'accueil ouvre… » |
| Aide 9899 | « « Quitter la démo » dans le bandeau, ou décoche « Données démo » » | retirer « ou décoche… » : on sort par le bandeau seulement |
| Aide 9913 | le bouton au masque « parmi les icônes de la première ligne de l'en-tête (sur un écran étroit : menu ⋯ › « Anonymisation ») » | « collé à droite du groupe, dans la bande du groupe » (le menu ⋯ n'existe plus) |
| Aide 11234 | « Signaler un bug ou donner ton avis », dans l'en-tête | « Signaler », dans le menu de l'en-tête |
| popup 1258-1262 | fenêtre « Données démo » : « Coche « Données démo » : elle s'ouvre… » | « Clique « Explorer » » — et question 5 |
| popup 1293 | « cocher ou décocher la case ne touche jamais… ou décoche « Données démo » » | « entrer dans la démo ou en sortir ne touche jamais… » ; retirer « ou décoche… » |
| popup 1618 | « une pastille rouge sur l'icône d'accueil » (Nouveautés) | « sur le lien « Nouveautés », au pied de l'accueil » |
| Glossaire 510 | « par le bouton « Assistance » de l'en-tête, ou par la case « Assistance » de la page d'accueil » | « par la ligne Assistance du menu » (consigne) ; retirer la seconde proposition |
| Glossaire 511 | voir : « Accueil · En-tête › Assistance » | « En-tête › Menu › Assistance » |
| Glossaire 519 | « le relancer depuis le bouton « Visite guidée » de l'en-tête » | « depuis « Visite guidée », dans le menu de l'en-tête » |
| Glossaire 520 | voir : « En-tête › Visite guidée » | « En-tête › Menu › Visite guidée » |
| Glossaire 689-690 | le bouton au masque « dans l'en-tête » ; voir « En-tête › Anonymisation » | « dans la bande du groupe » |
| Glossaire 698 | « Une case de la page d'accueil : un cours fictif déjà configuré… » | « Le bouton « Explorer » de la page d'accueil : … » |

Vérifiées et toujours justes : le bouton « Codex » de l'en-tête (Aide 11170, glossaire 672), la porte « Tu es
orthopédagogue ? » (Aide 10980), la visite guidée relancée « depuis le menu, en haut à droite » (visite 1131).

## C. Le témoin « Non enregistré » resté flottant, à 360 et 390 px

Banc WebKit, données de la démo, chaque page ouverte en haut puis défilée de 100 px en 100 px ; « couvert » = un
bouton, un lien, un champ ou une liste sous le témoin (le bandeau de la démo exclu).

| Section › page | En haut, 360 / 390 | En défilant, 360 / 390 | Exemples |
|---|---|---|---|
| Conception › Alignement | 4 / 4 | 8 sur 8 / 8 sur 8 | « Consulter la bibliothèque » |
| Conception › Productions, Grilles, Échelles, Cartouches | 3-4 / 2-3 | toutes les positions ou presque | « Consulter la bibliothèque », le menu de l'élément ouvert |
| Conception › Pratiques | 1 / 0 | 1 sur 1 / 0 | « + Nouvelle pratique » |
| Cadre › Trimestre | 4 / 4 | 6 sur 6 / 5 sur 5 | sélecteur du trimestre, « + Nouveau » |
| Suivi › Groupe | 0 / 1 | 11 sur 40 / 11 sur 37 | « Détails » |
| Suivi › Étudiant·es | 1 / 3 | 10 sur 14 / 9 sur 13 | filtre des groupes |
| Suivi › Profils | 4 / 4 | 5 sur 24 / 4 sur 23 | « Étudiant·e précédent·e » |
| Suivi › Interventions | 2 / 0 | 1 sur 2 / 0 | « Planifier une intervention » |
| Suivi › Rencontres | 1 / 0 | 1 sur 1 / 0 | « Créer un service » |
| Suivi › Animation | 3 / 2 | 6 sur 6 / 5 sur 5 | « Questions flash », « Tirage au sort » |
| Évaluation › Liste | 0 / 2 | 8 sur 65 / 7 sur 63 | filtres |
| Évaluation › Exporter | 0 / 2 | 9 sur 11 / 8 sur 9 | sélecteurs d'archivage |
| Labo › Observation | 2 / 1 | 43 sur 55 / 39 sur 53 | « Guide », réglages SOLO |
| Labo › Exploration | 1 / 2 | 11 sur 32 / 10 sur 29 | « Dériver une maquette » |
| Labo › Rythme | 2 / 4 | 12 sur 15 / 9 sur 12 | champs de date et d'heure |
| Labo › Études | 1 / 0 | 1 sur 12 / 0 | un champ |
| Labo › Bilan | 3 / 4 | 13 sur 20 / 11 sur 18 | titre, préambule |
| Aide › Référence | 4 / 3 | 3 sur 3 / 1 sur 2 | filtres « Tous », « Numérisation » |
| Réglages › Préférences | 2 / 3 | 13 sur 20 / 10 sur 17 | réglages |
| Réglages › Données | 0 / 1 | 12 sur 20 / 12 sur 18 | « Ouvrir un Codex… » |
| Réglages › À propos | 1 / 1 | 20 sur 53 / 17 sur 47 | « Soutenir le projet » |
| Accueil ; Cadre › Calendrier ; Conception › Mon matériel | 0 / 0 | 6 à 23 positions | cartes, jours du calendrier |
| **Jamais couvert** : Évaluation › Préparer et Annoter, Labo › Modélisation et Suivi longitudinal, Aide (sept pages sur huit) | 0 / 0 | 0 | — |
| Suivi › Présences | dans la page (#1240) | — | — |

Réserve : la mesure suit le contenu de la démo ; une page plus remplie (Annoter avec une copie ouverte) peut être
couverte ailleurs.

## Trouvailles en chemin

1. **Trois infobulles sans déclencheur** (`nav-construction`, `nav-presences`, `nav-tableau-bord`,
   `accompagnement-contenu-hover.js` ~730-766) : rien ne les affiche (vérifié : aucune référence hors du catalogue).
   **Signalé, non inscrit** (aucun symptôme vécu ; règle d'entrée au BACKLOG du 24 août).
2. **La fenêtre d'aide « Données démo »** sans déclencheur : question 5.
