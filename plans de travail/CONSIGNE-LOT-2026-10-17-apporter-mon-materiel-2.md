# Consigne – « Apporter mon matériel », lot 2 : l'assistant et la création

> Écrite par Cowork le 16 octobre 2026 à 17 h 40 (Toronto, mesuré par `date`), pour le samedi 17 au matin, **après** le push du lot 1 (verdict du soir vert). Si le lot 1 n'est pas en ligne, arrête-toi et dis-le.
> **Lis d'abord** le cadrage (`CADRAGE-2026-10-15-apporter-mon-materiel.md`), puis le **prototype** (`PROTOTYPE-2026-10-16-apporter-mon-materiel.dc.html`) : l'assistant, ses étapes, ses textes, l'encadré « Dans l'application » et l'écran de vérification y sont tels que Grégoire les a validés. Référence de comportement et de textes, pas de code à copier.
> ⛔ Aucun nom d'élève ni de collègue dans ce que tu écris au dépôt.
> Skills : `labo-codex`, `design-interface`, `integrite-globaux`, `hygiene-donnees-partagees`, `securite-donnees`, `verification-adverse`.

## Où on en est

Lot 1 en ligne (à remesurer) : l'onglet, l'accueil, la lecture du collage (`js/materiel-lecture.js`), l'aperçu (`js/materiel.js`, `apercuHtml`). Rien n'est encore écrit en base.

> **Ajout de Claude Code, 16 oct. à 20 h 55.** Le lot 1 n'est **pas** en ligne : le verdict du soir sur `f28ce0af` est rouge (voir `RELAIS.md`). La sous-navigation de Conception passe sur deux lignes à 1280 px depuis l'onglet neuf (58 → 100 px), ce qui fait sortir de l'écran le point visé par `planif-menu-vue.spec.js` › « zoom-molette ». C'est le lot 1 qui n'est pas fini : **à corriger avant tout le reste**, puis verdict, push, et alors seulement ce lot.
> **#1091 entre dans ce mandat** (accord de Grégoire, 16 oct., 19 h 30) : l'assistant borne à la saisie le nombre de niveaux des descripteurs à 20, comme `maxCles` dans `js/partage-schemas.js`. Banc Vitest et break-test comme le reste.

## Ce que Grégoire verra à la fin du lot

Il colle sa grille (ou clique sur l'exemple) : au lieu de l'aperçu seul, l'**assistant** s'ouvre. « Étape 1 sur N », la barre des étapes, une question à la fois, l'aperçu du tableau toujours visible dessous (la partie concernée encadrée), l'encadré « Dans l'application » sous chaque question. Il répond, arrive à « Vérifie ta grille, puis crée-la », nomme sa grille, clique « Créer ma grille » : la grille apparaît dans Grilles de critères, l'échelle dans Échelles de performance, et, si les cases étaient des rétroactions, la cartouche dans Cartouches de rétroaction.

## Le mandat

### 1. L'assistant

- **Étapes, sautées si déjà réglées** (`etapesPour` du prototype) : Sens du tableau (sauf « à la main ») ; Nature des cases (s'il y a du texte dans les cases) ; Plages de notes (si un niveau n'a pas de plage reprise du document) ; Pondération (si un critère n'a pas de pondération reprise) ; À classer (s'il y a des passages) ; Vérification (toujours). « Taper ma grille à la main » mène droit à la Vérification. La liste se recalcule après une inversion, l'étape courante gardée.
- **Questions et choix** : boutons à `aria-pressed`, jamais de `div` cliquable. Les choix proposés par l'application portent la mention « Proposé … : à vérifier ».
- **Plages de notes** : « De … % » et « À … % » par niveau, titre du niveau modifiable ; **aucune note ponctuelle** ; chevauchement ou trou entre plages → avertissement au conditionnel, non bloquant (textes du prototype).
- **Pondération** : un champ par critère, total affiché. Mesuré : l'application avertit sans bloquer quand une grille ne totalise pas 100 (`js/grilles.js` ~829) et lit la pondération en entier (`parseInt`). Si le total n'est pas 100 (cas d'une grille en points, « /20 »), avertissement au conditionnel **et** un bouton « Ramener à 100 % » qui convertit proportionnellement, en entiers totalisant 100 (plus grands restes) ; rien ne se convertit sans ce geste (supposition de Cowork, à dire à Grégoire en une ligne).
- **À classer** : « Ajouter comme critère », « Écarter », « Annuler » ; rien ne disparaît ; un passage en attente bloque la création (il apparaît dans la liste « Avant de créer, il reste »).
- **Vérification** : nom de la grille (requis ; il s'imprime sur le PDF des étudiant·es), rappels compacts « Critères : en lignes / en colonnes » et « Les cases : décrivent les niveaux / s'adressent à l'étudiant·e », tableau complet modifiable (titres et plages des niveaux, noms et pondérations des critères, cases), « Ajouter un critère », « Ajouter un niveau », total, « Ce qui sera créé » avec les termes de l'application (grille de critères, échelle de performance, cartouche de rétroaction), « Créer ma grille », et la liste des manques quand on clique trop tôt.
- **L'encadré « Dans l'application »** : les quatre textes du prototype, provisoires (Grégoire relit au lot 3).
- **iPad** : cibles de 44 px, le tableau défile dans son cadre, la page non.

### 2. La création : trois objets NEUFS, rien d'autre

- Dans le trimestre actif (`cle(...)`), par `db.modifier`, dans cet ordre : **l'échelle** (nom tiré de celui de la grille ; niveaux `{ code, nom, min, max }`, `description` vide, **pas de `valeurCalcul`** : mesuré, un niveau sans elle prend le milieu de sa plage à l'évaluation, `js/evaluation-calcul.js` ~1520 ; couleurs des niveaux selon la convention des échelles existantes) ; **la grille** (critères holistiques, `ponderation` entière, descripteurs liés à l'échelle si les cases décrivent les niveaux) ; **la cartouche** (`cle('cartouches_<grilleId>')`, `commentaires["<critère>_<niveau>"]`, `grilleId`, `echelleId`) seulement si les cases s'adressent à l'étudiant·e.
- **Plages contiguës** comme l'échelle de départ IDME : saisies en entiers (65-74, 75-84), elles s'enregistrent avec `max` = `min` suivant − 0,01.
- Identifiants par les générateurs existants (`genererIdUnique('GRILLE_')`, `'ECH_'`, et celui des cartouches). **Aucun objet existant n'est modifié** ; si une écriture échoue, aucun objet partiel ne reste visible (à toi de choisir comment, et de le dire).
- Refus clair si aucun trimestre n'est actif.

### 3. La confirmation

Celle du prototype : « Ta grille « … » est créée », les cartes Grille, Niveaux et, si rétroactions, Rétroactions ; leurs boutons ouvrent la sous-section correspondante (la sélection de l'objet créé dans la barre latérale vient au lot 3) ; « Aller aux productions » ; « Apporter autre chose ».

## À savoir pour le lot 3 (ne pas faire ici)

Les descripteurs ne s'affichent nulle part ailleurs que dans l'assistant : une personne qui ouvre sa grille dans Grilles de critères ne les verra pas. Le lot 3 devra au minimum les montrer, en lecture, sur chaque critère, avant la démonstration de lundi.

## Les bancs

- Vitest : la fonction qui construit l'échelle, la grille et la cartouche à partir du modèle (fonction pure) : contiguïté des plages, aucune `valeurCalcul`, descripteurs liés, cartouche seulement pour les rétroactions, « Ramener à 100 % » (entiers, total 100), `etapesPour` (sauts, liste recalculée après inversion), blocage par un passage en attente ; un objet existant n'est jamais touché.
- Playwright, écrit et non lancé : l'exemple mène à 5 étapes (Sens du tableau, Nature des cases, Plages de notes, À classer, Vérification ; pas de Pondération, donnée par le document) ; « Créer » fait apparaître la grille dans la liste de Grilles de critères et l'échelle dans Échelles de performance ; la branche rétroactions crée une cartouche.
- Break-test pour chaque essai neuf.

## La méthode

Commit, Vitest complet, demande `plans de travail/DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-2.md`. Bump du bloc de jetons. **Aucun push avant la relecture de Cowork et le signal du soir de Grégoire.** Porte terrain : complète celle du lot 1 (créer une grille à partir de sa vraie grille Word, Mac et iPad ; la retrouver dans Grilles et Échelles). Rapport court à Grégoire, en gestes d'utilisateur.
