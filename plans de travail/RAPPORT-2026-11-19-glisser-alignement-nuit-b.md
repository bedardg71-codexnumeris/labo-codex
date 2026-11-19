# Rapport, 19 au 20 nov. 2026 (session de nuit B), lot 1 : le glisser d'Alignement (#1295), EN DOUBLE

**Dernier relais.** Branche `lot/glisser-alignement-nuit-b`, partie d'`origin/main` `ade09e939` (1.250.0). Consigne : `plans de travail/CONSIGNE-LOT-2026-11-19-glisser-alignement.md`. **ARRÊTÉ AU PUSH, SANS PR : le lot était déjà fait ailleurs.** Au moment de pousser (19 nov., 22 h 38 UTC), `lot/glisser-alignement` existait sur origin, poussée à 22 h 36 UTC par une autre session (consigne `2e463125`, 16 h 29 heure de l'Est ; correctif `465c2970`, 17 h 36), avec sa PR d'aperçu : [bedardg71-codexnumeris/labo-codex#34](https://github.com/bedardg71-codexnumeris/labo-codex/pull/34). Les deux sessions ont reçu le même lot sans se voir. **Rien n'a été fusionné, écrasé ni poussé sur sa branche.** Ce rapport garde le travail de cette session-ci pour comparaison ; la décision de ce qu'on garde revient à Cowork (et à Grégoire).

### La collision, mesurée

- **Même diagnostic, même forme de correctif** : `throttleRAF` garde le dernier mouvement ; le relâchement applique sa propre position (`pointerup`) ou le dernier mouvement reçu (`pointercancel`), dans les six mêmes relâchements (feuille, conteneur, groupe, libre, poignée de taille, lasso). Même nom de banc (`planif-glisser-relachement-1295.spec.js`) et de rapport : les deux branches ne se fusionnent pas l'une dans l'autre sans arbitrage.
- **Ce que la PR #34 a et que cette branche n'a pas** : des mesures **sous WebKit** (son banc 6 sur 6 vert, 0 sur 6 sans le correctif ; `parcours-5` 3 sur 3 seul) ; la datation du défaut (`a0bc2e9c4`, 28 fév. 2026) ; et une garde que ma version n'a pas : **« rien sur un clic »**. Ma version applique la position du `pointerup` même sans mouvement : un simple clic sur un bloc rejoue l'aimantation, qui peut le décaler de quelques pixels vers un guide (lu dans le code, non mesuré). ⮕ **Recommandé : garder la PR #34.**
- **Ce que cette branche a en plus, à reprendre dans la PR #34 si Cowork le juge utile** : la sentinelle Vitest `tests/unit/sentinelle-glisser-relachement-1295.test.js` (le contrat de la fonction sur une horloge d'images simulée, et un cliquet : tout mouvement limité rangé dans une variable est vidé au relâchement) ; des essais de plus dans le banc (CAS C, groupe, poignée de taille, lasso, geste annulé, bloc posé à côté de tout ; 18 essais, sans pause fixe) ; la ligne de console qui mesure le stock (§6) ; la mesure de la trace (69 ms par mouvement avec, 17 à 20 sans, §5).
- **Le lot 2 part de la PR #34** (`origin/lot/glisser-alignement`), pas de cette branche : c'est la branche que nomme le mandat, et la seule mesurée sous WebKit.
- **Un point à regarder pour la PR #34, non tranché ici** : sous Chromium, à 820 × 1180, `planif-corbeille-fixe-1070` « glissé jusqu'à la corbeille et relâché » est déjà intermittent sur l'ancien code (2 rouges sur 3) ; il est rouge 3 sur 3 avec mon correctif et 2 sur 2 (une fois à chaque taille) avec celui de la PR #34. Sonde : sur l'ancien code aussi, la cible visée tombe au-dessus de la corbeille quand la page a défilé. Cause non établie ; attribution non faite. Il est aux échecs connus sous Linux ; le verdict du Mac dira s'il bouge.

**Ce qui suit est le rapport du travail de cette session, tel qu'il était avant la collision** (le §7 parle de « sortir parcours-5 des échecs connus » : ce retrait n'est PAS sur cette branche, la PR #34 le porte).

## 1. Mesures préalables

- **Le banc `parcours-5` tel quel est VERT sous Chromium** sur `ade09e939` (4 sur 4). Le rouge du 19 nov. a été mesuré sur le Mac, sous WebKit.
- **Pourquoi Chromium ne le voit pas** (mesuré, sonde non gardée) : son `page.mouse.move` n'est livré qu'à raison d'un mouvement par image. Un glisser de 12 pas : 13 `pointermove` reçus, 12 appliqués, l'activité entre dans la leçon.
- **Le rythme de WebKit, reproduit** : plusieurs mouvements dans la même image, puis le relâchement avant l'image suivante. Fabriqués dans une seule tâche, sur une carte vide (une leçon, une activité) : **12 mouvements → aucun appliqué avant le relâchement ; l'activité reste à son point de départ, `parent` nul ; l'image en attente s'applique APRÈS le dépôt**.
- **Le banc `parcours-5` lui-même, sous ce rythme** (ses 11 ou 12 − K premiers pas par la vraie souris, ses K derniers et le relâchement dans la même tâche ; copie non gardée du banc) sur l'ancien code :

| K (mouvements dans la dernière image) | Résultat |
|---|---|
| 0 ou 1 | vert |
| 2, 3 | rouge à l'étape 6 (l'évaluation posée au-dessus de l'activité tombe dessous) |
| 6, 12 | **rouge à l'étape 5, la ligne 334 du Mac** (l'activité n'entre pas dans la leçon) |

  Les deux formes du rouge rapportées le 19 nov. (étape 5 ; étape 6 quand les mouvements sont espacés) sortent du même mécanisme, selon le nombre de mouvements perdus.

## 2. La cause : CONFIRMÉE, avec une seconde moitié

La cause avancée tient : `throttleRAF` (`js/planification-carte.js`) gardait le PREMIER `pointermove` d'une image et jetait les suivants ; le relâchement ne relisait pas sa propre position et jugeait le dépôt sur un point en retard. **S'y ajoute un second effet, mesuré** : l'image demandée avant le relâchement s'exécutait APRÈS lui. Le bloc était alors redéplacé (et une leçon pouvait se resurligner) après `sauvegarder()` : à l'écran, l'activité semble posée sur la leçon, mais elle n'y est pas rangée.

## 3. La correction

- `throttleRAF` garde le DERNIER événement de l'image et expose `vider()` (applique tout de suite le mouvement en attente) et `annuler()`.
- `appliquerPositionDuRelachement(limite, fn, e)` : au `pointerup`, le mouvement en attente est retiré et la position du relâchement appliquée avant que le dépôt ne cherche sa cible ; au `pointercancel` (l'iPad reprend le geste), seul le dernier mouvement reçu s'applique, la position d'un geste annulé n'étant pas fiable.
- Appelée au début des relâchements des glisser **CAS B** (une feuille dans sa leçon, ou vers une autre), **CAS C** (un conteneur), **CAS D** (un bloc libre) et **du groupe** ; à la **poignée de taille** ; le **lasso** fait `vider()` (sa sélection se calculait déjà sur la position du relâchement).
- Jeton `?v=` de `js/planification-carte.js` : `20261110a` → `20261119n`.

**Source ou stock** : la correction tarit la source (§6 pour le stock).

## 4. Les autres usages de `throttleRAF`, et le « Planificateur »

| Usage | Défaut avant | Disposition |
|---|---|---|
| glisser CAS B, C, D, groupe | dépôt jugé en retard ; image fantôme après le dépôt | corrigé (§3) |
| poignée de taille (`redimensionner`) | taille enregistrée en retard ; l'image fantôme changeait la taille affichée après l'enregistrement | corrigé |
| lasso (sélection au rectangle) | un lasso rapide ne choisissait RIEN (le geste se croyait immobile) ; le cadre pouvait reparaître après le relâchement | corrigé (`vider()`) |
| saisie du titre, des objectifs (`input`) | aucun : la fonction relit le texte au moment de l'image, pas l'événement | inchangé, relu |
| « Planificateur » : glisser d'une pastille de leçon dans la grille des semaines | aucun : pas de `throttleRAF`, le relâchement relit sa propre position (`rangeeSousPointeur(e.clientX, e.clientY)`) | inchangé, relu |
| tracer ou reconnecter un lien | aucun : pas de limitation, le relâchement relit sa position | inchangé, relu |

**À la souris comme au doigt** : tout passe par les Pointer Events ; le banc joue le CAS D au doigt (`pointerType: 'touch'`) et le geste annulé au doigt.

## 5. La date de la régression : PAS DANS L'APPLICATION

- **`js/planification-carte.js` est identique sur `1661ade8c` (vert) et `8449f25cc` (rouge)** (`git diff` vide).
- **Le même modèle rejoué sur `1661ade8c`** (arbre à part) **rougit aux mêmes lignes** : K = 2 à l'étape 6, K = 6 à l'étape 5. La géométrie du parcours n'a pas changé ; l'application était déjà vulnérable.
- **Ce qui a changé entre les deux, et qui touche le rythme du banc** : `dc5bc4f3` (17 nov., 5 h 28) remplace `trace: 'retain-on-failure'` par `'on-first-retry'` dans `tests/playwright.config.js` ; entré sur `main` par `a2ce7777` (17 nov., 6 h 11, la 1.249.0). Mesuré ici (Chromium) : un `page.mouse.move` coûte **69 ms avec la trace, 17 à 20 ms sans**. Avant, la trace étalait donc chaque mouvement sur plusieurs images ; depuis, sous WebKit, plusieurs mouvements tombent dans la même image.
- Les cinq points mesurés le 19 nov. concordent : verts avant `a2ce7777` (`1661ade8c`, `66c2a464f`), rouges après (`5eb39289e`, `1b2cfe766`, `8449f25cc`).
- ⚠ **Inférence, non mesurée sous WebKit** (absent du conteneur) : une bissection commit par commit sur le Mac n'a pas été faite. Le défaut de l'application est plus ancien : au moins antérieur au 11 nov. (le clone de la session s'arrête là), et le banc de #148 (18 août) espaçait déjà ses mouvements de 40 ms parce que « le headless ne produit pas de frame entre des moves consécutifs ».

## 6. Source ou stock : LE STOCK RESTE

- Une activité mal déposée reste **libre** (`parent` nul) : rien ne la rattache au chargement (`trouverConteneurParRecouvrement` n'est appelée qu'au dépôt et à la création ; lu dans le code, non rejoué). Elle est enregistrée au point en retard, puis, à l'enregistrement suivant, au point où l'image fantôme l'a portée : souvent posée sur la leçon sans y être rangée. Elle ne compte alors ni dans la durée de la leçon, ni dans l'ordre activité-évaluation.
- **Non vécu** à ce jour (#1295 le dit) : le stock est probablement vide ou petit.
- **Proposé, rien n'est réparé** : mesurer, carte par carte, dans la console de Safari, la carte ouverte dans Alignement (lecture seule) :

  ```js
  [...planificationCarte.etat.noeuds.values()].filter((n) => !n.parent && planificationCarte.trouverConteneurParRecouvrement(n.id, n.type)).map((n) => n.titre || n.type)
  ```

  Elle rend la liste des blocs libres posés à plus de moitié sur une leçon (ou une séquence) qui les accepterait ; `[]` si aucun. Pour chacun, le remède est le geste lui-même : le reglisser dans sa leçon. Ce qui ne se voit pas : un bloc enregistré juste à côté de la leçon (le point en retard) ne se distingue pas d'un bloc libre voulu.
- **Décision de Grégoire** : faire la mesure, ou non.

## 7. Les bancs

- **Neuf** : `tests/integration/planif-glisser-relachement-1295.spec.js`, 9 essais × 2 tailles (1180 × 820, 820 × 1180) : CAS D à la souris, au doigt, posé à côté de tout, geste annulé ; CAS B ; CAS C ; groupe ; poignée de taille ; lasso. **18 sur 18 verts ; break-test : l'ancien `planification-carte.js` remis → 18 rouges sur 18**, chacun sur son assertion (parent nul, position en retard de toute la course, évaluation restée dans l'ancienne leçon, taille 211 au lieu de ≥ 329, lasso sans choix).
- **Neuf** : `tests/unit/sentinelle-glisser-relachement-1295.test.js`, 13 essais : le contrat de la vraie fonction (tirée du fichier, sur une horloge d'images simulée) et un cliquet (chaque mouvement limité rangé dans une variable est vidé ou remplacé au relâchement ; aucun `throttleRAF` anonyme sur un `pointermove`). Break-tests par mutation : garder le premier mouvement → 3 rouges ; ne plus retirer l'image en attente au `pointerup` → 1 rouge.
- **`parcours-5`** (« les sept étapes… (1180 px) »), rejoué seul, sans second essai, avec le correctif : **6 verts sur 6 tel quel**, et **6 verts sur 6 sous le rythme de WebKit** (K = 6, la condition qui rougissait à la ligne 334 sur l'ancien code). Le retrait des échecs connus était prévu ici ; il n'est pas sur cette branche (la PR #34 le porte, mesuré sous WebKit).
- Sans pause fixe : le banc neuf attend l'application (`attendreApplication`) et deux images, jamais un délai (cliquet `sentinelle-pauses-apres-ouverture`).

## 8. Tests joués

- **Vitest complet, lancé depuis `tests/`** : 933 fichiers, 11 924 essais ; un seul rouge au premier passage, `sentinelle-pauses-apres-ouverture` (le banc neuf et les sondes temporaires écrivaient des pauses fixes). Sondes retirées, banc réécrit sur des conditions (l'application prête, deux images) : la sentinelle et le banc sont verts, le break-test reste à 18 rouges.
- **Playwright Chromium, fichiers liés** (`planif-alignement`, `-badges-objectifs-964`, `-corbeille-fixe-1070`, `-date-inspecteur-695`, `-drag-pointer-148`, `-guide-966`, `-menu-vue`, `-pastille-evaluation-965`, `-toolbar`, `-tout-voir-loupe`, `-zone-non-planifie-929`), à 1180 × 820 : **55 verts, 3 rouges**, les trois déjà tenus pour échecs connus sous Linux (`scripts/playwright-baseline-linux.json`) : « #1070 — glissé jusqu'à la corbeille et relâché… », et deux de `planif-menu-vue` (le raccourci ⌘Z d'un Mac, « chaque raccourci affiché a son essai »). À 820 × 1180 : **54 verts, 4 rouges** : les trois mêmes que sur l'ancien code à cette taille (`planif-menu-vue` : ⌘Z, « chaque raccourci affiché a son essai », « raccourci « multi-selection » »), plus `#1070` (voir l'en-tête : intermittent sur l'ancien code).
- **`parcours-5`** : 6 sur 6 tel quel, 6 sur 6 sous le rythme de WebKit (§7). **Banc neuf** : 18 sur 18 (deux tailles).
- **WebKit** : par GitHub, au push de la branche.

## 9. Ligne de Nouvelles PROPOSÉE (rien n'est écrit au changelog)

> Alignement : une activité glissée rapidement tombe là où tu la lâches. Lâchée sur une leçon, elle y entre, à la souris comme au doigt.

## 10. Trouvailles hors lot

- **Inscrit nulle part, à lire au verdict de GitHub** : la baseline Linux (`scripts/playwright-baseline-linux.json`) tient pour échec connu « #1070 — glissé jusqu'à la corbeille et relâché, le bloc est supprimé » (`planif-corbeille-fixe-1070`). C'est un glisser, sous WebKit Linux : il peut devenir vert avec ce correctif. Rien n'est retiré de cette liste avant que GitHub l'ait vu.
- **Commenter et oublier (issue 3)** : `planif-drag-pointer-148` espace ses mouvements de 40 ms pour contourner l'ancien `throttleRAF` ; ce n'est plus nécessaire, et c'est sans conséquence. Laissé tel quel.
- **Hors lot, non inscrit (aucun symptôme vécu)** : un geste annulé (`pointercancel`) dépose quand même le bloc là où il est (rattachement compris) ; le lasso ne filtre pas son `pointerId`. Comportements d'avant, inchangés.

## 11. Supposé, non vérifié

- **Supposé** : au `pointercancel`, appliquer le dernier mouvement reçu plutôt que la position de l'événement (une position d'annulation n'est pas fiable). Le comportement qui suit l'annulation (le dépôt se fait quand même) est celui d'avant, inchangé.
- **Supposé** : le jeton `20261119n` (« n » pour la nuit), pour ne pas croiser un jeton de jour.
- **Non vérifié** : Safari sur le Mac et sur l'iPad (WebKit absent du conteneur) ; le jugement WebKit Linux viendra de GitHub au push. La date du §5 est une inférence appuyée sur des mesures, pas une bissection sous WebKit.
- **Porte terrain** : aucune rangée due (règles 1 et 2 du skill : comportement, rien d'irréversible) ; celle de la PR #34 fait foi.
