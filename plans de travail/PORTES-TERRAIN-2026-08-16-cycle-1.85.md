# PORTES TERRAIN — Cycle 1.83.3 → 1.85.0 (16 août 2026)

> **Jumeau markdown de l'artefact interactif** — les deux vont ensemble
> (`SKILL_portes_terrain.md`). L'artefact sert à cocher ; ce fichier sert à ce
> qu'une prochaine session retrouve ce qui reste dû **sans accès à la
> conversation**.
>
> **Ce qui échoue devient un item de BACKLOG, pas une note mentale.**

**Artefact interactif** : <https://claude.ai/code/artifact/2a81f567-9b2c-4261-988f-e1f796930150>
(publié le 16 août 2026 ; **éprouvé au navigateur Chromium avant publication** —
33 bascules, 3 champs de mesure et 5 champs de verdict qui remontent dans le
relevé, persistance vérifiée après rechargement, filtres Tout/iPad/Mac/À faire,
zéro erreur console, aucun débordement horizontal en iPad portrait, toutes les
cibles à 44 px. Le guillemet droit qui tronquait une mesure le 15 août ne peut
plus se produire : les champs reçoivent leur valeur par JavaScript, jamais par
un attribut HTML — on retire le besoin d’échapper au lieu de corriger
l’échappement.)
**Périmètre** : six livraisons du 15 août — **1.83.3** (badge 🎯 gris),
**1.83.4** (cible tactile du badge), **1.83.5** (section « Nouvelles » réparée),
**1.84.0** (modale des gabarits), **1.84.1** (ordre des semaines + aperçu en
colonnes), **1.85.0** (sélecteur de phase + poignée).
**11 portes, 33 vérifications, 3 mesures, 5 décisions.**
_(Compté sur l'artefact rendu, pas estimé : un premier jet annonçait 8 et 29.)_
**Précédente liste** : `PORTES-TERRAIN-2026-08-15-recherche-carte.md`
(close à 45/46 ; restent dues la rangée « taper `lecon` puis `expose` » de sa
2.4 et la mesure 2.2m).

⚠⚠ **COMMENCE PAR LE §0.** Tout est **fusionné dans `main` et déployé**
(1.85.0, build `0815-1704`, déploiement Netlify confirmé sur le commit
`e28f6c75`). Mais ton clone local est à la version de ton dernier `git pull` :
**sans le §0, toute la liste est invérifiable** — l'app affichera 1.83.2, le
sélecteur de phase n'existera pas, et tu cocheras ✗ sur des correctifs qui
marchent. Ce faux rouge est indétectable au récit, parce qu'il décrit
exactement l'état d'avant les livraisons, qui est précisément ce que la liste
teste.

⚠ **Ce que les tests ne peuvent PAS dire.** 2656 cas verts et 10 break-tests
rouges rejoués sur l'arbre final disent que les données tiennent et que les
règles s'appliquent. Ils ne disent pas si le gris du badge se distingue **sur
tes douze fonds de canevas**, si la poignée ⠿ se saisit **au doigt sur ton
iPad**, ni si la modale reste lisible **avec tes vrais gabarits**. C'est
exactement le périmètre de cette liste.

---

## §0 · AVANT DE COMMENCER

⚠⚠ **LA PREMIÈRE RANGÉE N'EST PAS UNE VÉRIFICATION, C'EST UN DÉPLOIEMENT.**

- [ ] **SEULE commande de Terminal de toute la liste** (app **Terminal**, pas
      la console du navigateur — dans le dossier `Monitorage_v6`) :

      git checkout main && git pull origin main

      ⮕ **Attendu** : la liste des fichiers reçus, puis `Fast-forward`.
      Si Terminal répond `error: Your local changes would be overwritten`,
      **arrête-toi et dis-le-moi** — il y a du travail local non commité.
      `Terminal`
- [ ] Recharger l'app et lire le numéro **en bas de page**.
      ⮕ **Attendu** : **1.85.0**, build `0815-1704`. Si tu lis 1.83.2 ou moins,
      la commande ci-dessus n'a pas pris — rien d'autre dans cette liste ne
      vaut tant que ce numéro n'est pas le bon.
- [ ] Prévoir les **deux appareils** (MacBook + iPad) et les **deux modes**
      (sombre + clair). Cinq rangées de cette liste ne se tranchent que sur
      l'iPad ; trois ne se tranchent qu'en comparant les deux modes.

---

## §1 · ⚠⚠ DONNÉES — ce qui touche ton corpus

### 1.1 Backup avant de toucher aux phases `⚠⚠ Données`

> **POURQUOI** — Changer la phase d'un bloc **modifie ta carte** : ce n'est pas
> un réglage d'affichage. Le geste est annulable (⌘Z) tant que tu n'as pas
> rechargé, mais un backup coûte trente secondes.

- [ ] Faire un **backup Codex** avant d'ouvrir la porte 2.7.
      ⮕ **Attendu** : archive créée, date du jour. `⚠⚠ Données`

### 1.2 Les copies liées de tes vieilles cartes `⚠⚠ Données`

> **POURQUOI** — Quand tu dupliques un bloc, la copie reste **liée** à
> l'original : modifier l'un modifiait l'autre. Sur les cartes créées avant
> l'été, ce lien pouvait être **rompu silencieusement à l'ouverture** — tu
> modifiais un bloc et sa copie ne suivait plus, sans aucun message. C'est
> réparé, et la réparation se fait toute seule à l'ouverture de la carte.

- [ ] Ouvrir ta plus **ancienne** carte d'alignement, celle qui contient des
      blocs dupliqués.
      ⮕ **Attendu** : elle s'ouvre normalement, rien d'anormal à l'écran.
- [ ] Modifier le **titre** d'un bloc qui a une copie liée, puis regarder la
      copie.
      ⮕ **Attendu** : la copie prend le même titre, tout de suite.
      **Avant**, sur une vieille carte, elle pouvait ne pas suivre.
      ⮕ **Si elle ne suit pas** : note-le, c'est un vrai échec — et dis-moi de
      quelle carte il s'agit.

---

## §2 · INTERFACE — ce que tu vérifies à l'écran

### 2.1 Le badge 🎯 est gris quand la leçon n'a aucun objectif `1.83.3`

> **POURQUOI** — Ta demande d'hier matin : le badge restait **en couleur** sur
> une leçon sans objectif, donc rien ne distinguait « objectif à poser » de
> « objectif posé ». Il avait déjà été gris début août, puis le gris avait été
> retiré parce qu'il rendait le badge **introuvable**. Il revient — mais sans
> l'effacement qui l'avait fait disparaître.

- [ ] Sur une leçon **sans objectif**, regarder le badge 🎯 de son en-tête.
      ⮕ **Attendu** : la cible est **grise**, entourée d'un liséré **pointillé
      violet** (la couleur des leçons).
- [ ] Poser un objectif sur cette leçon.
      ⮕ **Attendu** : la cible passe **en couleur** (rouge/blanc) et le liséré
      pointillé disparaît.
- [ ] Retirer l'objectif.
      ⮕ **Attendu** : la cible **redevient grise**, le pointillé revient.
- [ ] Refaire les trois rangées ci-dessus **en mode clair**.
      ⮕ **Attendu** : même comportement. Le gris doit rester **repérable** sur
      fond blanc — c'est précisément là que le badge s'était perdu début août.

### 2.2 Toucher le badge 🎯 sur l'iPad `1.83.4` `iPad`

> **POURQUOI** — Le badge se touchait dans une zone de 24 px, sous le seuil
> confortable. Il en offre maintenant 44, sans que les blocs aient grandi.

- [ ] Sur l'iPad, toucher le badge 🎯 **sans viser précisément** — du gras du
      doigt, en visant approximativement.
      ⮕ **Attendu** : la zone des objectifs se déplie. `iPad`
- [ ] Vérifier que les blocs de la carte n'ont **pas grandi**.
      ⮕ **Attendu** : les en-têtes de leçon ont exactement la même hauteur
      qu'avant. `iPad`

### 2.3 La section « Nouvelles » de l'accueil `1.83.5`

> **POURQUOI** — Elle était **vide**, et sans le dire. Un caractère manquant
> dans le fichier des nouveautés empêchait toute la liste de s'afficher :
> aucun message d'erreur, juste une section blanche qui avait l'air d'un choix.
> C'était en ligne depuis hier matin.

- [ ] Aller à l'**accueil** et regarder la section « Nouvelles ».
      ⮕ **Attendu** : la liste des versions s'affiche, **1.85** en tête.
- [ ] Vérifier que l'entrée **1.83** mentionne les liens qui contournent les
      blocs.
      ⮕ **Attendu** : elle est là. **Avant**, aucune entrée n'apparaissait.

### 2.4 La modale des gabarits s'ouvre en plein écran `1.84.0`

> **POURQUOI** — Ta demande d'hier : il fallait **sortir du plein écran** de la
> carte pour voir la modale des gabarits d'export. Elle s'ouvrait bien, mais
> derrière.

- [ ] Passer la Carte d'alignement en **plein écran**.
- [ ] Ouvrir **Actions ▸ Exporter le plan… ▸ Gabarits d'export…**
      ⮕ **Attendu** : la modale s'affiche **par-dessus** la carte, lisible
      immédiatement. **Avant**, l'écran ne changeait pas.
- [ ] Fermer la modale (le ✕), rester en plein écran, la rouvrir.
      ⮕ **Attendu** : même résultat, à chaque fois.

### 2.5 La modale tient dans l'écran `1.84.0`

> **POURQUOI** — Elle dépassait le bas de l'écran : il fallait faire défiler la
> **page entière** pour atteindre Copier et Télécharger. Les cases « À ajouter »
> s'empilaient une par ligne ; elles se rangent maintenant côte à côte.

- [ ] Ouvrir la modale des gabarits et regarder **sans rien faire défiler**.
      ⮕ **Attendu** : les boutons **Copier** et **Télécharger** sont visibles
      en bas de la modale, sans toucher à rien.
- [ ] Regarder la section **« À ajouter »**.
      ⮕ **Attendu** : les cases sont **côte à côte**, plusieurs par rangée,
      chacune à la largeur de son mot. **Avant** : une par ligne.
- [ ] Sur l'**iPad**, en portrait, ouvrir la même modale.
      ⮕ **Attendu** : elle tient à l'écran, les boutons du bas sont
      atteignables. `iPad`
- [ ] **MESURE** — combien de rangées occupe la section « À ajouter » chez toi ?
      _(Aucun chiffre n'est un échec ici : c'est une mesure d'entrée.)_
      ⮕ **À noter** : `______`

### 2.6 L'aperçu et l'ordre des semaines `1.84.1`

> **POURQUOI** — Deux choses que tu as signalées sur la même capture. Les
> colonnes de l'aperçu **se chevauchaient** dès qu'une cellule était longue. Et
> la **leçon 11 se rangeait après la rangée 1** au lieu d'être après la 10 —
> elle sortait en fait dans l'ordre où les blocs avaient été **créés**, pas
> dans l'ordre du calendrier.

- [ ] Ouvrir **Gabarits d'export**, choisir un gabarit, format **Tableau (TSV)**.
      ⮕ **Attendu** : dans l'aperçu, les colonnes sont **alignées** — le contenu
      d'une colonne ne déborde plus sur la suivante.
- [ ] Regarder la **première colonne** (les semaines) de haut en bas.
      ⮕ **Attendu** : 1, 2, 3… puis 10, 11, 12 — **dans l'ordre**. La 11 est
      entre la 10 et la 12, plus juste après la 1.
- [ ] Cliquer **Télécharger**, ouvrir le fichier dans **Numbers**.
      ⮕ **Attendu** : les colonnes tombent proprement dans les cellules de
      Numbers. ⚠ **C'est la rangée qui compte le plus de cette porte** :
      l'alignement de l'aperçu ne doit **pas** être passé dans le fichier.
      Si tu vois des espaces en trop dans les cellules, c'est un vrai échec.
- [ ] **MESURE** — dans quel ordre sortent tes **séquences** les unes par
      rapport aux autres ? _(Les leçons sont triées à l'intérieur de chaque
      séquence ; les séquences, elles, se suivent selon leur étendue. Si cet
      ordre-là te surprend, c'est un point à trancher, pas un bug.)_
      ⮕ **À noter** : `______`

### 2.7 Changer la phase d'un bloc `1.85.0` `⚠⚠ Données`

> **POURQUOI** — Ta demande d'hier : pouvoir passer un bloc de « pratique
> guidée » à « pratique autonome » **sans recréer un bloc** et y recoller le
> contenu. Le nom de la phase devient un menu déroulant.

- [ ] Sur un bloc d'enseignement explicite, **cliquer le nom de la phase**.
      ⮕ **Attendu** : un menu s'ouvre avec **cinq** entrées : Ouverture,
      Modélisation, Pratique guidée, Pratique autonome, Clôture.
- [ ] Vérifier que le menu ne propose **ni** « Activité », **ni** « Exposé »,
      **ni** « Évaluation ».
      ⮕ **Attendu** : seulement les cinq phases — c'est la borne que tu as
      demandée.
- [ ] Choisir une autre phase, puis regarder le bloc.
      ⮕ **Attendu** : le nom change, **le titre et la durée restent**, et les
      objectifs servis cochés dans l'Inspecteur restent cochés.
- [ ] Faire **⌘Z**.
      ⮕ **Attendu** : le bloc revient à sa phase précédente.
- [ ] Lire le nom de la phase **en entier** sur tes vrais blocs.
      ⮕ **Attendu** : « Pratique autonome » et « Pratique guidée » se lisent
      **complètement** et se distinguent l'une de l'autre. ⚠ Elles ont la
      **même couleur** : si le texte est coupé, plus rien ne les sépare. Si tu
      lis « PRATIQUE … », c'est un échec.

### 2.8 La poignée ⠿ — attraper un bloc de phase `1.85.0`

> **POURQUOI** — Avant, tu attrapais un bloc en cliquant **son nom de phase**.
> Ce nom est devenu un menu : il ne peut plus servir de prise. La petite
> poignée ⠿ à gauche de l'en-tête la remplace. **C'est le point le plus risqué
> de la livraison** : si elle se saisit mal, déplacer un bloc devient pénible.

- [ ] Attraper un bloc de phase **par la poignée ⠿** et le déplacer.
      ⮕ **Attendu** : il suit le curseur normalement.
- [ ] Cliquer le **nom de la phase** et le glisser sans lâcher.
      ⮕ **Attendu** : le menu s'ouvre, **le bloc ne bouge pas**. C'est voulu.
- [ ] Sur l'**iPad**, poser le doigt sur la poignée ⠿ et déplacer le bloc.
      ⮕ **Attendu** : il suit le doigt. ⚠ **La rangée la plus importante de
      toute la liste** — c'est le seul geste que je n'ai pas pu éprouver sur
      ton matériel. `iPad`
- [ ] Sur l'**iPad**, toucher le nom de la phase.
      ⮕ **Attendu** : le menu s'ouvre, le bloc ne se met pas à suivre le doigt.
      `iPad`
- [ ] Regarder un bloc de phase **étroit** (s'il y en a).
      ⮕ **Attendu** : si le bloc est étroit, la durée passe **sous** le nom de
      la phase — l'en-tête prend deux lignes. Élargis le bloc : à partir d'à peu
      près 290 px, tout revient sur une ligne. Ce n'est pas un bug, c'est
      l'arbitrage qui garde le nom lisible.
- [ ] **MESURE** — combien de tes blocs de phase passent en deux lignes ?
      ⮕ **À noter** : `______`

---

## §3 · DÉCISIONS — ce qui attend ton verdict

⚠ **Ce ne sont PAS des vérifications.** Ce sont des choix que j'ai posés faute
de pouvoir les trancher à ta place. Chaque rangée attend une **phrase écrite**,
pas une coche : une décision sans verdict écrit est une décision perdue.

**3.1 — Les blocs « À ajouter » de la modale font 34 px de haut, pas 44.**
Les serrer à 44 annulerait une bonne part du gain de compacité que tu as
demandé. J'ai tranché pour la compacité. Est-ce que ça se touche bien sur
l'iPad, ou faut-il les grossir ?
⮕ **Ton verdict** : `______`

**3.2 — La zone tactile du badge 🎯 mord 3 px sur le haut du titre.**
44 px ne tiennent ni dans l'en-tête (37 px) ni dans l'espace jusqu'au titre.
L'autre option était de déborder **hors** du bloc, sur la carte. Est-ce que ça
te gêne pour renommer une leçon ?
⮕ **Ton verdict** : `______`

**3.3 — L'en-tête d'un bloc de phase étroit passe sur deux lignes.**
C'est le prix pour que « Pratique autonome » se lise en entier. L'alternative
serait d'abréger les noms (« Prat. autonome »), ce qui touche au vocabulaire de
la méthode. Deux lignes, ou abréger ?
⮕ **Ton verdict** : `______`

**3.4 — Après un changement de phase, les liens gardent leur verbe.**
Si tu passes une Ouverture en Pratique guidée, un lien qui disait « se réactive
dans » le dit toujours. Je n'ai pas voulu réécrire en douce un verbe que tu as
posé. Faut-il te le signaler par un message quand ça arrive, ou laisser tel
quel ?
⮕ **Ton verdict** : `______`

**3.5 — Dans la modale, la rangée de blocs du bas peut être coupée.**
Quand les réglages dépassent la hauteur disponible, la dernière rangée visible
est tronquée et il faut faire défiler **à l'intérieur** de la modale. C'est du
défilement normal, mais ça peut se lire comme un affichage cassé. Gênant à
l'usage ?
⮕ **Ton verdict** : `______`

---

## §4 · CE QUE JE N'AI PAS PU VÉRIFIER

**Non négociable — une liste qui ne déclare pas ses angles morts se fait croire
complète.**

1. **Rien n'a été éprouvé sur ton matériel.** WebKit n'existe pas dans le
   conteneur : le badge gris, la poignée ⠿, le sélecteur de phase et la modale
   ont tous été mesurés dans **Chromium**, sur un banc d'essai — pas dans
   Safari, pas sur l'iPad, pas sur ta vraie carte. Les cinq rangées `iPad` de
   cette liste sont exactement les trous.

2. **Je n'ai pas pu voir le site en ligne.** Le déploiement Netlify est
   confirmé (`ready`, commit `e28f6c75`, publié à 03:25), mais la politique
   réseau du conteneur refuse `app.codexnumeris.org` : je n'ai **pas** pu
   charger la page pour vérifier ce qu'elle sert réellement. Ton premier
   rechargement le dira.

3. **92 tests Playwright ne tournent nulle part.** Confirmé en les lançant, pas
   supposé : WebKit manque au conteneur. Ils partent en CI.

4. **La réparation des copies liées (porte 1.2) est diagnostiquée, pas
   reproduite sur ton corpus.** J'ai trouvé le défaut en écrivant un test, je
   l'ai corrigé et le correctif est verrouillé — mais je n'ai jamais vu le
   symptôme sur une de tes vraies cartes. Si aucune de tes cartes n'est à
   l'ancien format, la porte 1.2 passera sans rien prouver.

5. ⚠ **UNE ERREUR DE MA PART, ENCORE OUVERTE.** En nettoyant deux fichiers de
   banc d'essai que j'avais commités par accident, j'ai écrit la règle qui
   devait empêcher la récidive **au mauvais endroit** — dans `tests/.gitignore`
   au lieu du `.gitignore` de la racine. Le message de commit affirme que la
   porte est fermée ; elle ne l'est pas. C'est le rituel de fin de session qui
   l'a attrapé, en éprouvant la règle au lieu de la relire. **Rien à faire de
   ton côté** — c'est deux lignes à déplacer, à faire au début de la prochaine
   session.

6. **L'ordre des séquences entre elles n'a pas été rejugé.** J'ai corrigé
   l'ordre des **leçons à l'intérieur** d'une séquence. Les séquences, elles,
   se suivent selon leur étendue temporelle — comportement d'origine, que je
   n'ai pas touché. La mesure de la porte 2.6 est là pour voir s'il te
   surprend.

---

## AU RETOUR

1. **Trier les échecs** : défaut réel, ou build en retard ? (Vérifier le §0
   d'abord — sur les 81 portes du 10 août, deux échecs sur quatre étaient des
   faux rouges venus de là.)
2. **Verser chaque échec réel au BACKLOG** avec son numéro de porte.
3. **Mettre à jour ce fichier** : état, date, ce qui reste.
4. **Ne jamais laisser une porte « probablement passée »** : soit elle est
   cochée, soit elle est due.
