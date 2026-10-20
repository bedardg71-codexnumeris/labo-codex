# Rapport – la première vérification complète chez GitHub

> Claude Code, lundi 19 octobre 2026, 21 h 40 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-19-version-1.209.md`, temps B, étape 7 ; point 5 de `CONSIGNE-2026-10-16-verdict-sur-github.md`. **Non commité.**
> Les deux verdicts portent sur le même commit, `1dc31102` (1.209.0, build 1019-1956).

## En bref

| | Mac (WebKit, `verifier-playwright.mjs`) | GitHub (run 39351738665, 16 morceaux) |
|---|---|---|
| Verdict | **vert** : 0 échec, 0 instable | **rouge** : 25 specs absentes de la baseline |
| Essais | toute la suite | 808 joués : 781 verts, 2 verts au second essai, 25 rouges, 0 sauté |
| Durée | environ 69 min (lancé vers 19 h 58, jeton rendu à 21 h 07) | **21 min 47 s** de bout en bout (morceaux de 5 à 21 min) |
| Garde | éveil tenu, secteur, 0 veille, échange 1,6 Go, pression 1 | – |

Le push est parti à **21 h 07**, jugé par le jeton du Mac, comme le veut la décision du 10 oct. Le rouge de GitHub ne vient pas de la 1.209.0 : aucune des 25 rougeurs ne paraît sur le Mac.

## Les 25 rouges de GitHub, en trois familles

**1. Déjà rouges sous Linux le 16 oct. (14).** Elles figuraient dans les runs à la demande 38953736186 et 38962236596 (19 et 21 rouges) : #1007 (2), #1011 (2), #1012, #895 (3), lot I bis (2), J0 bis, #963, #929, le témoin à 360 px sombre. Messages : `ReferenceError` et `TypeError` dans `page.evaluate`, clics qui expirent sur #895, visibilité attendue absente. Je n'ai pas cherché plus loin ce soir.

**2. Une supposition de plateforme (2), `planif-menu-vue.spec.js`.** Le bouton affiche « Annuler (Ctrl+Z) » sous Linux, alors que la spec attend « ⌘Z ». L'application fait ce qu'elle doit, c'est la spec qui suppose un Mac. La deuxième (« chaque raccourci affiché a son essai ») a toutes les chances d'avoir la même cause (inférence, non vérifiée). Elle était déjà rouge le 16 oct. ; celle de ⌘Z est neuve dans la liste.

**3. Des specs qui n'avaient jamais tourné sur GitHub (9), toutes `materiel-*`.** Elles datent des 18 et 19 oct., après le départ de la branche du verdict, et tournaient ce soir pour la première fois sous Linux : 2a (3), 2b (2), 5, 7, 12 et la neuve de ce soir, `materiel-aide-accompagnement`. Deux motifs :
- `locator.click` attend 30 s que le bouton soit « visible, activé et **stable** », et il ne l'est jamais : étiquettes de la palette, « Créer ma grille » ;
- un comptage attendu à 0 trouve 1 : une bulle restée visible (`#tooltip-bulle.tooltip-visible`), un trait de lien encore tracé.

Inférence, non vérifiée : sous Linux, le pointeur que Playwright laisse sur un bouton fait paraître une bulle `data-tooltip`, ou une animation n'en finit pas. La règle de `docs/securite/TESTS-AUTOMATISES.md` §4 (le geste par l'événement DOM, pas par un clic à l'aveugle) vise ce cas. Sur le Mac, les 16 specs `materiel-*` sont vertes.

**Sorties de la liste depuis le 16 oct.** : #991, #892 (2), et #868, qui passe maintenant au second essai. **Instables ce soir** (vertes au second essai) : #868 et le témoin à 360 px clair.

## GitHub peut-il tenir lieu de verdict du soir ?

**Pas encore.** La raison n'est pas la vitesse : GitHub est trois fois plus rapide et ne charge pas le Mac la nuit. Elle tient à ce que mesure son rouge. Avec 25 rougeurs connues de Linux seul et une baseline commune vide (0 échec connu), il rougit à chaque push, quel que soit le lot. Un verdict qui rougit toujours ne départage rien.

Ma recommandation, en gestes, dans l'ordre :
1. **Une baseline propre à Linux** (`scripts/playwright-baseline-linux.json`), qui contient les 25 de ce soir. Le job de verdict la lit à la place de la commune. Une rougeur neuve redevient alors un signal.
2. **Corriger les 2 de `planif-menu-vue`** : la spec lit la plateforme au lieu de supposer ⌘Z. C'est un geste court.
3. **Les 9 `materiel-*`** : refaire leurs gestes par l'événement DOM (règle §4), puis les retirer de la baseline Linux.
4. **Le critère de bascule** : trois pushs d'affilée où la liste de GitHub est égale à la baseline Linux et où le Mac est vert. Ensuite GitHub juge le soir, et le Mac garde ce qui ne se juge que dans Safari : l'iPad, le `file://`, les gestes de pointeur réels.

La décision revient à Grégoire. **Il a retenu la recommandation le 19 oct., à 21 h 40.** Elle est inscrite au BACKLOG : #1114 (baseline Linux et critère de bascule), #1115 (`planif-menu-vue`), #1116 (les neuf `materiel-*`).

## À noter

- Le runner annonce que `ubuntu-latest` migre vers Ubuntu 26 à partir du 19 oct. Les runs du 16 tournaient sur l'ancienne image. Cela peut faire varier la liste d'un run à l'autre. C'est un fait affiché par GitHub, son effet n'est pas mesuré.
- Le contrôle demandé au relais du 17 (« la liste du Mac identique à celle d'avant la fusion ») tient : 0 échec connu le matin sur `22062197`, 0 ce soir sur `1dc31102`.
- Trouvaille, issue « inscrire et continuer » : les familles 2 et 3 sont à inscrire au BACKLOG si Grégoire retient la recommandation. Je ne l'ai pas fait ce soir.
