# Consigne du jour – carte d'alignement, lots 1 et 2 : le menu « Vue » ; le planificateur vertical et ses dates

> Écrite par Cowork le 8 octobre 2026 à 18 h 03 (Toronto, mesurée par `date`). Remplace la consigne du lot 7 de l'enregistrement, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-08-enregistrement-lot-7-976.md`.

## Où on en est

1.191.1 est en ligne (Netlify à 16 h 49) ; porte de #976 passée à 17 h 59. **Chantier de l'enregistrement clos** (décision de Grégoire, 8 oct.). **Chantier de la carte d'alignement ouvert.** Lis d'abord :
- `plans de travail/PLAN-2026-10-08-chantier-carte-alignement.md` — propositions de Grégoire, **et surtout ses décisions après la mesure** (fin du fichier) ;
- `plans de travail/MESURE-2026-10-08-barre-carte-alignement.md` — la mesure du lot 0.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork (cette consigne, son archive, le plan, la mesure du lot 0, la consigne du lot 0), à écrire dans `BACKLOG.md` et `SUIVI-BUGS.md`, et à faire la release sur `main` local. **Pas de push avant la relecture de Cowork.**

## 0 · Avant tout

Si le résultat de la sonde de Mathieu (#1038) est arrivé dans `Retours des testeurs/`, arrête-toi et dis-le en une ligne.

## 1 · Lot 1 – le menu « Vue »

Décisions de Grégoire (plan, fin) :
- Un nouveau menu **« Vue »** dans la barre de la carte. Dans l'ordre : **« Vue plein écran »** (remplace l'icône des flèches vers l'extérieur, `planif-btn-plein-ecran`), **« Recentrer la carte »** (remplace le double cercle, `planif-btn-recentrer`), **« Tout voir »** (remplace les flèches vers l'intérieur, `planif-btn-tout-voir`) ; puis un sous-titre **« Fond du canevas »** avec les couleurs (même modèle que le menu « Annoter » d'« Annoter et évaluer ») ; puis **les raccourcis clavier**, en bas du menu.
- **Retirés de la barre** : la palette des couleurs de fond (`planif-btn-fond`), les trois icônes ci-dessus, la palette indépendante des raccourcis (`planif-palette-raccourcis-btn`, `planif-raccourcis-panel`). Zéro-dette : retire ce qui est remplacé, sans alias.
- **Chaque raccourci affiché marche dans Chrome et Safari.** Un raccourci pris par le navigateur (⌘1, probablement : vérifie-le) est remplacé par une touche libre, de ton choix, affichée telle quelle. Les descriptions inexactes de la mesure (⌘0, « Ctrl+Z » du bouton « Annuler ») sont corrigées ; les huit raccourcis qui marchent sans être décrits entrent dans la liste.
- Trouvailles du lot 0 à régler ici : « Recentrer » branché deux fois ; les deux couleurs de fond (carte et Annoter) inscrites à `docs/DATA-OWNERSHIP.md`.
- Le menu se manie au clavier et sur l'iPad (cibles tactiles), selon `design-system.html`.

## 2 · Lot 2 – le planificateur vertical et ses dates

- **Retire la présentation horizontale** (la réserve « Non planifié » à gauche de la grille) et son bouton. Un usager qui l'avait choisie retombe sur la verticale : **rien n'est effacé**, sa préférence cesse d'être lue (dis la clé dans ton rapport).
- À côté du titre « PLANIFICATEUR » : les dates **« Début du trimestre »** et **« Fin du trimestre »** du Cadre. Forme : « PLANIFICATEUR · du 25 août au 19 décembre 2026 » (année une fois si les deux dates sont la même année ; sinon les deux).
- Si elles manquent : « Les dates du trimestre ne sont pas entrées. Ajoute-les dans Cadre › Trimestre. », où « Cadre › Trimestre » est un lien qui ouvre cette section. Cela remplace l'avis actuel qui renvoie vers « Réglages » (trouvaille du lot 0).

## 3 · Mots

Les mots ci-dessus sont arrêtés. **Propose à part, non écrits ailleurs que dans le code**, ceux qui manquent : le libellé de chaque raccourci dans le menu, le nom de la touche qui remplace ⌘1, la ligne des Nouvelles. Ils passent par Grégoire avant la release.

## 4 · Tests

Bancs avec break-test : le menu « Vue » et ses trois commandes ; chaque raccourci de la liste déclenche ce qu'il dit (un test par raccourci, au navigateur) ; la couleur de fond choisie dans le menu s'applique et se garde ; plus de bouton horizontal, une préférence horizontale enregistrée mène à la verticale ; les dates s'affichent, l'invitation et son lien quand elles manquent. Specs voisins de la carte, Vitest complet. Noms manifestement fictifs.

## 5 · Puis arrête-toi

Commits séparés par lot. **Pas de release avant les mots** : rapport à Grégoire, relecture de Cowork, mots, release minor, verdict (Chrome et Safari fermés), push.

## Ton rapport à Grégoire

En gestes d'utilisateur, numéros entre parenthèses en fin de ligne. Le geste à l'écran, en démo dans une fenêtre privée. Ce que tu as supposé, une ligne par supposition.
