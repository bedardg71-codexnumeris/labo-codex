# PORTES TERRAIN — Cycle 1.85.0 → 1.86.0 (16 août 2026)

> **Jumeau markdown de l'artefact interactif** — les deux vont ensemble
> (`SKILL_portes_terrain.md`). L'artefact sert à cocher ; ce fichier sert à ce
> qu'une prochaine session retrouve ce qui reste dû **sans accès à la
> conversation**.
>
> **Ce qui échoue devient un item de BACKLOG, pas une note mentale.**

**Artefact interactif** : <https://claude.ai/code/artifact/06b361a7-e0ce-4cf0-b6a1-6cb7c11dbce3>
(publié le 16 août 2026 ; **éprouvé au navigateur Chromium avant publication** —
14 portes, 41 bascules, 2 champs de mesure et 5 champs de verdict qui remontent
dans le relevé, persistance vérifiée après re-rendu complet, zéro erreur
console. **Le guillemet droit du 15 août a été re-testé explicitement** : saisir
`il a dit "non" — 3 paires "limites"` dans une mesure et re-rendre la page rend
la valeur **intacte**. La correction va plus loin que celle du 15 : les champs
ne reçoivent plus leur valeur par un attribut HTML du tout, mais par
`peuplerSaisies()` après le rendu — on retire le besoin d'échapper au lieu de
corriger l'échappement.)

**Périmètre** : les quatre demandes de Grégoire du 16 août, plus son verdict
**3.4** de la porte terrain de la veille. Une seule version : **1.86.0**.

**14 portes, 41 vérifications, 2 mesures, 5 décisions.**
_(Compté sur l'artefact rendu, pas estimé : un premier jet annonçait 13 et 38.)_

**Précédente liste** : `PORTES-TERRAIN-2026-08-16-cycle-1.85.md`
(**close à 33/33, zéro échec**). Restaient dues, et le sont toujours : la mesure
**2.6m** (ordre des séquences — sans objet, il n'a pas créé de séquence) et la
mesure **2.8m** (blocs de phase sur deux lignes), **reprise ici en 2.8m** parce
qu'elle compte davantage depuis ce cycle.

---

> ✅ **CLOSE — 43/43, ZÉRO ÉCHEC** (relevé de Grégoire, 20 août 2026, exporté
> par l'artefact ; passée sous 1.88.2, iPad et deux modes compris — dont la
> rangée la plus risquée, la poignée ⠿ au doigt).
>
> **LES CINQ VERDICTS SONT RENDUS (§3)** :
> - **3.1** violet de l'Organisation (`#a855f7`) : « c'est bien » — GARDÉ.
> - **3.2** vert du Déroulement (équilibre 3,30) : « c'est bien » — GARDÉ.
> - **3.3** deuxième ligne d'en-tête de l'Évaluation : « c'est bien » — GARDÉ.
> - **3.4** pastille « Évaluation » unique dans la palette : « c'est bien » — GARDÉ.
> - **3.5** « Préalable » : « **on ne retire pas** » — la fonction RESTE
>   (case Inspecteur + ligne d'export conservées ; sans couleur propre sur la
>   carte, validé en 2.11). La question du retrait est CLOSE, ne pas la rouvrir.
>
> **Mesures** : 2.7m = « aucun » (aucune paire de blocs voisins difficile à
> distinguer — la couleur unique par famille tient sur sa vraie carte).
> ✅ **2.8m RENSEIGNÉE (20 août, après le relevé) : 0** — aucun bloc à
> en-tête sur deux lignes sur sa vraie carte. L'arbitrage 3.3 (seule
> l'Évaluation peut y passer) ne coûte rien en pratique. **PLUS AUCUN
> RELIQUAT : cette porte est entièrement soldée**, mesures comprises (la
> 2.8m était due depuis le cycle 1.85).
>
> En chemin, la porte 1.2 a trouvé **#459** (⇧ avalé en silence sur les
> conteneurs — corrigé 1.88.2, revalidé par ce relevé même).

> ⚠ **MISE À JOUR DU 20 AOÛT 2026 (reprise de la porte sous 1.88.1)** : la
> liste teste les livraisons de 1.86.0, toutes en place ; le §0 attend
> désormais **1.88.2** (build `0820-0745`). **Une seule porte a changé de
> sens : la 1.2** — depuis 1.87, une *copie* (⌥ / ⌘D) est INDÉPENDANTE et ne
> suit plus son original (c'est voulu) ; seul un *clone* (⇧⌥ / ⇧⌘D / bouton
> « Cloner (lié) ») propage titre, durée et type. La porte 1.2 se joue donc
> sur un CLONE ; une copie qui suivrait serait un échec de 1.87, pas de 1.86.
> Artefact republié, même URL, coches conservées.

## ⚠⚠ COMMENCE PAR LE §0

Tout ce que cette liste teste est livré depuis **1.86.0** ; l'app doit
afficher **1.88.2** (build `0820-0745`). Sans la première rangée, toute la
liste est invérifiable — un clone local en retard cocherait ✗ sur des
livraisons qui marchent, et ce faux rouge est **indétectable au récit**,
parce qu'il décrit exactement l'état d'avant la livraison, qui est
précisément ce que la liste teste.

---

## Ce que le cycle a livré

| | |
|---|---|
| **Menu de type dans l'en-tête, pour TOUS les blocs** | Borné à la **famille** : intention curriculaire (2), connaissances (4), déroulement (4), enseignement explicite (5). La borne est dans la porte d'écriture, pas dans le `<select>`. |
| **Séquence et Leçon : PAS de menu** | Décision de Grégoire — « elles ne sont pas intervertibles ». Libellé inerte. |
| **Visée d'une évaluation** | Formative / certificative, par `metadata.visee`. **Un modificateur, pas deux types.** |
| **Une couleur par famille** | Un jeton, les types y pointent. `--planif-couleur-prerequis` retiré. |
| **Poignée ⠿ premier élément de toute en-tête** | À gauche de la pastille de validation d'entrée. Sur tous les blocs, y compris ceux au libellé inerte. |
| **Verdict 3.4 « signaler »** | Un changement de type qui rend un verbe de lien inexact le **dit** ; il ne réécrit jamais le verbe. |
| **« Preuve de réussite » → « Vérification »** | Palette, guide, message de sortie. Le changelog 1.x n'est **pas** réécrit. |

---

## ⚠⚠ LA DÉCISION DE CONCEPTION QUI COMMANDE LE RESTE

**`evaluation` n'est pas qu'un libellé : c'est le seul type de bloc accroché aux
vraies Productions du Codex.** Mesuré avant d'écrire une ligne :

1. C'est le nœud Évaluation qui porte `metadata.productionId`. La moisson de
   `main.js` cherche « le nœud Évaluation **unique** de la leçon » par
   `type === 'evaluation'` : deux types nommés autrement, et elle n'en trouve
   plus aucun, **en silence**.
2. `planification-export.js` classe par `type === 'evaluation'` — marqueur ◆,
   section Évaluation, colonnes pondération et échéance, agrégation du sommaire.
3. `evaluerObjectif` coche un objectif « vérifié » via ce type.

⮕ **D'où le modificateur** (`metadata.visee`), idiome déjà en place dans le
module pour `prealable` et `retroaction`. **78 sites intacts.**

⚠ **Et TROIS états en mémoire pour DEUX entrées au menu.** Le champ absent ne
veut pas dire « certificative », il veut dire « pas encore choisi ». Un premier
jet labellisait « Évaluation certificative » les blocs jamais qualifiés — donc
une affirmation que Grégoire n'a pas faite, **dans son plan de cours**. Corrigé :
tant qu'il n'a rien choisi, l'export écrit « Évaluation », comme avant.

▣ **Décision de Grégoire, 16 août** : une évaluation formative **vérifie** un
objectif au même titre qu'une certificative. `evaluerObjectif` n'est donc pas
touchée.

---

## §0 · AVANT DE COMMENCER

- [ ] **SEULE commande de Terminal de toute la liste** (app **Terminal**, pas la
      console du navigateur, dans le dossier `Monitorage_v6`) :

      git checkout main && git pull origin main

      ⮕ **Attendu** : la liste des fichiers reçus, puis `Fast-forward`.
      Si Terminal répond `error: Your local changes would be overwritten`,
      **arrête-toi et dis-le-moi**. `Terminal`
- [ ] Recharger l'app et lire le numéro **en bas de page**.
      ⮕ **Attendu** : **1.88.2**, build `0820-0745` (reprise du 20 août — les
      livraisons de 1.86.0 sont toujours en place, et 1.88.2 fait parler les
      gestes de duplication, cf. 1.2).
- [ ] Prévoir les **deux appareils** et les **deux modes**. Quatre rangées ne se
      tranchent que sur l'iPad ; cinq, qu'en comparant les deux modes.

---

## §1 · ⚠⚠ DONNÉES

### 1.1 Backup avant de changer des types `⚠⚠ Données`

> **POURQUOI** — Changer le type d'un bloc **modifie ta carte** : ce n'est pas
> un réglage d'affichage. Annulable par ⌘Z tant que tu n'as pas rechargé, mais
> un backup coûte trente secondes.

- [ ] Backup Codex avant d'ouvrir la porte 2.1. ⮕ archive créée, date du jour.

### 1.2 Un type changé suit les CLONES `⚠⚠ Données` *(reprise du 20 août, 1.88.2)*

> **POURQUOI** — Un clone reste lié à son original : titre, durée et **type**
> se propagent. ⚠ Depuis 1.87, une **copie** (⌥ / ⌘D) est INDÉPENDANTE ; seul
> un **clone** (⇧⌥ / ⇧⌘D / « Cloner (lié) ») suit. ⚠⚠ **Et le clone n'existe
> que sur un bloc SIMPLE** : une leçon ou une séquence se copie TOUJOURS,
> ⇧ ou pas (décision du 6 août) — c'est ce que la capture de Grégoire du
> 20 août a montré, et l'app ne le disait pas (**#459**, corrigé 1.88.2 :
> chaque geste annonce maintenant « Clone lié créé » / « Copie indépendante
> créée » / « …une leçon ne se clone jamais »).

- [ ] Sur un bloc SIMPLE (activité, exposé — PAS une leçon), ⇧⌥ en glissant.
      ⮕ toast « Clone lié créé », indicateur 🧬 sur le bloc neuf.
- [ ] Changer le type de l'original. ⮕ le clone suit, tout de suite.
- [ ] **⌘Z**. ⮕ les deux reviennent ensemble.
- [ ] ⇧⌥ sur une LEÇON (le geste de la capture). ⮕ le toast dit POURQUOI :
      « …une leçon ou une séquence ne se clone jamais : le clone lié (⇧) est
      réservé aux blocs simples. »

---

## §2 · INTERFACE

| Porte | Objet | Tags |
|---|---|---|
| **2.1** | Menu de type sur une **connaissance** — 4 entrées, ni Compétence ni Activité ni Évaluation ; titre et liens survivent ; ⌘Z | |
| **2.2** | **Compétence ↔ Idée maîtresse** — les pastilles de validation se recalculent (voulu) | |
| **2.3** | **Exposé ↔ Activité** — 4 entrées, aucune phase ; les phases gardent leurs 5 ; la durée survit | |
| **2.4** | **Séquence et Leçon n'ont PAS de menu** — cliquer le libellé n'ouvre rien (voulu) | |
| **2.5** | **Visée d'une évaluation** — 2 entrées ; la pastille de sortie dit le nom complet ; l'Inspecteur garde tous ses réglages | |
| **2.6** | ⚠⚠ **Les exports ne bougent pas tant que rien n'est choisi** — « Évaluation » tout court ; se précise après choix | |
| **2.7** | **Une couleur par famille** — les deux modes ; deux blocs voisins d'une même famille ; Séquence vs Leçon | |
| **2.8** | **Poignée ⠿ au coin supérieur gauche** — ordre ⠿ / pastille / nom ; glisser ; le menu ne déplace pas ; la pastille garde son clic | `iPad` ×2 |
| **2.9** | **Verbe devenu inexact signalé** — message affiché, verbe **non réécrit**, silence quand rien ne bascule | |
| **2.10** | **« Vérification »** dans la palette et le guide | |
| **2.11** | **Le préalable ne se distingue plus** sur la carte (voulu) ; l'Inspecteur le dit toujours | |

**Mesures** (champ de saisie, pas une coche) :

- **2.7m** — combien de paires de blocs voisins deviennent difficiles à
  distinguer sur sa vraie carte ? _(mesure d'entrée : aucun chiffre n'est un
  échec ; elle dira s'il faut réintroduire une nuance)_
- **2.8m** — combien de ses blocs ont un en-tête sur **deux lignes** ?
  _(non renseignée hier ; compte davantage aujourd'hui)_

---

## §3 · DÉCISIONS — cinq verdicts attendus

⚠ **Ce ne sont PAS des vérifications.** Chaque rangée attend une **phrase
écrite**. Une décision sans verdict écrit est une décision perdue.

**3.1 — Le violet de l'Organisation est une teinte NEUVE (`#a855f7`).**
Aucune des deux existantes ne tenait dans les deux modes : le violet foncé de
Séquence tombe à **1,95** sur fond sombre, le clair de Leçon à **2,64** sur fond
blanc. Le milieu de la même gamme donne **3,44 / 3,96**. Seule famille dont la
couleur n'existait pas avant.

**3.2 — Le vert du Déroulement est la famille la moins équilibrée (3,30).**
Les cinq familles visent l'équilibre de la sarcelle validée en août (**3,68**) ;
quatre y sont. Un `#199447` aurait donné 3,48 mais sortait de la gamme de la
palette — 0,18 ne valait pas ça.

**3.3 — Seul le bloc Évaluation gagne une deuxième ligne d'en-tête.**
Mesuré avant/après sur les treize types : tous gardent leur nombre de lignes,
sauf l'Évaluation. « Certificative » plus la poignée ne tiennent pas à côté de la
boîte de durée sur un bloc de 230 px. Élargir le bloc les ramène sur une ligne.
Même arbitrage que sa 3.3 de la veille.

**3.4 — La palette garde UNE seule pastille « Évaluation ».**
Deux pastilles obligeraient la visée à voyager par **quatre points de passage**
entre le glisser et le bloc créé — la forme exacte du bug que ce module a déjà
payée (trois chemins de création divergents, corrigés le 9 août). Un bloc neuf
naît non qualifié ; le choix se fait dans son en-tête.

**3.5 — Faut-il retirer « Préalable » pour de bon ?**
Il l'a dit théorique, inutilisée, appelée à disparaître. Elle n'a plus de
couleur, mais occupe encore une case dans l'Inspecteur et une ligne dans les
exports.

---

## §4 · CE QUE JE N'AI PAS PU VÉRIFIER

**Non négociable — une liste qui ne déclare pas ses angles morts se fait croire
complète.**

1. **Rien n'a été éprouvé sur son matériel.** WebKit n'existe pas dans le
   conteneur : menus, poignée, couleurs et deux modes ont été mesurés dans
   **Chromium**, sur un banc d'essai — pas dans Safari, pas sur l'iPad, pas sur
   sa vraie carte. Les rangées `iPad` sont exactement les trous.
2. **Les couleurs sont mesurées, pas jugées.** Le contraste de chaque teinte
   contre les deux fonds de bloc est calculé ; un chiffre ne dit pas si une
   couleur est agréable, ni si deux familles se confondent au coin de l'œil sur
   une carte dense à 22 %. C'est l'objet de tout le §3.
3. **92 tests Playwright ne tournent nulle part** — confirmé en les lançant, pas
   supposé : WebKit manque au conteneur. CI.
4. **Le site en ligne n'a pas pu être vu** — la politique réseau du conteneur
   refuse `app.codexnumeris.org`.

### ⚠ Mes erreurs de la session, y compris celles rattrapées de justesse

1. ⚠⚠ **Ma première conception écrivait dans son plan de cours.** Elle
   labellisait « Évaluation certificative » tous les blocs jamais qualifiés.
   **Je ne l'ai pas vue en relisant** : c'est le **golden master des exports**
   qui l'a dit, en refusant de rester vert. Sa consigne interne — « ne pas
   régénérer les références : un octet qui bouge est un comportement qui a
   changé sans avoir été décidé » — a fonctionné exactement comme prévu.
   ⮕ Corrigé, et il repasse au vert **sans avoir été refigé**, ce qui est la
   preuve que les sorties de Grégoire ne bougent pas.
2. ⚠ **La cible tactile de la poignée a demandé DEUX mesures.** Le calcul à la
   main annonçait 44×54 px ; le banc a répondu **42×43** (le glyphe ⠿ fait
   9,5 px, pas 12 ; sa hauteur de ligne 13 px, pas 24). La **première**
   correction a donné **43,53** — toujours sous le seuil, et invisible à la
   relecture. Seule la seconde mesure l'a démasquée. Contrôle final :
   **44,53 × 45,00**, sur treize types et dans les deux modes.
3. **Mes propres commentaires cassaient mes propres tests.** Les commentaires
   CSS contenaient des renvois de la forme `` `.planif-noeud-prise { margin-right }` ``,
   et l'oracle, qui lit le fichier comme du texte, attrapait le **commentaire**
   au lieu de la règle. Deux contrôles rougissaient en désignant une accolade de
   prose. ⮕ Les commentaires sont désormais retirés avant lecture : mieux
   documenter le projet ne doit jamais casser ses tests.
4. **Une faute de frappe qui aurait vidé la carte au chargement** — mauvais nom
   de variable (`donnees` au lieu de `noeud`) dans le message d'une pastille de
   validation. Attrapée à la relecture du code avant exécution, pas par un test.

---

## ÉTAT DE LA SUITE AUTOMATISÉE

- **Vitest 2673/2673** (265 fichiers).
- **8 break-tests, 8 ROUGE** : famille coupée par `TYPES_AVEC_DUREE` · libellé
  qui affirme « certificative » sans choix · poignée repassée après le sélecteur ·
  pastille repassée devant la poignée · `plancherSelecteur` rendu constant ·
  signalement comptant les verbes déjà inexacts · nuance réintroduite dans une
  famille · débord de la poignée recouvrant le sélecteur.
- **Éprouvé au navigateur** (Chromium, `executablePath`
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`) : le menu permute, le
  verbe reste intact, le message se déclenche, la visée s'écrit, le type reste
  `evaluation`, zéro erreur console.

---

## AU RETOUR

1. **Trier les échecs** : défaut réel, ou build en retard ? (Vérifier le §0
   d'abord.)
2. **Verser chaque échec réel au BACKLOG** avec son numéro de porte.
3. **Mettre à jour ce fichier** : état, date, ce qui reste.
4. **Ne jamais laisser une porte « probablement passée »** : soit elle est
   cochée, soit elle est due.
