# Consigne – Les bibliothèques de la Conception : un menu déroulant à la place de la barre latérale (lot 1, #1147)

> Écrite par Cowork le samedi 24 octobre 2026 à 12 h 15 (Toronto), sur `main` = `445e19d9`. Plan : `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md` (lot 1 sur 4). Maquette validée par Grégoire, version « Menu déroulant » : https://claude.ai/artifact/VXgfAqHD1Aose5nnF9rLbX (le bouton « Version » en haut).

## 0. Avant tout

- Rituel de début de session (sous-agent `audit-debut-session`). Aucune suite en arrière-plan.
- Un premier commit de docs seul, fichiers nommés : ce fichier, le plan, `REPERAGE-2026-10-24-bibliotheques.md`, la ligne ajoutée au plan du critère algorithmique, `BACKLOG.md` (#1146 à #1150, « Dernier ID utilisé »).

## 1. Ce que le lot livre, en gestes

Dans **Conception › Productions étudiantes, Grilles de critères, Échelles de performance, Cartouches de rétroaction, Pratiques de notation** :

- Au-dessus de la fiche, **une seule rangée** : « Consulter la bibliothèque », puis un **menu déroulant** de la sélection (ce que la barre latérale montre aujourd'hui : `dansBibliotheque !== false`, mode démo filtré comme aujourd'hui), puis, poussé à droite, « + Nouvelle grille » (… échelle, cartouche, production, pratique).
- Choisir dans le menu ouvre la fiche, exactement comme cliquer une carte de la barre aujourd'hui (même fonction d'ouverture).
- **La fiche prend toute la largeur.** La barre latérale de ces cinq écrans disparaît.
- Les actions de la fiche ouverte (Dupliquer, Supprimer, Fermer… ; #503, `lierActionsAuFormulaire` dans `main.js`) restent en tête de la fiche, à droite. Seul « + Nouvelle … » rejoint la rangée du menu.
- La bibliothèque elle-même ne change pas : la même fenêtre (`BibliothequeUI.creerModal`).

## 2. Décidé

Par Grégoire (24 oct.) :
- le menu plutôt que la bande (12 h 04) ;
- **aucun badge à côté du menu** (12 h 10 : « misons sur la sobriété ») ;
- l'ordre : bouton de la bibliothèque, puis le menu, comme la Carte d'alignement.

Par Cowork (si la mesure les contredit, dis-le dans le rapport plutôt que de les suivre) :
- **Un seul composant pour les cinq écrans**, nouveau fichier à ton choix (ou dans `bibliotheque-ui.js`) : il reçoit la liste, l'objet ouvert, le libellé de l'objet et l'action d'ouverture. Les cinq écrans l'appellent ; le lot 2 (le Cadre) le réemploiera.
- Le menu montre **le nom seul**. Une exception, parce que c'est un état et non une caractéristique : dans Pratiques, la pratique du groupe-cours actif porte « (active) » après son nom (ce que dit aujourd'hui le badge « Active », `pratiques-gestion.js` l. ~144).
- **Aucune fiche ouverte** : première option « Aucune grille ouverte » (… échelle, cartouche, production, pratique), non choisissable.
- **Sélection vide** : le menu cède la place à la phrase d'aujourd'hui. Au passage, « puisez » devient « puise » (tutoiement) dans `grilles.js` l. ~2167 et ses jumelles s'il y en a.
- **Productions** : le tri (`#triProductions`) disparaît avec la barre ; le menu suit l'ordre personnalisé (celui que règlent les chevrons de la liste). Les artefacts d'un portfolio se rangent sous leur portfolio (`optgroup`) si la barre les groupe aujourd'hui ; sinon, à plat. Mesure d'abord.
- La Carte d'alignement n'est pas touchée. Si son couple bouton + menu diffère visiblement du nouveau, signale l'écart, ne le corrige pas dans ce lot.

## 3. Où (mesuré par Cowork en lecture, à revérifier)

- `index.html` : les cinq blocs `layout-sidebar-2col` — Productions (l. ~4617), Grilles (~4978), Échelles (~5176), Cartouches (~5306), Pratiques (~5528) — et leur rangée d'actions en tête de `zone-principale`.
- Les listes : `js/productions-liste.js` (`afficherListeProductions`, `#sidebarListeProductions`), `js/grilles.js` (`afficherListeGrilles` l. ~2146, `#sidebarListeGrilles`, `definirGrilleActive`, `ouvrirGrilleDepuisListe`), `js/echelles.js` (l. ~960), `js/cartouches.js` (`#listeCartouchesBanque`, l. ~3247), `js/pratiques-gestion.js` (`#sidebarListePratiques`, l. ~143).
- `styles.css` : `.layout-sidebar-2col`, `.sidebar-navigation`, `.sidebar-item*` (l. ~9456-9620) ; la règle à 1200 px de la palette du critère algorithmique (l. ~3510), qui règle aussi le `top` de `.sidebar-navigation`.

## 4. Pièges connus

1. **La barre latérale sert ailleurs** : CoP › Outils d'animation (`index.html` l. ~8199), le profil étudiant (`profil-etudiant-sections-affichage.js`), `objectifs.js`, `boite-outils.js`. Ne retire du CSS que ce que plus personne n'emploie : un `grep` avant chaque retrait. Ce qui n'a plus d'objet part (zéro dette), ce qui sert encore reste.
2. **L'objet ouvert depuis un autre onglet** (« Apporter mon matériel » ; lot 3b1 du 17 oct., la liste redessinée 100 ms après l'ouverture) : le menu doit montrer l'objet ouvert après ce redessin.
3. **Dix-neuf fichiers d'essai** citent les identifiants des barres (`sidebarListeGrilles`, `sidebar-item`…). Ils suivent le code : un essai qui cliquait une carte choisit dans le menu. Aucun essai supprimé sans le dire dans le rapport.
4. La règle collante à 1200 px (`body:has(.palette-algo)`) a deux sujets ; celui de `.sidebar-navigation` n'a plus d'objet sur l'écran des grilles. La palette, elle, ne bouge pas dans ce lot.
5. iPad : le menu natif de Safari ; cibles de 44 px au moins.
6. Sécurité : les noms passent par `textContent` ou `echapperHtml` (règle 1) ; `data-on-change`, aucun handler inline (règle 2).
7. **Stock** : aucune donnée ne change, c'est de l'affichage. Rien à migrer : dis-le dans le rapport.

## 5. Preuve exigée

- Vitest du composant : les options, l'option « Aucune … ouverte », « (active) », un nom piégé (`<img onerror>`) rendu en texte. Break-test.
- Playwright, pour chacun des cinq écrans : choisir dans le menu ouvre la fiche ; « + Nouvelle … » crée et le menu la montre choisie ; Fermer remet « Aucune … ouverte ». WebKit (iPad) au moins pour Grilles.
- Captures de l'écran Grilles à 1440, 1180 et 820 px, jointes à la demande de relecture.
- Ce qu'une machine ne peut pas éprouver (le menu natif sur l'iPad réel) : skill `portes-terrain` (Claude Code écrit la trace, Cowork publie la page).

## 6. Ce qui n'entre pas

Le Cadre (lot 2), les chaînes d'étapes et leur option (lot 3), le critère algorithmique (lot 4), les tampons (exclus), la Carte d'alignement.

## 7. Clôture

- #1147 cochée dans le même commit que le code.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-bibliotheques-menu-conception.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
