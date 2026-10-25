# Demande de relecture – Le rouge de GitHub sur la 1.217.0

> Claude Code, dimanche 25 octobre 2026, vers 10 h (Toronto). Consigne : `CONSIGNE-LOT-2026-10-25-rouge-github-1217.md`. Sur `main`, rien sur la branche des bibliothèques. Pas de release, pas de verdict complet, pas de push.

## En bref

**Aucune régression du code.** Les 32 rougeurs du run GitHub de `973ad366` (1.217.0) se répartissent ainsi : 22 étaient déjà là le 19 oct., 10 sont nouvelles, et 3 rougeurs du 19 oct. sont passées au vert. Les dix nouvelles passent sur le Mac, en relance ciblée sur le `main` d'aujourd'hui, et le jeton complet du Mac était vert sur `973ad366`. Chacune retombe dans une famille déjà connue sous Linux. **La baseline Linux de #1114 est créée** (32 entrées) et le job de verdict la lit. Rejoué sur le rapport de `973ad366`, le juge rend « aucune rougeur nouvelle ». Le critère de bascule de #1114 ne change pas, et le jeton du Mac reste le juge du push.

## 1. Les sources

- **Run de la 1.217.0** : 40128243995, sur `973ad366`. 889 essais joués, 852 verts, 5 verts au second essai, 32 rouges, 2 sautés. Il n'y a pas de run plus récent sur `main` : les 22 commits locaux ne sont pas poussés.
- **Run de référence, le 19 oct.** : 39351738665, sur `1dc31102`, avec ses 25 rougeurs. Le rapport du 19 oct. ne donnait que des familles. La liste exacte vient du log de ce run.
- **Erreurs** : les rapports blob des 16 morceaux ont été fusionnés en JSON, puis les error-context et les traces de `playwright-traces-*` lus. Ces artefacts sont dans le scratchpad et ne sont pas commités.
- **Mac** : WebKit, une spec à la fois, sur `b34e1f1c`. La mémoire libre était entre 64 et 67 % avant chaque lancement. La CI tourne aussi en WebKit, je n'ai donc pas lancé Chromium.

## 2. Le tableau

Légende : « Mac ✓ » veut dire vert, soit au jeton complet de `973ad366`, soit en relance ciblée aujourd'hui (R). « Linux » donne les deux essais du run 40128243995.

### Les nouveaux (10)

| Spec › essai | Mac | Linux | Ce qui bloque sous Linux | Cause | Issue |
|---|---|---|---|---|---|
| `1007-propose-codex-avant-suppression` › Une porte par famille (P2, P29, paramètre, G1) | ✓ R | ✗ ✗ | l. 146, `mettreAJour` : la fenêtre « Ton codex est prêt » attend « Enregistrer » | environnement : `navigator.userActivation` absente ou expirée sous Linux, d'où le chemin du toucher frais du lot J0 bis (`_motifToucherFrais`, `js/codex.js`). Même mécanisme que l'ancien P8 (l. 185) et que J0 bis | baseline Linux |
| `1007-propose-codex-avant-suppression` › P8, une écriture pendant l'attente | ✓ R | ✗ ✗ | idem, l. 146 | idem | baseline Linux |
| `bareme-1` › une grille de la dissection | ✓ R | ✗ ✗ | l. 88 : « Créer ma grille » jamais « stable » | environnement : la famille du clic « stable » de #1116 (la spec date du 20 oct., c'est son premier passage sous Linux) | baseline Linux, puis #1116 |
| `bareme-1` › un refus n'écrit rien | ✓ R | ✗ ✗ | délai dépassé l. 116, après les gestes de la palette | idem | baseline Linux, puis #1116 |
| `bareme-1` › à 1440 px | ✓ R | ✗ ✗ | l. 49 : l'étiquette de la palette jamais « stable » | idem | baseline Linux, puis #1116 |
| `materiel-1119` › « Coller une autre grille » sur la confirmation | ✓ R | ✗ ✗ | l. 194 : clic jamais « stable » | idem ; l'essai voisin de la même spec passe au second essai | baseline Linux, puis #1116 |
| `materiel-1119` › un brouillon devenu illisible | ✓ R | ✗ ✗ | l. 212 : idem | idem | baseline Linux, puis #1116 |
| `materiel-dissection-11` › chaque geste s'enregistre | ✓ R | ✗ ✗ | l. 195 : « Coller une autre grille » (avec `data-tooltip`) jamais « stable » | idem ; les deux autres essais de la spec passent | baseline Linux, puis #1116 |
| `nettoyage-sans-perte-892` › la liste est vue | ✓ R | ✗ ✗ | l. 113 : « Proposer un nettoyage » jamais « stable » | environnement, **instable d'un run à l'autre** : rouge le 16 oct., vert le 19, rouge le 24 ; l'essai voisin passe au second essai | baseline Linux |
| `codex-991-selection-aller-retour` › les copies sont rangées | ✓ R | ✗ ✗ | l. 105 : `Codex.charger` ne rend pas la main | environnement, **instable d'un run à l'autre** : rouge le 16 oct., vert le 19, rouge le 24 ; c'est la famille codex sous Linux | baseline Linux |

**Pourquoi « environnement » et pas « régression ».** Les faits d'abord. Les dix passent sur le Mac. Dans la plage `1dc31102..973ad366`, `js/codex.js` ne change que des mots (les titres de l'aperçu, `formaterPourcentage`) : ni `_motifToucherFrais` ni le chemin d'écriture ne bougent. Aucune règle `animation`, `transition` ou `@keyframes` n’entre dans `styles.css` ni dans `css/` (une seule occurrence du mot, dans un commentaire). Ensuite l'inférence. Le clic jamais « stable » et le toucher frais tiennent au moteur WebKit de Linux (le rythme des images, l'activation de l'utilisateur), pas au code de la 1.217.0. Ce que je n'ai pas pu faire : relancer trois fois sous Linux, faute de Linux ici. Un run « à la demande » sur `973ad366` donnerait un deuxième échantillon, mais je ne l'ai pas lancé : c'est un geste sur GitHub, que la consigne ne demande pas.

### Les anciens (22) : déjà rouges le 19 oct., verts sur le Mac

| Famille | Specs › essais | Issue |
|---|---|---|
| Codex sous Linux | `1007-codex-a-part` › X1, fenêtre de choix (Chrome) ; `1007-propose-codex` › P8 (évaluation) ; `codex-1011` × 2 ; `codex-1012` › (1) ; `lot-i-bis-la-case` › (1) et (3) ; `lot-j0-bis` › réel | baseline Linux |
| #895 | `exporter-des-travaux-une-carte-895` × 2 | baseline Linux |
| #1115, la plateforme | `planif-menu-vue` × 2 (⌘Z) | baseline Linux, puis #1115 |
| Planificateur | `planif-modele-ia-963`, `planif-zone-non-planifie-929` | baseline Linux |
| #1116, le clic « stable » | `materiel-aide-accompagnement` ; `materiel-dissection-2a` × 3, `2b` × 2, `5`, `7` | baseline Linux, puis #1116 |

### Les réparés (3) : rouges le 19 oct., verts le 24

| Spec › essai | Note |
|---|---|
| `exporter-des-travaux-une-carte-895` › « Par étudiant·e », sans compression | hors baseline |
| `materiel-dissection-12` › les touchers de la capture | hors baseline |
| `temoin-enregistrement-lot-b` › 360 px, sombre | hors baseline ; instable le 19 oct. (son jumeau « clair » est passé au second essai) |

⚠ La consigne limite la baseline aux anciens et aux nouveaux. Ces trois-là n'y sont donc pas. Si l'un d'eux rougit de nouveau au prochain run, le verdict de GitHub sera rouge pour lui : c'est un signal, pas une régression.

## 3. Ce qui change dans le dépôt

- **`scripts/playwright-baseline-linux.json`** (neuf) : les 32 entrées, triées. Le fichier dit sa source et sa règle : il rétrécit à la main.
- **`scripts/juger-rapport-playwright.mjs`** : un second argument facultatif nomme la baseline. Sans lui, c'est la commune, celle du Mac (`verifier-playwright.mjs` n'est pas touché). Le résumé nomme le fichier de baseline. Une entrée d'une baseline nommée qui repasse au vert est dite « à retirer de … , à la main ».
- **`.github/workflows/tests.yml`** : le job de verdict passe `../scripts/playwright-baseline-linux.json` au juge. Les commentaires sont mis à jour.
- **`tests/unit/sentinelle-ci-verdict-morceaux.test.js`** : trois essais neufs. C.f vérifie que la baseline nommée est celle qui juge, et que la réparée ne bloque pas. C.g vérifie qu'une baseline nommée mais absente rend NON JUGÉ. D.a vérifie que le workflow passe la baseline Linux et que le fichier est bien formé. **Break-tests** : le juge qui ignore `argv[3]` fait rougir C.f et C.g ; le workflow sans la baseline Linux fait rougir D.a. Dans les deux cas, l'original est remis.
- **`BACKLOG.md`** : le constat ajouté à #1114 (baseline créée, 0 push conforme sur 3).
- Vitest : **9 696 / 9 696**.

## 4. Pour Cowork

1. **Le classement en « environnement » des dix nouvelles.** Il est argumenté plus haut, mais il n'a pas été relancé sous Linux. Faut-il un run à la demande sur `973ad366` avant la version du soir ?
2. **Les trois réparés hors baseline** (§ 2) : on les garde dehors comme le veut la consigne, ou on les y met pour éviter un rouge de pur hasard ?
3. **Le premier push conforme** : la version du soir sera le premier essai du critère de bascule. Elle porte aussi 22 commits non poussés, dont de nouvelles specs que Linux n'a jamais jouées.

## 5. Trouvailles

| Trouvaille | Issue |
|---|---|
| Les nouvelles specs de la famille du clic « stable » (`bareme-1`, `materiel-1119`, `materiel-dissection-11`) et `nettoyage-sans-perte-892` | **Inscrit** : rattachées à #1116 par la note de #1114 |
| `SESSION.md` arrêté depuis le 15 sept. ; le relais vit dans `RELAIS.md` (rituel de début de session) | **Commenter et oublier** : rien ne casse, c'est la pratique actuelle |
| Le « Dernier ID utilisé » du BACKLOG de `main` dit #1153, alors que la branche des bibliothèques est montée jusqu'à #1161 | **Inscrire et continuer** : à régler à la fusion. Aucun numéro n'a été posé sur `main` dans ce lot |
