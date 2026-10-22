# Demande de relecture – Tout à la française, avec la virgule (#1137)

> Claude Code, jeudi 22 octobre 2026, sur `main`. Consigne : `CONSIGNE-LOT-2026-10-22-tout-a-la-virgule.md`. Quatre commits non poussés, après le miroir (`07bc5929`) : `b2f78fa7`, `6e7f448e`, `fbbd4904`, `7a314a7f`, plus le commit de clôture (spec WebKit, captures, cette demande). Pas de verdict complet, pas de version : au signal de Grégoire.

## Ce qui est fait

Tout nombre affiché qui n'est pas une note passe par `js/note-pourcentage.js` : virgule décimale, U+00A0 avant « % » et « pts ». Deux fonctions neuves, avec des décimales que l'appelant choisit : `formaterNombre(n, decimales)` et `formaterPourcentage(n, decimales)`. Avec `decimales`, elles sont fixes comme dans `toFixed` ; sans, il y en a deux au plus, sans zéro final. Les fonctions ne rendent jamais « -0 » et rendent `''` pour une valeur qui n'est pas un nombre. `formaterPoints` accepte désormais des décimales (une par défaut, la règle du PDF). L'en-tête du module est réécrit.

## La mesure, et où j'ai coupé

| Mesure (au `grep`, sur `07bc5929`) | Nombre |
|---|---|
| Lignes de `js/` où un nombre est suivi de « % » ou « pts » | 260, dont 235 hors CSS |
| `toFixed` dans `js/` | 158 |
| Lignes signalées par la sentinelle neuve avant conversion | 241, dans 41 fichiers |
| Formateurs locaux à la virgule | 23 `replace('.', ',')` dans 16 fichiers, plus 2 `_nb` sans virgule (formules, projection) |

Ces lignes se classent ainsi :

- **Affichage, converties** : environ 300 lignes ajoutées passent par le module. Ce sont les 235 sites, plus une trentaine de `toFixed` affichés sans « % » (« 3,25 / 4 », « r = 0,82 », « 14,90 », « +1,25σ », « 1,5 h »).
- **Rangés dans le module** : les formateurs locaux de 18 fichiers (`_nb` du miroir, des formules et de la projection, `nombreFr`, deux `fmt`, `mentionPonderee`, `B.nombreEnTexte`, `formaterBornePalier`, `formaterNombrePeriodes`, la note du registre, `taille-fichier`, les présences imprimables, la planification, les corrélations, l'impact des jetons). Il ne reste qu'un seul `replace('.', ',')`, dans le module.
- **Non lus, laissés** : les largeurs CSS (barres, jauges, dégradés, filtres d'image) et le journal de la console.
- **Liste blanche nommée** : 6 entrées, chacune avec son motif dans la sentinelle.
  - Le journal #353 de `db.js`.
  - Le plan exporté (`planification-export.js`), deux lignes : c'est un export, gardé à l'octet par `golden-exports-416`.
  - La largeur CSS des colonnes de l'aperçu PDF, deux lignes.
  - L'écho des bornes saisies dans le matériel : une chaîne tapée, pas un nombre.
- **Calcul et stock** : rien n'est réécrit. `ponderationNormalisee` et `differenceGlobale` restent des données. Les saisies et les exports CSV, JSON et codex ne changent pas.

Le lot est coupé en quatre commits, un par famille. L'étape 1 pose le module et range les virgules locales. L'étape 2 couvre les indices, les taux et le profil (tableau de bord, liste, interventions, présences, bilan réflexif). L'étape 3 couvre les pondérations, les points, la configuration et le PDF des grilles. L'étape 4 couvre les graphiques, le zoom et la compression. Chaque commit garde Vitest vert. La liste `EN_COURS` de la sentinelle se vide d'étape en étape, puis elle est retirée à l'étape 4.

## Suppositions à confirmer (décidées seul)

1. **Les « 60% » écrits en dur** passent aussi à l'insécable quand ils partagent une phrase ou un élément avec un nombre converti : « note de passage (60 %) », « P < 65 % », « Le total dépasse 100 % », les boutons de zoom. Les autres textes figés restent tels quels : environ 25 lignes de `js/` en prose (aides, descriptions des pratiques prédéfinies, changelog), plus le HTML statique d'`index.html`. Ce sont des mots, pas des nombres calculés : je ne les ai pas inscrits au BACKLOG.
2. **Le plan exporté garde « (20 %) » avec une espace ordinaire.** Le gabarit le traite comme un export. Si Grégoire le lit comme un document à lire, il suffit de retirer deux entrées de la liste blanche et de mettre à jour le golden.
3. **Un nombre que l'appelant avait déjà arrondi en chaîne perd son zéro final** : « 92.0% » devient « 92 % », par exemple pour le taux d'assiduité du profil. La pondération unitaire garde deux décimales fixes (« 17,50 % »), comme avant.
4. **Le stock** : la formule chiffrée et la projection EUF sont générées à l'affichage. Les rétroactions déjà copiées ou enregistrées avant ce lot gardent leurs « 0.5 erreur ». C'est assumé : on tarit la source sans réparer le stock.
5. **`security-ok`** sur huit `innerHTML` qui interpolent `formaterPourcentage`. Sa sortie ne contient que des chiffres, une virgule, U+00A0 et « % », ou rien.

## Les bancs

- **`sentinelle-nombres-a-la-francaise-1137`**, en trois parties :
  - A : les fonctions (virgule, U+00A0 et non `&nbsp;`, arrondi, zéro, négatif, -0, non-nombres).
  - B : l'invariant sur tout `js/`, hors de la liste blanche, avec une garde contre les entrées périmées.
  - C : un seul `replace('.', ',')`.
- **Break-tests** (code restauré ensuite, `cmp` identique) :
  - `poids ${r.poids.toFixed(1)} %` dans le profil et `(v * 100).toFixed(0) + '%'` dans une graduation : B rougit en nommant les deux lignes.
  - `String(n).replace('.', ',')` dans le miroir : C rougit.
- **Vitest complet** : 797 fichiers, 9 397 tests verts. 40 bancs existants sont modifiés : ils attendaient « 90% » ou « 74.5 », ou ils montaient un module sans `note-pourcentage.js`. Leurs attentes passent à l'insécable et à la virgule. Ceux qui ramènent `\s+` à une espace le disent en commentaire.
- **WebKit, `nombres-1137-profil-et-graphique-a-la-virgule.spec.js`** : 2 tests verts.
  - Le profil lit « Note finale = 44,5 pts + 28,4 pts = 72,9 % », avec des insécables. Il ne reste dans le profil aucun « % » collé, aucune espace ordinaire avant « % » ou « pts », aucun point décimal.
  - Le graphique de progression lit « 0 % … 100 % » sur l'axe et « Assiduité (A): 90 % » dans l'infobulle.
- **WebKit, specs des écrans touchés** : 148 fichiers, 483 tests. Ce sont toutes les specs qui lisent un nombre affiché, plus celles du profil, du tableau de bord, des graphiques, des évaluations, des grilles, des pratiques, des productions et des présences.
  - Premier passage : 466 verts et 17 rouges. Tous les rouges venaient d'une attente écrite à l'ancienne forme (« 90% », « 24.5 pts », « (65%) ») ; aucune régression.
  - Les 14 fichiers corrigés sont repassés verts.
  - Selon la façon dont chaque spec lit le texte, l'attente prend l'insécable (texte brut), une espace ordinaire (`\s+` ramené à une espace) ou `&nbsp;` (`innerHTML`). Le commentaire le dit là où ce n'est pas évident.
  - Ce n'est pas le verdict complet : il n'a pas été lancé.

## Mac et iPad

Le débordement a été mesuré dans WebKit, à 1 440 et à 820 px, sur le profil et sur sa section « Progression temporelle ». Aucun élément ne déborde (`scrollWidth > clientWidth`) et la page n'a pas de défilement horizontal. Les captures sont dans `captures-2026-10-22-tout-a-la-virgule/` : `profil-1440.png` et `graphique-progression-820.png`. Le tableau de bord n'a pas été rendu avec des données à 820 px : c'est une porte pour Grégoire s'il le juge utile.

## À regarder en priorité

1. La liste blanche et la supposition 2 : est-ce que le plan exporté est un export ?
2. La supposition 1 : jusqu'où vont les « 100% » en dur ?
3. `formaterNombre` sans décimales arrondit à deux au plus. C'est la règle des anciens `_nb` et `formaterBornePalier`, mais `B.nombreEnTexte` et `nombreFr` n'arrondissaient pas.
