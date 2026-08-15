# PORTES TERRAIN — Recherche dans la Carte d'alignement (15 août 2026)

> **Jumeau markdown de l'artefact interactif** — les deux vont ensemble
> (`SKILL_portes_terrain.md`). L'artefact sert à cocher ; ce fichier sert à ce
> qu'une prochaine session retrouve ce qui reste dû **sans accès à la
> conversation**.
>
> **Ce qui échoue devient un item de BACKLOG, pas une note mentale.**

**Artefact interactif** : <https://claude.ai/code/artifact/508d3560-7111-4f1d-85c1-9a6b7c5323cc>
(publié le 15 août 2026 ; éprouvé au navigateur Chromium avant publication —
46 rangées, 4 champs de mesure et 5 champs de verdict qui remontent dans le
relevé, filtres par tag, persistance vérifiée après rechargement, zéro erreur
console, aucun débordement horizontal).
**Périmètre** : une seule livraison, **1.81.0** — le champ de recherche de la
Carte d'alignement. 14 portes, 46 vérifications, 4 mesures, 5 décisions.
**Précédente liste** : `PORTES-TERRAIN-2026-08-12-416-lots-CGIHB.md` (5 rangées
encore dues : 3.3 en entier, la fin de 4.1 et de 4.3).

⚠⚠ **CETTE LIVRAISON N'EST PAS SUR `main`.** Elle vit sur la branche
`claude/alignment-map-search-field-gi57ob`, non fusionnée. **Sans le §0, toute
la liste est invérifiable** — l'app affichera 1.80.0 et le champ n'existera
pas. C'est l'erreur qui a fait ignorer une liste entière le 9 août.

⚠ **Ce que les tests ne peuvent PAS dire.** 2408 cas verts et 17 break-tests
rouges disent que le moteur trouve les bons blocs. Ils ne disent pas si le halo
se voit **sur ton fond de canevas**, si la liste se touche au doigt sur l'iPad,
ni si chercher par type de bloc est utile ou noyé **sur ta vraie carte**. C'est
exactement le périmètre de cette liste.

---

## §0 · AVANT DE COMMENCER

⚠⚠ **LA PREMIÈRE RANGÉE N'EST PAS UNE VÉRIFICATION, C'EST UN DÉPLOIEMENT.**

- [ ] **SEULE commande de Terminal de toute la liste** (app **Terminal**, pas
      la console du navigateur — dans le dossier `Monitorage_v6`) :

      git fetch origin && git checkout claude/alignment-map-search-field-gi57ob && git pull

      ⮕ **Attendu** : `Switched to branch 'claude/alignment-map-search-field-gi57ob'`.
      Si Terminal répond `error: Your local changes would be overwritten`,
      **arrête-toi et dis-le-moi** — il y a du travail local non commité.
      `Terminal`
- [ ] Recharger l'app et lire le numéro **en bas de page**.
      ⮕ **Attendu** : **1.81.0**, build `0815-0920`. Si tu lis 1.80.0, la
      commande ci-dessus n'a pas pris — rien d'autre dans cette liste ne
      marchera.
- [ ] Sur iPad : si le numéro reste à 1.80.0, **onglet privé** (Safari iPad
      garde le cache malgré les en-têtes — `DEPLOY.md` §2.2). `iPad`
- [ ] **Backup Codex** ⚠⚠ — la rangée 2.5 te fait créer puis supprimer un bloc
      dans une de tes cartes. C'est réversible, mais fais le backup quand même.
- [ ] Prévoir **les deux appareils** (Mac et iPad) et **les deux modes**
      (clair et sombre).
- [ ] Ouvrir **Conception ▸ Carte d'alignement** sur ta vraie carte (le
      601-101 A26), pas sur une carte vide. La moitié de ce qui suit ne se voit
      que sur un vrai corpus.

---

## §2 · INTERFACE — ce qui se vérifie à l'écran

### 2.1 · Le champ est là, et il n'a rien poussé dehors
`1.81.0` · nouveau

> **POURQUOI.** La barre d'outils de la carte est déjà pleine : le sélecteur de
> carte, le menu Actions, Annuler à gauche ; onze boutons à droite. Y ajouter un
> champ risquait de repousser les derniers boutons hors de l'écran — et sur
> iPad en portrait, c'est l'Inspecteur et la Bibliothèque qui seraient partis
> les premiers, sans que rien ne le signale.

- [ ] Regarder la barre d'outils de la carte, sur **Mac**.
      ⮕ **Attendu** : entre le bouton **Annuler** et le bouton **Nœuds**, un
      champ qui affiche « Rechercher dans la carte… ». `Mac`
- [ ] Compter les boutons à **droite** de la barre : ils doivent tous être là.
      ⮕ **Attendu** : Nœuds · Planificateur · ◎ · Tout voir · Loupe · le
      pourcentage · la palette de fond · plein écran · puis, après un séparateur,
      **Inspecteur · Raccourcis · Guide · Bibliothèque**. Aucun ne doit être
      coupé au bord droit.
- [ ] Refaire le compte sur **iPad, en PORTRAIT**. C'est le cas le plus serré.
      ⮕ **Attendu** : le champ rétrécit (c'est lui qui cède la place), mais les
      quatre derniers boutons restent visibles et touchables. `iPad`
- [ ] Refaire en **paysage**. `iPad`

---

### 2.2 · Trouver un mot sur ta vraie carte
`1.81.0` · le geste principal

> **POURQUOI.** C'est la demande, littéralement. Le reste de la liste ne sert à
> rien si celle-ci échoue.

- [ ] Taper un mot que tu **sais** présent dans plusieurs blocs (un terme de ton
      601-101 : « lecture », « posture », « argumentatif »…).
      ⮕ **Attendu** : les blocs concernés s'allument sur le canevas (un anneau
      ambre), une liste s'ouvre sous le champ, et un petit compteur apparaît
      dans le champ.
- [ ] **MESURE — note le mot cherché et le nombre trouvé** (champ de saisie
      dans l'artefact). Aucun chiffre n'est un échec ici : c'est une mesure
      d'entrée, elle sert au réglage.
- [ ] Regarder une ligne de la liste.
      ⮕ **Attendu** : une pastille de couleur, le titre du bloc, le type en
      petites capitales à droite, puis en dessous une étiquette (TITRE,
      DESCRIPTION, OBJECTIF ou TYPE DE BLOC) suivie de la phrase autour du mot,
      le mot lui-même surligné.

---

### 2.3 · Les accents ne doivent pas t'arrêter
`1.81.0` · corrigé pendant la session

> **POURQUOI.** Tu tapes vite, et pas toujours avec les accents. Pire : un texte
> collé depuis le Finder, un PDF ou une note peut porter ses accents sous une
> forme différente de celle que tu tapes — **à l'écran c'est identique**, mais
> la première version du code ne le trouvait pas du tout. Un titre introuvable
> sans raison visible, c'est le genre de défaut qui fait perdre confiance dans
> l'outil entier.

- [ ] Chercher un mot accentué de ta carte **en tapant sans les accents**
      (« litterature », « eleve », « reperer », « evaluation »).
      ⮕ **Attendu** : les blocs remontent quand même.
- [ ] Chercher le **même mot avec ses accents**.
      ⮕ **Attendu** : exactement les mêmes blocs.
- [ ] Regarder le mot surligné dans la liste.
      ⮕ **Attendu** : il s'affiche **avec ses accents**, tels que tu les as
      écrits — c'est ton texte qu'on te montre, pas une version dépliée.
- [ ] ⚠ Si un bloc que tu sais contenir le mot **ne remonte pas**, note son
      titre exact : c'est le cas que je n'ai pas pu éprouver sur ton corpus.

---

### 2.4 · Chercher par TYPE de bloc — ton arbitrage
`1.81.0` · décision du 15 août

> **POURQUOI.** Tu as demandé que la recherche morde aussi sur le type de bloc,
> pour pouvoir dire « montre-moi toutes les évaluations ». C'est utile, et c'est
> bruyant par nature : un mot comme « leçon » peut allumer la moitié de ta
> carte d'un coup. La question de cette porte n'est pas « est-ce que ça marche »
> mais **« est-ce que c'est utilisable sur ta carte »**.

- [ ] Taper **evaluation**.
      ⮕ **Attendu** : tous tes blocs de type Évaluation s'allument, et chaque
      ligne porte l'étiquette **TYPE DE BLOC** (et non TITRE).
- [ ] **MESURE — combien de blocs remontent ?** (champ de saisie)
- [ ] Taper **lecon** (sans accent), puis **expose**.
      ⮕ **Attendu** : même chose pour les leçons et les exposés.
- [ ] **MESURE — combien pour « lecon » ?** (champ de saisie)
      ⮕ C'est ce chiffre qui dira si la liste reste lisible ou devient un mur.
      La décision 3.3 en dépend.

---

### 2.5 · La description et les objectifs sont fouillés aussi
`1.81.0` · nouveau · ⚠⚠ crée puis supprime un bloc

> **POURQUOI.** La description d'un bloc ne s'affiche nulle part sur le canevas :
> elle vit dans l'Inspecteur. Un mot-clé que tu n'aurais écrit que là serait
> introuvable, et tu n'aurais aucun moyen de comprendre pourquoi.

- [ ] Créer un bloc quelconque, l'ouvrir dans l'**Inspecteur** (double-tap, ou
      le bouton Inspecteur de la barre), et écrire dans **Description** un mot
      qui n'existe nulle part ailleurs : `zoulou`. `⚠⚠ Données`
- [ ] Chercher **zoulou**.
      ⮕ **Attendu** : le bloc remonte, avec l'étiquette **DESCRIPTION**.
- [ ] Chercher un mot qui vit dans un **objectif 🎯** d'une de tes leçons.
      ⮕ **Attendu** : la leçon remonte, avec l'étiquette **OBJECTIF**.
- [ ] **Supprimer le bloc d'essai.** `⚠⚠ Données`

---

### 2.6 · ⚠⚠ Le halo se voit-il sur TON fond de canevas ?
`1.81.0` · **la porte la plus importante de la liste**

> **POURQUOI.** Le fond du canevas, c'est toi qui le choisis — douze teintes, du
> presque noir au presque blanc — et ce choix est indépendant du mode clair ou
> sombre. La première version du halo était **invisible** sur plusieurs de ces
> fonds : sur « Brume », il se confondait complètement. Tu aurais cherché un
> mot, l'outil aurait dit « 6 blocs trouvés », et tu n'en aurais vu aucun.
> C'est corrigé et mesuré sur les douze fonds, mais **mesuré n'est pas vu**.

- [ ] Chercher un mot, **avec ton fond habituel**, en mode **sombre**.
      ⮕ **Attendu** : chaque bloc trouvé porte un anneau **ambre**, bordé d'un
      fin liseré clair et d'un fin liseré sombre. Il doit sauter aux yeux sans
      qu'on le cherche.
- [ ] Même chose en mode **clair**.
- [ ] Ouvrir la **palette de fond** (l'icône de palette dans la barre) et
      essayer **Brume**, **Givre**, **Parchemin**, **Crème** — les quatre fonds
      clairs, ceux où l'ambre est le plus en difficulté.
      ⮕ **Attendu** : le halo reste repérable sur les quatre.
- [ ] Essayer **Ardoise**, **Acier**, **Graphite**, **Sépia**, **Lichen** — les
      fonds mi-tons, ceux qui résistaient encore à ma première correction.
      ⮕ **Attendu** : repérable sur les cinq.
- [ ] **Remettre ton fond habituel.**
- [ ] ⚠ S'il y a **un seul** fond où tu dois chercher le halo des yeux, note
      lequel : c'est un défaut, pas une préférence.

---

### 2.7 · Le halo à petit zoom — le vrai cas d'usage
`1.81.0` · **mesuré, non tranché**

> **POURQUOI.** C'est ta phrase du 11 août qui a donné la loupe : « la vue
> complète de la carte de mon cours est à 25 %, c'est évidemment illisible à ce
> zoom ». C'est exactement là que la recherche sert le plus — et c'est là que
> l'anneau est le plus fin, parce qu'il rapetisse avec la carte. Mesuré sur une
> carte de 90 blocs : à 29 %, l'anneau complet ne fait plus que **1,5 point** de
> large. Sur mon écran il se lit encore. Sur le tien, avec ta carte, je ne peux
> pas le savoir.

- [ ] Chercher un mot, puis cliquer **Tout voir**.
      ⮕ **Attendu** : la carte entière tient à l'écran, et les blocs trouvés
      restent repérables à leur tache ambre.
- [ ] **MESURE — à quel pourcentage de zoom tombe « Tout voir » sur ta carte ?**
      (le chiffre s'affiche dans la barre, à droite) (champ de saisie)
- [ ] Dire si les halos sont repérables **d'un coup d'œil** à ce zoom, ou s'il
      faut les chercher. ⮕ La décision **3.5** en dépend.

---

### 2.8 · Recherche + Loupe : le couple
`1.81.0` · nouveau

> **POURQUOI.** Prendre du recul et lire sont deux exigences contradictoires. Le
> geste complet est : je cherche, je prends du recul avec « Tout voir », je
> repère les taches ambre, je lis à la loupe, je clique pour atterrir. Si les
> halos n'apparaissaient pas **dans** la loupe, la chaîne casserait au milieu.

- [ ] Chercher un mot, cliquer **Tout voir**, puis activer la **Loupe** (le
      bouton, ou la touche `L`).
- [ ] Promener la loupe sur un bloc trouvé.
      ⮕ **Attendu** : le halo ambre est visible **dans la loupe aussi**, pas
      seulement sur le canevas derrière.
- [ ] Quitter la loupe (`L` ou Échap).

---

### 2.9 · Se déplacer dans les résultats
`1.81.0` · nouveau

- [ ] Cliquer une ligne de la liste.
      ⮕ **Attendu** : la carte se déplace jusqu'au bloc, il est sélectionné, et
      il clignote brièvement en bleu.
- [ ] Revenir dans le champ et appuyer sur **Entrée** plusieurs fois.
      ⮕ **Attendu** : on passe au résultat suivant à chaque fois, le compteur
      passe de `1/6` à `2/6`, etc. **Arrivé au dernier, Entrée revient au
      premier** — c'est voulu.
- [ ] **Maj+Entrée**.
      ⮕ **Attendu** : on recule d'un résultat, et ça boucle aussi dans l'autre
      sens.
- [ ] Appuyer sur **Échap** une première fois.
      ⮕ **Attendu** : la liste se referme **mais les halos restent allumés** —
      c'est fait exprès, pour que tu puisses cliquer dans la carte ensuite.
- [ ] Appuyer sur **Échap** une seconde fois.
      ⮕ **Attendu** : le champ se vide et les halos s'éteignent.

---

### 2.10 · Le halo ne doit pas disparaître quand on l'approche
`1.81.0` · **défaut trouvé et corrigé pendant la session**

> **POURQUOI.** Dans la première version, poser la souris sur un bloc trouvé
> **éteignait son halo** — au moment précis où tu le regardes. Le bloc
> redevenait ordinaire sous le curseur.

- [ ] Chercher un mot, puis passer la souris **sur** un bloc allumé, sans
      cliquer. `Mac`
      ⮕ **Attendu** : le halo reste, exactement comme avant.
- [ ] Faire glisser un bloc allumé de quelques centimètres.
      ⮕ **Attendu** : il reste allumé pendant et après le déplacement.
- [ ] Annuler avec ⌘Z.
      ⮕ **Attendu** : il est toujours allumé.

---

### 2.11 · La touche « L » ne doit pas ouvrir la loupe quand tu écris
`1.81.0` · risque connu

> **POURQUOI.** La loupe s'ouvre avec la touche `L`, sans aucune touche de
> commande. Taper « lecture » dans le champ de recherche ne doit évidemment pas
> l'ouvrir trois fois.

- [ ] Taper **lecture** dans le champ de recherche.
      ⮕ **Attendu** : la loupe ne s'ouvre pas, et le bouton Loupe de la barre
      reste éteint.

---

### 2.12 · iPad — se toucher au doigt
`1.81.0` · **jamais éprouvé** `iPad`

> **POURQUOI.** Le conteneur où je travaille n'a pas de Safari : rien de ce qui
> suit n'a été vu, seulement écrit. Le 10 août, c'est exactement ce genre
> d'angle mort qui avait rendu l'Inspecteur inatteignable au doigt.

- [ ] Toucher le champ de recherche.
      ⮕ **Attendu** : le clavier virtuel s'ouvre et le champ reste visible
      (non caché par le clavier). `iPad`
- [ ] Taper un mot et toucher une ligne de la liste.
      ⮕ **Attendu** : la ligne se touche du premier coup, sans viser. `iPad`
- [ ] Toucher la petite croix pour effacer.
      ⮕ **Attendu** : elle se touche du premier coup. `iPad`
- [ ] Vérifier que la liste **défile au doigt** si elle dépasse. `iPad`
- [ ] Les deux modes, clair et sombre. `iPad`

---

### 2.13 · Changer de carte pendant une recherche
`1.81.0` · cas limite

- [ ] Chercher un mot, puis changer de carte dans le sélecteur de gauche.
      ⮕ **Attendu** : la recherche se **recalcule** sur la nouvelle carte —
      le mot reste dans le champ, mais les résultats sont ceux de la nouvelle
      carte (souvent zéro, et le message le dit).

---

## §3 · DÉCISIONS — ce qui attend ton verdict

> ⚠ **CE NE SONT PAS DES VÉRIFICATIONS.** Il n'y a rien à cocher ✓ ou ✗ ici :
> ce sont des choix que j'ai posés faute de pouvoir les trancher à ta place.
> **Chaque rangée attend une phrase écrite**, pas une case. Une décision sans
> verdict écrit est une décision perdue — c'est la leçon du 11 août.

### 3.1 · ⌘F doit-il ouvrir la recherche de la carte ?
Je ne l'ai **pas** branché. Aujourd'hui ⌘F ouvre la recherche de Safari, qui ne
sait pas se déplacer dans la carte et ne trouve que ce qui est déjà à l'écran.
Le brancher rendrait le geste naturel, mais te priverait de la recherche du
navigateur sur cette page. **Ton verdict :** _(à écrire)_

### 3.2 · Deux lettres avant de chercher — le bon seuil ?
En dessous de deux lettres, la recherche ne démarre pas et le dit
(« Encore une lettre — la recherche démarre à 2 caractères »). Motif : avec les
types de blocs dans le corpus, une seule lettre allume presque toute la carte.
Faut-il monter à 3 ? Descendre à 1 ? **Ton verdict :** _(à écrire)_

### 3.3 · Chercher par type de bloc : gardé tel quel, ou réglé ?
C'est ton arbitrage du 15 août, et les mesures de la porte 2.4 vont dire ce
qu'il donne sur ta vraie carte. Si « lecon » fait remonter 40 blocs, trois
réglages sont possibles : le laisser ainsi, ne chercher le type que sur une
correspondance **exacte** du mot entier, ou le sortir en filtre séparé.
**Ton verdict :** _(à écrire)_

### 3.4 · La largeur du champ
260 points sur Mac, et il rétrécit quand la barre manque de place. Assez pour
lire ce qu'on tape ? Trop large au point de gêner ? **Ton verdict :** _(à écrire)_

### 3.5 · L'épaisseur du halo à petit zoom
L'anneau rapetisse avec la carte : 1,5 point à 29 % (mesuré). Je peux le faire
**compenser le zoom** — il garderait la même épaisseur à l'écran quel que soit
le grossissement — mais il paraîtrait alors plus épais à 100 %. À trancher
d'après ce que tu auras vu à la porte 2.7. **Ton verdict :** _(à écrire)_

---

## §4 · CE QUE JE N'AI PAS PU VÉRIFIER

**Safari et l'iPad — rien, absolument rien.** WebKit n'existe pas dans le
conteneur (#456, condition préexistante). Tout ce que je rapporte a été éprouvé
dans Chromium. Les cibles tactiles de 44 points, le comportement du clavier
virtuel, le repli du champ en portrait : écrits, jamais vus. **C'est le §2.12
en entier, plus la moitié du 2.1.**

**Ton corpus réel.** Je n'ai testé que sur des cartes fabriquées. Je ne sais
pas combien de blocs remontent quand tu tapes « lecon » sur ton 601-101, ni si
la liste reste lisible à cette échelle. C'est l'objet des trois mesures.

**Le halo à ton zoom de travail.** Mesuré à 1,5 point d'épaisseur à 29 % sur une
carte de 90 blocs. Il se lit sur mon écran ; ton écran et ta carte peuvent dire
autre chose.

### Mes erreurs de la session — y compris celles rattrapées de justesse

1. **Le halo s'éteignait au survol.** Deux règles de style de poids égal, c'est
   l'ordre d'écriture qui tranchait, et le mien était mauvais. Trouvé au
   navigateur, pas à la relecture.
2. **Le halo était invisible sur la moitié de tes fonds** — 1,19 contre 3
   requis sur « Brume ». Et **ma première correction ne suffisait pas** : elle
   laissait encore cinq fonds mi-tons dans le noir. C'est la **seconde** mesure
   qui l'a dit. Si je n'avais mesuré qu'une fois, tu recevrais aujourd'hui un
   halo invisible sur cinq de tes douze fonds.
3. **Un texte aux accents « décomposés » n'était pas trouvé du tout** — la forme
   que produit macOS et qui voyage par copier-coller. Trouvé parce que mon
   propre test de vérification était trop faible : il affirmait quelque chose
   que ses exemples ne pouvaient pas mettre en défaut. En cherchant un exemple
   qui mordrait vraiment, j'ai trouvé le défaut. **C'est le seul des trois qui
   serait passé jusqu'à toi sans laisser de trace.**
4. **Un piège de harnais** : deux de mes premiers cas de test ont échoué sur des
   données fausses de ma part, pas sur un défaut du code — et un troisième
   mesurait pendant le clignotement bleu d'atterrissage au lieu du halo.

---

## AU RETOUR

1. **Trier les échecs** : défaut réel, ou branche pas récupérée (§0) ?
2. **Verser chaque échec réel au BACKLOG** avec son numéro de porte.
3. **Reporter les cinq verdicts du §3** ici même.
4. **Mettre à jour l'état ci-dessous.**

| | |
|---|---|
| **État** | ⏳ non traitée |
| **Rangées** | 14 portes · 46 vérifications · 4 mesures · 5 décisions |
| **Version visée** | 1.81.0 — build `0815-0920` |
| **Branche** | `claude/alignment-map-search-field-gi57ob` (non fusionnée) |
