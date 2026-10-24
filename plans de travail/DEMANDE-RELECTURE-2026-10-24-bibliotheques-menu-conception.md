# Demande de relecture – les bibliothèques de la Conception en menu déroulant (lot 1, #1147)

> Claude Code, samedi 24 octobre 2026 (Toronto). Pour Cowork (`PROTOCOLE.md`). Consigne exécutée : `CONSIGNE-LOT-2026-10-24-bibliotheques-menu-conception.md` ; plan `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md`, lot 1.
> Commits sur `main`, **non poussés** : `856e46da` (les documents de Cowork, seuls, § 0), puis le lot. `main` porte aussi les 9 commits de la matinée, non poussés. Pas de release, ni verdict complet, ni push (consigne § 7).

## 0. Ce que la mesure a contredit (consigne § 2 : « dis-le plutôt que de les suivre »)

| Décision de Cowork | Mesuré | Ce que j'ai fait |
|---|---|---|
| Productions : le tri disparaît avec la barre | Grégoire s'en sert : #930 (22 sept.) est son rapport sur le tri « par date d'échéance ». Et le tri ne marchait pas : `trierListeProductions` vit dans l'IIFE de `productions.js` et n'a jamais été exposé, donc changer d'ordre ne redessinait rien (le dispatcher avertit « Fonction non trouvée »). | **Gardé**, dans la rangée, entre le menu et « + Nouvelle production ». Il ordonne le menu. Exposé sur `window` (une ligne). |
| Le menu montre le nom seul ; une exception, « (active) » | « À planifier » (#486) est aussi un **état** (sans échéance : absente du calendrier et des indices C et P), et le commentaire de #486 dit que la barre était le seul endroit où il se voyait sans ouvrir la fiche. | « (à planifier) » après le titre, par ta règle « un état, pas une caractéristique ». La marque « Diagnostique » (#1055) est une caractéristique : partie du menu, la Liste des évaluations la garde. **À trancher par toi ou Grégoire si ma lecture de ta règle est trop large.** |
| Artefacts sous leur portfolio (`optgroup`) si la barre les groupait | La barre ne les groupait pas. | À plat, dans l'ordre personnalisé. |
| « Fermer remet Aucune … ouverte », cinq écrans | Pratiques n'a pas de « Fermer » (seulement Dupliquer, Supprimer). | Rien ajouté. Le banc éprouve, pour Pratiques, le retour à l'écran (l'initialisation referme la fiche). |
| « + Nouvelle … crée et le menu la montre choisie », cinq écrans | « + Nouvelle pratique » ouvre l'assistant, qui ne rouvre pas la pratique créée (`wizard-pratique-v2.js`, fin de création) : elle paraît dans le menu, non choisie, comme elle paraissait dans la barre. | Inchangé. Le banc éprouve l'ouverture de l'assistant, et « Dupliquer », qui montre la copie choisie. |
| La palette du critère algorithmique ne bouge pas dans ce lot | Sans la barre, le gabarit prend toute la largeur : à 1180 px (iPad paysage) il mesure 975 px, au-delà du seuil compact (753 px). La palette passe donc sur le côté, où elle **défilait hors de l'écran** (−622 px après 1 700 px de défilement, WebKit), parce que le collage ne vaut qu'à partir de 1 200 px. | Seuil du collage descendu de 1 200 à **1 025 px** (`styles.css`, la règle `body:has(… .palette-algo)`). Raison du seuil d'origine : les sous-navigations mobiles, qui vivent sous 1 024 px ; mesuré, elles ne paraissent pas à 1 180. Le dessin de la palette n'a pas changé. |

## 1. Le lot

- **Le composant** : `js/menu-selection.js` (`MenuSelection.rendre`, `.marquer`, `.choisir`). Il reçoit la liste (déjà filtrée par l'écran), l'objet ouvert, les libellés (« Aucune grille ouverte », « Grille ouverte » pour le lecteur d'écran, la phrase de la sélection vide) et la fonction d'ouverture, celle qu'appelait le clic sur une carte. Le choix passe par `data-on-change="MenuSelection.choisir"`. Après un choix, le menu se recale sur le dernier objet marqué : une ouverture refusée (une création en cours qu'on garde) ramène le menu à la fiche d'avant.
- **La rangée** (`index.html`, cinq écrans) : `.rangee-selection` avec le bouton de la bibliothèque, l'emplacement du menu, « + Nouvelle … » (`.rangee-selection-nouveau`, poussé à droite). Les actions de la fiche (#503) restent dans leur rangée, en tête de la fiche, à droite ; cette rangée disparaît quand elle est vide (`.rangee-fiche-actions`).
- **Les cinq écrans** appellent `MenuSelection.rendre` dans leur `afficherListe…`, et `MenuSelection.marquer` là où ils surlignaient la carte (ouverture, création, fermeture). Fermer une échelle ou une cartouche **ne dé-surlignait pas** la carte avant ce lot ; le menu, lui, revient à « Aucune … ouverte ».
- **Mots** : les messages d'accueil disent « Choisis une grille dans le menu ou crée une nouvelle grille ». « Puisez » devient « puise », dans les quatre écrans qui le disaient. Une quarantaine de textes de la bibliothèque disaient « barre latérale » (« Retirer de la barre latérale », « Grilles dans la barre latérale »…) : ils diraient faux. Ils disent maintenant « ta sélection », le mot de ton repérage, qui vaut aussi pour le Cadre (lot 2). Les entrées de `changelog-data.js` (historique) n'ont pas été touchées.
- **iPad** : un `<select>` natif ignore `min-height` sous WebKit (23 px mesurés). Patron du registre longitudinal et de `.select-nav-mobile` : hauteur 44 px, apparence retirée, chevron redessiné. Sous 760 px, le menu prend sa ligne ; entre les deux, il rétrécit de 380 à 200 px avant que la rangée ne se replie.

## 2. Ce qui est parti (zéro dette ; un `grep` avant chaque retrait)

- `index.html` : les cinq `layout-sidebar-2col` / `sidebar-navigation` de la Conception. Ceux de la CoP et du profil restent.
- `styles.css` : `.item-cartouche-banque`, `.sidebar-item-activite`, `.badge-pratique-active` (deux règles), `.badge-a-planifier`, `.sidebar-vide`, `#listeCartouchesBanque`, la ligne `.sidebar-navigation` de la règle collante à 1 200 px. `.sidebar-item*`, `.sidebar-liste`, `.layout-sidebar-2col` servent encore (CoP, profil, objectifs, boîte à outils).
- JS : `genererBadgeCaracteristiques` (pratiques-gestion), `definirProductionActive` (productions.js, déjà sans appelant). `exporterProductionActive` (sans appelant, mesuré) lisait la carte surlignée : il lit maintenant `productionEnEdition`.
- `etats-vides.js` reconnaissait une section peuplée à ses cartes `-item` : un menu n'en a pas. Ajouté : `.rangee-selection-menu` (contenu), `.rangee-selection-vide` (à la place de `.sidebar-vide`).
- `design-system.html` : un spécimen de la rangée (modes sombre et clair), section 15.

## 3. Les pièges de la consigne (§ 4)

1. Barre latérale ailleurs : CoP, profil, objectifs, boîte à outils, intactes.
2. L'objet ouvert depuis « Apporter mon matériel » : le menu reçoit l'objet ouvert au rendu (`idOuvert`), qui remplace l'ancien `definir…Active` du lot 3b1. Éprouvé (spec, essai « lot 3b1 »).
3. Les essais : **aucun test Vitest supprimé.** Un essai Playwright **retiré** : « Mac · la liste des grilles colle sous la barre de navigation » (`critere-algorithmique-palette.spec.js`) — son sujet n'existe plus. Recalés sur le menu : 12 specs Playwright, 14 fichiers Vitest et les deux chargeurs. Deux bancs Vitest avaient des doublures qui ne connaissaient pas `MenuSelection` : les deux chargeurs (`charger-script.js`, `bac-suivi.js`) chargent le vrai module, comme ils le font pour `ProductionDiagnostique`. Deux cliquets descendent : #467 (interpolations nues, −12 sur cinq fichiers), complexité (452 → 450).
   ⚠ **Course dans deux specs (717, 1007)** : `afficherSousSection` lance l'initialisation de l'écran 100 ms plus tard (`navigation.js`), qui referme la fiche. L'ancien clic sur une carte l'attendait par construction (la barre redessinée) ; `selectOption` non. Les specs attendent 300 ms avant de choisir. Aucun changement pour l'enseignant (mesuré sur le code d'avant : verts ; après, sans l'attente : rouges, la fiche refermée).
4. La règle collante : voir § 0, dernière ligne.
5. iPad : 44 px, menu natif. Voir § 4.
6. Sécurité : le menu se construit en chaîne, chaque nom, identifiant et libellé passe par `echapperHtml` (les doublures des bancs lisent `innerHTML`) ; `data-on-change`, aucun gestionnaire en ligne ; aucun `console.log`.
7. **Stock** : aucune donnée ne change, c'est de l'affichage. Rien à migrer.

**La Carte d'alignement** (non touchée) : son couple bouton + menu diffère. Pas de bande bleu pâle ; le menu natif fait sa hauteur native sur le Mac (44 px seulement au doigt) ; « Actions ▾ » à la place de « + Nouvelle … ». Signalé, non corrigé.

## 4. Preuves

- **Vitest** : 9 583 sur 9 583, 813 fichiers. `tests/unit/menu-selection-1147.test.js` (12 essais, JSDOM, module réel) : les options, « Aucune … ouverte » non choisissable, « (active) », la sélection vide, le choix (identifiant d'origine, refus, menu redessiné), un nom piégé `<img onerror>` dans l'option, l'identifiant et les libellés. **Break-tests**, chacun rouge puis le module restauré : nom non échappé (X.a), pas de recalage après refus (C.b), « Aucune » choisissable (O.b), suffixe perdu (E.a).
- **Playwright (WebKit)** : `tests/integration/bibliotheques-menu-1147.spec.js`, 13 essais verts. Pour chacun des cinq écrans : la rangée (ordre, « + Nouvelle » à droite, fiche pleine largeur, 44 px, plus de barre), « Aucune … ouverte », choisir ouvre la fiche, « Fermer » (ou le retour, Pratiques) remet « Aucune … ». « + Nouvelle … » crée et le menu montre la création choisie (grille, échelle, cartouche, production). Pratique : l'assistant, « Dupliquer », « (active) ». Lot 3b1. Le tri réordonne le menu. iPad portrait (820 px, tactile) pour Grilles. **Rouges avant correctif** : les 44 px (23 px mesurés), le tri (rien ne bougeait), la palette iPad paysage au seuil de 1 200 px (break-test fait).
- Specs recalés et voisins : 69 + 27 verts (dernières passes, `--retries=0`).
- **Non fait** : le verdict Playwright complet (> 10 min), ni GitHub (Linux). La consigne le réserve au signal de Grégoire.
- **Captures** : `plans de travail/captures-2026-10-24-bibliotheques-menu/` — Grilles à 1440, 1180 et 820 px (aucune fiche, fiche ouverte), Productions aux trois largeurs (aucune fiche).

## 5. Portes terrain

`PORTES-TERRAIN-2026-10-24-bibliotheques-menu.md` : **aucune porte due**. Règle 2 du skill : de l'affichage, aucune donnée, un raté se corrige quand Grégoire le signale. Ses angles morts y sont dits (le sélecteur natif de l'iPad réel, Safari réel). Cowork : rien à publier, sauf si tu juges autrement.

## 6. Trouvailles (trois issues)

- **Commenter et oublier** : `afficherListePratiquesSidebar` (`pratiques.js`) écrit dans `#listePratiquesSidebar`, qui n'existe plus dans `index.html` : code mort antérieur, sans effet. Non touché, hors lot.
- **À ton jugement** (pas au BACKLOG, faute de symptôme vécu) : après « Créer la pratique », l'assistant ne rouvre pas la pratique créée. Les quatre autres écrans le font.
- **Résidus** : trois worktrees sans travail en avance (`fix-anonymisation`, `tampons-doigt`, `verdict-morceaux-2`), relevés par le rituel de début.
