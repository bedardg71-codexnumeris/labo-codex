# Rapport : « Parcours : trois défauts vécus par Grégoire » (27 novembre 2026)

Session Claude Code dans le nuage, mandat du 27 nov. Branche `lot/parcours-2026-11-27`, partie de `lot/file-sans-gregoire-2026-11-27` à `951de3f8`. **Aucune fusion, aucun bump, rien au changelog. Aucun texte de bulle ni aucun autre texte lu par l'utilisateur n'a changé.** Fait : les trois fiches, un commit chacune (`b068959d6` fiche 1, `0aa07aaed` fiche 2, `8c1987847` fiche 3). Reste : le verdict du Mac (WebKit), les gestes que seul l'iPad peut juger (dernière section), la fusion, que je ne fais pas.

## Fiche 1 — « Évaluer une première production », une étape déjà faite avance (#1273)

Depuis la réécriture du 20 nov., la grille est la cinquième étape de « Nous faisons » (la pratique vient d'abord). Le défaut mesuré par Cowork tenait toujours : `grilleCreee()` ne comptait que les grilles absentes de l'instantané de « Commencer », et de même la pratique, la cartouche et la production.

**Ce qui change** (décision de Grégoire, 14 h 41) : une pratique, une grille, une cartouche ou une production qui existe à la personne dans le trimestre fait son étape, peu importe quand elle a été créée ; le parcours passe à la suivante. « Commencer » ne pose plus d'instantané de ces quatre collections.

- **« Une grille existe »** : une grille du trimestre réel (la démo est refermée au lancement), hors du matériel que l'application sème (la grille, la cartouche et l'échelle de départ, les gabarits : la liste `IDS_GABARITS_HARDCODES` de `main.js`) et hors de ce que la démo marque (`isDemo`, l'auteur « Demo Labo Codex »). Même règle pour la cartouche, sous quelque grille que ce soit (une cartouche écrite sous la grille de départ compte : elle est à la personne). La pratique : toute pratique du trimestre sauf un gabarit (hors de la démo, une pratique n'est jamais de démo, règle de `bibliotheque-ui.js`). La production : celles du cours actif, hors du portfolio (un contenant, qu'on n'évalue pas).
- **Laquelle est retenue quand il y en a plusieurs** : celle que le parcours retenait déjà, si elle existe encore ; sinon la plus récente (date de création ; à date égale ou absente, la dernière de la liste). La pratique : celle qui s'applique au cours actif, si c'est l'une des siennes ; et l'étape « L'appliquer à ton cours » est faite dès que l'une des siennes s'applique.
- **« Je regarde »** : pas touché. Il se joue dans la démo, où tout existe déjà ; ses fonctions (`grilleCreee`, `productionCreee`, `pratiqueCreee`, `cartoucheCreee`) gardent leur repère. « Nous faisons » a désormais les siennes.

**Deux suppositions, à corriger en dix secondes si elles sont fausses :**
- **L'échelle garde sa règle.** Le mandat ne la nomme pas ; elle compte en partie de la même façon (une échelle née pendant le parcours), mais l'étape se fait par un choix (« Je garde celle-ci ») et une échelle existe toujours, celle de départ. Elle ne bloquait pas. Conséquence : à « Commencer », l'étape de l'échelle se montre toujours.
- **La cartouche que Mon matériel crée avec une grille (une grille avec ses rétroactions) compte maintenant.** Elle était exclue depuis le 9 nov. ; avec « peu importe quand elle a été créée », la garder exclue aurait voulu dire « sauf si elle est née pendant ce passage ».

**L'étape faite mène droit à la première qui reste à faire.** Le moteur avance d'une étape à la fois et ouvre chacune, sa page avec elle. Mesuré sous Chromium (l'espace où le troisième parcours est fait, « Refaire », puis « Je garde celle-ci ») : les cinq étapes déjà faites s'ouvraient l'une après l'autre avant la dernière bulle (`[3, 4, 5, 6, 7, 8, 9]`). Le parcours saute maintenant de lui-même (`[3, 9]`). Le saut ne part que d'une étape vue « à faire » pendant ce passage : une étape revue par le compteur (en visite) ne saute pas. C'est du code que la règle de Grégoire rendait nécessaire ; il est dans le commit de la fiche 1.

**Ce que verra quelqu'un qui a déjà tout** (mesuré sur l'espace du banc, pas sur ses données) : « Nous faisons » s'ouvre sur l'échelle, puis va droit aux consignes de sa production la plus récente du cours actif, ou plus loin si elles sont transmises et qu'une évaluation de cette production est verrouillée. La bulle où il arrive n'a pas de « C'est fait » au-dessus du titre (l'étape d'avant était faite au lancement, la règle de Cowork du 19 nov.).

**La reprise d'un parcours laissé à l'étape 1** (rien n'est réécrit) :
- repère posé depuis le 20 nov. : « Reprendre » le relit tel quel ; ses instantanés des grilles, productions, pratiques et cartouches restent écrits et ne sont plus lus. Le parcours repart de la première étape qui manque d'après ce qui existe : avec une pratique à soi, les bulles 1 et 2 sont faites ; si elle s'applique au cours, la 3 aussi, et il reprend à « Ton échelle de performance », sans « C'est fait » au-dessus du titre. Sans pratique : à la bulle 1, comme avant ;
- repère d'avant le 20 nov. (l'ancienne Pratique guidée ; c'est l'état que Grégoire a laissé le 11 nov., s'il n'a pas relancé depuis) : il est refait, comme avant ce lot, et le même calcul s'applique ;
- dans les deux cas, ce qui s'écrit est ce qui s'écrivait à chaque passage : l'état du panneau et, dans la préférence `parcoursEvaluer`, les identifiants que le parcours retient. Aucune donnée.

**L'autre moitié de #1273, mesurée sans rien changer** : ce n'est plus vrai. « Partir de zéro » n'est plus dans aucun fichier de `js/`, ni dans `index.html` ni `css/` : il vivait dans `TEXTE_1`, la bulle de l'ancienne Pratique guidée, retirée le 20 nov. La bulle 5 d'aujourd'hui nomme « Je la compose ici », son propre bouton (dans la bulle), et seulement dans sa première forme, tant qu'aucune grille collée n'est ouverte ; collée, elle ne nomme plus d'autre voie.

**Source ou stock** : source seulement. Les instantanés déjà écrits dans les préférences restent (morts, sans effet) ; rien ne les efface.

**Preuve** : `tests/unit/parcours-evaluer-ce-qui-existe-1273.test.js`, 20 essais, **11 rouges sur `951de3f8`** (9 gardes vertes avant comme après : ce qui ne doit pas compter, le modèle, ce qui ne doit pas sauter). Break-test sur une copie du code : 16 casses (le matériel semé compté, la démo comptée, un gabarit compté, le portfolio compté, les productions de tout le trimestre, la dernière de la liste au lieu de la plus récente, la pratique appliquée non préférée, la retenue oubliée, l'instantané des grilles remis, le modèle qui compte ce qui existe, la marque de naissance de la production non effacée au lancement ; pour le saut : pas de saut, la visite qui saute, l'arrivée sur une étape qui ne remet rien à zéro, une étape jamais vue à faire, un saut vers la suivante), **toutes prises**. Au navigateur : `tests/integration/nous-faisons-evaluer-ce-qui-existe-1273.spec.js`, rouge avant le saut, vert après. La sentinelle du 20 nov. (`sentinelle-parcours-evaluer-2026-11-09`) est alignée sur le repère neuf. Sous Chromium : `nous-faisons-evaluer-2026-11-20.spec.js` 5 sur 5, `je-regarde-evaluer-2026-11-18.spec.js` 3 sur 3, le nouveau banc 1 sur 1. #1273 cochée au BACKLOG.

## Fiche 2 — « Recevoir les productions », « Nous faisons », « Ta rétroaction » : le verrou déjà posé

**Ce qui change** (tranché par Cowork) : l'étape est faite par un verrou neuf, comme avant, ou par l'évaluation ouverte si elle est verrouillée, même déjà verrouillée à « Commencer », même déverrouillée puis reverrouillée. « L'évaluation ouverte » : celle que le formulaire d'évaluation montre (l'étudiant·e, la production, et l'identifiant qu'il modifie s'il en retient un) ; avec un fichier, elle doit être celle du fichier ouvert. Une évaluation remplacée par une reprise ne compte pas. Aucun mot nouveau : la bulle reste celle de Grégoire ; elle passe à « Rends tes rétroactions » au lieu de dire « Verrouiller » sous un bouton « Déverrouiller ». Les deux voies (avec ou sans fichier). L'étape du verrou de « Je regarde » (le modèle) reprend celle-ci : elle en profite, sans effet visible (son repère écarte déjà la copie travaillée).

**Source ou stock** : source seulement ; rien n'est écrit. Un parcours laissé à « Ta rétroaction » sur une évaluation déjà verrouillée avance à sa reprise, dès que la production est rouverte.

**Preuve** : `tests/unit/parcours-recevoir-verrou-deja-pose-2026-11-27.test.js`, 9 essais, **3 rouges sur `951de3f8`**. Break-test : 6 casses (l'évaluation ouverte non comptée, le fichier ouvert non confronté, l'identifiant du formulaire ignoré, l'étudiant·e ignoré·e, la production ignorée, l'évaluation remplacée comptée), toutes prises. Sous Chromium : `nous-faisons-recevoir-2026-11-19.spec.js` 4 sur 4, `je-regarde-recevoir-2026-11-17.spec.js` 4 sur 4.

## Fiche 3 — « Recevoir les productions », « Nous faisons », « La liste » : la ligne désignée

**Ce qui change** : à « La liste », le halo, la flèche et la zone que la bulle évite vont à une ligne au statut « Importé » s'il y en a une ; sinon, comme avant, à la première ligne qui offre « Annoter ». Le statut est lu là où la Liste l'écrit : la pastille de la ligne porte l'identifiant du statut en classe (`travaux-badge-pill importe`, `js/liste-evaluations.js`). « Annoté » n'est pas « Importé ».

**« Poser tes codes »** (« Automatiser tes commentaires ») désignait de la même façon : aligné, sur les lignes de la production du parcours (sa consigne dit « une production reçue »). Pas à « Ta rétroaction s'écrit seule », qui désigne aussi « Actions › Annoter » à la reprise : la copie à rouvrir y est celle des codes, devenue « Annoté » ; viser une ligne « Importé » y enverrait sur une autre copie. Les deux « Je regarde » ont leurs propres lignes (Loutre Enjouée, Antilope Vaillante) : pas touchés.

**Preuve** : `tests/unit/parcours-ligne-importee-2026-11-27.test.js`, 7 essais, **3 rouges sur `951de3f8`** (le halo allait à la première ligne, « Évalué »). La Liste y est rendue comme `js/liste-evaluations.js` l'écrit, et deux essais confrontent ce rendu au fichier : un changement de la pastille ou du menu fait rougir le banc. Break-test : 7 casses, toutes prises. Sous Chromium : `nous-faisons-recevoir-2026-11-19.spec.js` (4), `parcours-8-commentaires-2026-11-09.spec.js` (11) et `je-regarde-commentaires-2026-11-22.spec.js` (3) verts ; 5 essais de captures sautés par construction (ils ne tournent que sur demande, `CAPTURES_PARCOURS`).

## Trouvaille, hors du lot

- **« Automatiser tes commentaires », « Ta rétroaction s'écrit seule » compte son verrou comme « Recevoir » le comptait** (`verrouNeuf` et `retenirVerrous`, `js/parcours-commentaires.js`) : une évaluation déjà verrouillée à l'entrée de l'étape ne la ferait pas avancer, sous la même consigne « Touche le cadenas « Verrouiller » ». Lu au code, non reproduit. Issue : **non inscrite** au BACKLOG (aucun symptôme vécu dans ce parcours, la règle du 24 août) ; signalée ici. Le correctif de la fiche 2 s'y transposerait tel quel, si Cowork le veut.

## Vérifié, et pas vérifié

- Vitest complet depuis `tests/` : 967 fichiers, 12 515 essais verts (27 nov., conteneur, sur `8b4966bb3`). Le hook pre-push l'a aussi passé au vert.
- Sous Chromium (le conteneur a un Chromium) : les bancs des trois parcours touchés, cités fiche par fiche. **Rien sous WebKit** : ni Safari ni l'iPad ne sont ici. Avant toute fusion, le verdict du Mac, comme d'habitude.
- Les jetons anti-cache des trois fichiers portent le jour du build en ligne : `js/parcours-evaluer.js?v=20261126d`, `js/parcours-recevoir.js?v=20261126e` (`d` à la fiche 2), `js/parcours-commentaires.js?v=20261126e`. La release les avancera.
- Rien n'est en ligne : la branche n'est fusionnée nulle part. Les gestes ci-dessous attendent qu'elle le soit.

## Ce que seul l'iPad peut juger

Aucun n'est un préalable (règle 2 des portes terrain : rien n'écrit dans les données ; un raté se dit, on corrige). Tout le reste est jugé par les bancs. À faire sur la version en ligne qui porte ce lot (le numéro en bas de page), en rejouant ce que Grégoire a vécu :

1. **« Évaluer une première production », « Nous faisons »**, avec ses grilles déjà là : toucher « Nous faisons ». ⮕ Attendu : le parcours ne s'arrête plus à « Ta grille » ; il s'ouvre sur la première étape qui manque (l'échelle, si une pratique s'applique au cours). Puis « Je garde celle-ci ». ⮕ Attendu : la bulle va droit à l'étape suivante qui reste à faire, sans faire défiler les pages des étapes déjà faites. Ce que le banc ne voit pas : ce saut sous Safari, au doigt.
2. **« Recevoir les productions », « Nous faisons »**, sur une copie dont l'évaluation est déjà verrouillée (le cas de l'aperçu n° 53) : aller jusqu'à « Ta rétroaction ». ⮕ Attendu : la bulle passe d'elle-même à « Rends tes rétroactions » ; elle ne dit jamais « Touche le cadenas « Verrouiller » » sous un bouton « Déverrouiller ».
3. **« Recevoir les productions », « La liste »**, quand la première ligne est déjà « Évalué » : ⮕ Attendu : le halo et la flèche sont sur une ligne « Importé », et cette ligne est amenée dans l'écran, colonne « Actions » comprise, sur l'iPad couché (1180 px), où la Liste dépasse l'écran.
