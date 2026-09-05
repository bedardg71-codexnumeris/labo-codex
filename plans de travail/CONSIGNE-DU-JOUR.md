# Consigne du 5 septembre 2026 — trois lots, une livraison : 1.119

> **Écrite le 4 septembre 2026 à 19 h 12 (Toronto), par Cowork, à froid, avec Grégoire.**
> **Application au moment de l'écriture : `1.117.1` en ligne (build `0904-1507`) ; 1.118 (le texte troué,
> étape 2) codée sur `main` en local, cinq commits d'avance, en retouche, NON livrée.**
> ⚠ **Ce fichier ne devient `CONSIGNE-DU-JOUR.md` qu'APRÈS le push de 1.118** (§6 de la consigne du 4). Si tu
> lis ceci sous son nom du 5 septembre, c'est que 1.118 est en ligne : remesure (`git --no-optional-locks log
> --oneline -3`, `cat version.json`) et dis-le en tête de ton premier rapport.
> ⚠ **Si tu lis ceci plus de quelques heures après le début de la journée, remesure avant d'exécuter.**

---

## Ce que cette journée produit à l'écran, pour Grégoire

Trois lots, **une seule livraison, 1.119, en fin de journée** (décision de Grégoire, 4 septembre au soir :
« les 3 étapes, mais avec une seule release à la fin »). Chaque lot se termine par son coup d'œil AVANT que le
suivant commence ; aucun push entre les lots.

- **Lot A (matin) — le gabarit algorithmique ne montre plus deux fois ses sous-critères.** La carte « Codes
  d'annotation » disparaît ; la liste « Sous-critères » porte tout : code, nom, pondération, pastille de
  couleur, chevrons, corbeille, et le texte du code sous un pli par rangée. La case « Utiliser ces
  sous-critères comme codes d'annotation » est en tête de la liste ; couleur et texte n'apparaissent que si
  elle est cochée. Une ligne dit où vit la palette globale.
- **Lot B (midi) — les collections de paramètres.** Dans la carte « Projection », il enregistre ses paliers
  sous un nom (« EUF »), et les retrouve dans le menu de projection d'une grille neuve. Choisir une
  collection COPIE ses paliers dans le critère.
- **Lot C (après-midi) — les mêmes gestes partout.** Hors de l'éditeur de grille, plus de « ✕ » rouge : la
  corbeille ; plus de pile « Ordre » : les chevrons ; et la grille à deux colonnes du formulaire de
  groupe-cours (empruntée par les paliers) s'empile sur iPad en portrait.

▣ **Cowork a mesuré le 4 au soir, à ne pas redécouvrir** : les codes par grille SONT LIVRÉS depuis le
3 septembre (`js/codes-annotation.js`, commits `2084c20f`…`61982b1f` ; `grep -rl CODES_ERREURS_FR js/` rend
**1** fichier, le repli). Le lot A n'est que la fusion des deux rendus du gabarit. « Description / Rétroaction »
est **un seul champ** dans les données (`sc.retroaction`, `codes-annotation.js:222`) ; le sous-critère 0 « trop
petit pour diagnostiquer » vit dans les données (pack démo `:14097`), pas dans le code. **Aucun format ne
change au lot A.**

---

## 0 · Lis d'abord

1. `PROTOCOLE.md` (règles 1, 2, 7) ; `OU-EN-EST-ON.md` en tête.
2. Ton bloc de clôture de 1.118 dans `SESSION.md` (`grep -n "1.118" SESSION.md`, jamais en entier).
3. Par lot, le cadrage nommé dans sa section. ⛔ Pas les 130 autres fichiers de `plans de travail/`.

---

## Lot A — une seule liste : sous-critères et codes (`js/grilles.js`, `styles.css`, `index.html` pour le bump)

Source : `plans de travail/CADRAGE-2026-09-03-codes-par-grille.md`, points **6, 7 et 8** (lis-les d'abord).

**Mesure d'abord, en une ligne chacune** : `rendreBlocCodesAlgo` (`grilles.js:~4123`) et le bloc
« Sous-critères » du même gabarit — quels champs chacun rend ; `rendreActivationCodes` (la case) ; et si le
second gabarit (`:~4176`, l'écran d'évaluation) rend aussi les deux blocs.

**Ce qui est arrêté (Grégoire, 4 septembre, points 7 et 8 du cadrage)** :
- une seule liste, une rangée par sous-critère : code · nom · pondération · pastille de couleur · chevrons ·
  corbeille ; le texte du code (« Observation », un seul champ, `sc.retroaction`) sous un pli par rangée, fermé
  par défaut (règle des cartes : fermé ce qui porte les mots) ;
- la case « Utiliser ces sous-critères comme codes d'annotation » en tête de la liste ; **couleur et texte
  n'apparaissent que si elle est cochée** ;
- la carte « Codes d'annotation » disparaît ; ce qu'elle disait d'utile (l'aide, la trace du 3 septembre) va
  sous la case, en une ligne ;
- **le mot est « Observation »** pour le champ du code (jamais « Description / Rétroaction », jamais
  « rétroaction ») ;
- **la ligne qui dit où vit la palette globale** (point 6 du cadrage), sous la case, texte de départ à
  reprendre par Grégoire au coup d'œil : « Sans cette case, la copie utilise la palette générale (Annoter ›
  palette). Cochée, ce sont ces sous-critères qui deviennent les codes de la copie. » ;
- les plis vivent en mémoire (`plisGabaritAlgo`), jamais dans la grille ; le gabarit se redessine à chaque
  frappe, les plis se relisent ;
- **rien ne change dans les données** : mêmes clés `sousCriteres[].{code,nom,ponderation,couleur,retroaction}`,
  même drapeau d'activation. Témoin : le golden #668 et les sentinelles de `codes-annotation` passent sans
  modification ; `git diff -- js/codes-annotation.js js/import-export.js js/partage-schemas.js` rend zéro.
- `echapperHtml` sur tout texte rendu ; cibles ≥ 44 px (iPad) autour de la corbeille et des chevrons.

**Témoins** : la sentinelle du gabarit (`sentinelle-lot4-C-gabarit-algo-range.test.js`, adapte-la) vérifie
qu'un sous-critère n'est rendu qu'UNE fois, que couleur et texte sont absents du rendu quand la case est
décochée et présents quand elle est cochée ; break-test. Le spec WebKit du lot 4 (`lot4-gabarit-algo-cartes`)
coche la case, écrit une observation, recharge, la relit.

**Fin du lot A** : un ou deux commits, ce fichier avec ; rapport à Cowork ; **coup d'œil de Grégoire** (Conception
› Grilles › un critère algorithmique : une seule liste, la case en tête, la couleur qui apparaît quand il
coche) ; les mots de la ligne « palette » sont à lui.

---

## Lot B — les collections de paramètres (`js/evaluation-projection.js`, `js/grilles.js`, la bibliothèque)

Source : `plans de travail/CADRAGE-2026-09-03-collections-de-parametres.md` — **tranché par Grégoire : la
COPIE** (choisir une collection verse ses paliers dans le critère ; corriger la collection ne touche aucune
grille, aucune évaluation). Hors périmètre, nommé là : le menu des formules, une collection formule +
projection, toute migration, le partage entre enseignants.

**D'abord une carte courte (30 min, `plans de travail/CARTE-2026-09-05-collections.md`), rendue à Cowork
avant le code** — ce lot crée un objet neuf dans les données de Grégoire (règle 2) :
- **où la collection s'enregistre** : la cinquième famille de la bibliothèque
  (`BibliothequeUI.repertoires.enregistrer`, quatre appels existants : grilles, échelles, pratiques,
  productions) ; **clé namespacée par trimestre via `cle()`**, comme `echellesTemplates` (skill
  `integrite-globaux` : lis-le avant d'écrire une clé) ; ce que la collection porte exactement (les paliers
  retenus `_paliersRetenus` + `nomServiceAide` + `motsReference` + `erreursTolerees` ? — mesure ce que
  « les quatre paliers et le nom du service arrivent réglés » exige, cadrage « Fini quand ») ;
- **où elle se choisit** : le menu de projection du critère (`listerModeles`, `evaluation-projection.js:~242`)
  reste une liste fermée de modèles livrés ; les collections de l'utilisateur s'y ajoutent sous un
  sous-titre (« Mes collections ») — mesure comment le menu est rendu et si un `optgroup` passe par le
  rendu existant ;
- **le geste d'enregistrement** : un bouton dans la carte « Projection », « Enregistrer ces paliers sous un
  nom… » — nom demandé inline (⛔ pas de `prompt()`, skill `design-interface` : pas de modale quand une
  section inline suffit) ; un nom déjà pris se dit ;
- **ce que voit une grille qui a copié une collection ensuite supprimée** : rien ne change (c'est la copie) ;
  dis-le en une ligne dans l'aide ;
- **ce qu'export et import font de la clé neuve** (`import-export.js` : schéma des clés) — si la clé n'est
  pas exportée, dis-le et propose ; ⛔ rien dans le partage entre enseignants pour ce lot.

**Après la relecture de la carte par Cowork** (une passe courte, pas de décision de Grégoire attendue sauf
les mots du bouton et du sous-titre) : le code, un commit par volet (registre + bibliothèque · gabarit ·
spec). Sentinelle Vitest sur le module réel : enregistrer, lister, appliquer (les paliers copiés sont égaux
mais pas identiques : `!==`), supprimer la collection ne change pas le critère ; break-test. Spec WebKit :
régler un palier, enregistrer sous « EUF », créer une grille, choisir « EUF », relire les paliers.

**Fin du lot B** : rapport à Cowork ; **coup d'œil de Grégoire** (le « Fini quand » du cadrage, tel quel).


---

## Lot D — le texte troué, étape 3 : le badge s'affiche dans la phrase (ajouté le 5 septembre à 8 h 59, par Cowork)

> **Décision de Grégoire (5 septembre, entre 8 h 53 et 8 h 58)** : l'étape 3 se fait **aujourd'hui**, pas après le 14. **Ordre de la
> journée corrigé : A → B → D → C.** L'étape 4 (les badges qu'on invente) reste hors de ce jour : elle rouvre un arrêté
> du 2 septembre (« palette fixe d'abord ») et la question qui la commande — avec quoi un badge inventé se remplit-il
> à la correction ? — est didactique, à trancher à froid avec Grégoire ; Cowork la cadre ce soir ou demain.
> ⚠ Relecture croisée par Cowork sur la carte de B en cours à l'heure où ceci s'écrit ; D ne commence qu'après le
> coup d'œil de Grégoire sur B.

**Ce que Grégoire verra** : dans toute zone qui offre des badges (les deux zones de chaque palier, le décompte, les
trois énoncés de « Observation »), un badge posé s'affiche **comme un badge** — la pastille bleue ou verte, sans
accolades, dans le fil de la phrase — au lieu du texte `{erreurs}`. Il se retire comme un caractère (effacement
arrière) ou d'un clic sur sa croix ; le texte autour se tape comme aujourd'hui. **Rien ne change dans ce qui est
enregistré** : la grille porte toujours `{erreurs}` en texte brut, c'est le format que lit le moteur et qui voyage.
Sur iPad, le doigt fait ce que la souris fait.

**Source** : `plans de travail/CADRAGE-2026-09-02-badges-texte-troue.md`, section « ▣ Le mécanisme de glissé existe
déjà » (lis-la d'abord) : le patron est celui de `planification-carte.js` (suivre le POINTEUR, `pointerdown` /
`pointermove` / `setPointerCapture`), ⛔ jamais `dragstart` / `drop` (capricieux sur iPadOS) ; **le clic pour insérer
au curseur reste le chemin principal**. ⚠ Ce que le cadrage dit neuf, et qui est la moitié du travail : viser une
position dans du texte, calée au bord d'un mot.

**D'abord une carte courte (`plans de travail/CARTE-2026-09-05-texte-troue-etape-3.md`), rendue à Cowork avant le
code** — c'est un composeur neuf, pas une finition :
- **le composant** : mesure ce que le dépôt a déjà de plus proche (`grep -rn "contenteditable" js/`, les chips de la
  palette d'annotation, `rendreBoutonsReperes`) ; propose UNE zone éditable où les jetons sont rendus en chips et le
  reste en texte ; dis comment on **sérialise** (chips → `{jeton}`) et **désérialise** (texte → chips), et prouve
  l'aller-retour par une sentinelle : pour tout texte de la palette, `serialiser(deserialiser(t)) === t` ;
- **l'écriture** : la zone écrit par les MÊMES handlers (`modifierPalierProjection*`, `modifierTexteEnonce*`), la même
  valeur texte, au même moment (en quittant la zone) ; mesure ce que `data-on-change` fait d'un élément
  `contenteditable` (`main.js`, le dispatcher `'data-on-' + eventType`) : si `change` ne se déclenche pas, dis quel
  événement le remplace et où il se branche, ⛔ sans handler inline ;
- **la sécurité** : tout texte tapé passe par `echapperHtml` avant de revenir dans le rendu ; un `{jeton}` inconnu
  reste du texte (ligne orange inchangée) ; coller du HTML dans la zone ne rend que du texte ;
- **le repli** : si une plateforme casse (Safari iPad), la zone redevient le `textarea` d'aujourd'hui — dis comment on
  bascule (un drapeau mesuré à l'ouverture, pas une option) ;
- **le glissé** : hors de cette carte si le clic au curseur tient ; s'il entre, c'est le patron de la carte mentale,
  et il vient en dernier volet, séparable.

**Après la relecture de Cowork** : le code, un commit par volet (composant + sentinelle d'aller-retour · branchement
dans les zones · spec WebKit qui pose un badge au clic, tape autour, recharge, relit `{erreurs}` dans la grille ET
la chip à l'écran). Sentinelles : aller-retour ; un badge inconnu rendu texte ; `echapperHtml` ; **aucun changement
de `critere.paliersProjection[].texte`, `.texteAide`, `critere.enonces.*` pour une grille existante rechargée sans
modification** (break-test : une sérialisation qui ajoute une espace rougit). `git diff -- js/evaluation-projection.js
js/evaluation-enonces.js js/import-export.js js/partage-schemas.js` : **zéro**.

**Fin du lot D** : rapport à Cowork, **relecture croisée** (composeur neuf : règle 2), puis **porte terrain iPad**
(skill `portes-terrain` : Claude Code écrit le markdown dans `plans de travail/`, Cowork publie l'artefact) —
poser un badge au doigt, taper autour, effacer un badge, quitter la zone, recharger. **1.119 ne part avec D que si
la porte iPad est passée** ; sinon D attend, et 1.119 part avec A, B (et C s'il est fini).

---

## Lot C — les mêmes gestes partout (cadrage design, écrit à froid par Cowork le 4 au soir)

Source de la mesure : consigne du 4 (archivée, `_ancienne-CONSIGNE-DU-JOUR-2026-09-04-lot-4-et-release-1.117.md`,
§7 c-d) et ton rapport du lot 4 : hors de l'éditeur de grille, le « ✕ » rouge vit dans la bibliothèque (1 site)
et la pratique de notation v2 (3 sites) ; la pile « Ordre » dans l'éditeur d'échelles (3 sites,
`echelles.js:1239`, `:3238`, `:3576`) ; la grille à deux colonnes du formulaire de groupe-cours (empruntée par
les paliers) n'a **aucune règle d'empilement** en portrait iPad. **Remesure ces comptes avant de toucher
(`grep -n "✕" js/*.js`, `grep -n ">Ordre<" js/*.js`) et dis-les.**

**Les trois règles, arrêtées (skill `design-interface` : `design-system.html` reste la source ; variables CSS
de `styles.css`, aucune couleur en dur ; deux modes ; cibles ≥ 44 px)** :

1. **Un seul bouton de suppression dans toute l'application : la corbeille** grise en coin, à droite, icône
   seule, cible tactile ≥ 44 px — celle des critères et des productions, celle que l'éditeur de grille a
   adoptée en 1.117. Ce que chaque suppression FAIT et DIT ne change pas d'un mot (les confirmations #647 et
   sœurs restent). C'est le rendu qui change, pas le geste.
2. **Un seul geste pour changer l'ordre : les chevrons « ∧ ∨ »** à droite du nom, sur la ligne de la corbeille
   — le modèle des productions. Mêmes fonctions de déplacement qu'aujourd'hui ; l'ordre enregistré ne
   change pas. La colonne « Ordre » de l'éditeur d'échelles disparaît, ses flèches deviennent les chevrons de
   la rangée.
3. **Une règle d'empilement pour la grille à deux colonnes** (`sous-critere-champs-grid`, le formulaire de
   groupe-cours, les paliers) : sous 768 px de large — iPad en portrait — une seule colonne, l'étiquette
   au-dessus de chaque champ, dans l'ordre de lecture. **Une règle CSS, une classe, appliquée aux deux écrans** ;
   mesure d'abord ce que `@media (max-width: 768px)` (`styles.css:1508`, `:5351`) fait déjà de ces grilles,
   et emprunte plutôt que d'ajouter.

**Périmètre** : `styles.css`, les fichiers qui rendent les sites mesurés (`bibliotheque-ui.js`, la pratique
de notation v2, `echelles.js`, le formulaire de groupe-cours), `index.html` pour le bump. ⛔ Aucun changement
de données, aucune confirmation modifiée, aucun libellé de suppression réécrit.
⛔ **Ne touche pas** : « dire qu'un document reçu est une copie » (#696) et les libellés « la bibliothèque » —
c'est un lot de mots, pas de gestes ; il reste inscrit.

**Témoins** : une sentinelle qui rend chaque site mesuré et vérifie qu'aucun bouton « ✕ » de suppression ni
colonne « Ordre » ne subsiste (break-test : réintroduis un « ✕ », elle rougit) ; le spec WebKit de l'éditeur
d'échelles déplace un niveau par le chevron et supprime par la corbeille ; **l'empilement iPad ne se juge
pas ici** : c'est une porte terrain de Grégoire (iPad, portrait, le formulaire de groupe-cours et un palier).

**Fin du lot C** : rapport à Cowork ; **coup d'œil de Grégoire** (Mac : la bibliothèque et l'éditeur
d'échelles ; iPad en portrait : le formulaire de groupe-cours).

---

## La fin de journée — 1.119

```
lot A → coup d'œil → lot B (carte, relecture, code) → coup d'œil → lot D (carte, relecture, code, relecture croisée, porte iPad) → lot C → coup d'œil
  → relecture croisée de Cowork sur le lot B seulement (l'objet neuf dans ses données) — A et C au jugement
  → ce qui est cassé se corrige, ce qui est une envie s'inscrit
  → verdict au jeton (scripts/pousser.sh) → release MINEURE 1.119, TROIS entrées de changelog dont les mots
    sont à Grégoire (Cowork les lui propose) → push → on n'attend pas le run (règle 7)
```

⚠ **Règle de Grégoire pour cette journée** : les trois lots, une seule livraison. Si le lot C n'est pas fini à
l'heure où il s'arrête, 1.119 part avec A et B, et C attend — jamais l'inverse.
⚠ **Chaque rapport à Grégoire : un objet, court.** Le détail va dans `SESSION.md`.
