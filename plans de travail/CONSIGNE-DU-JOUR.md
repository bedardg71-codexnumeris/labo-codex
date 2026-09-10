# Consigne du jour — une seule règle pour qualifier un contexte

> **Écrite le 10 septembre 2026 par Cowork, sur un arbitrage de Grégoire du même jour.**
> Elle remplace le texte d'accueil de l'Aide, livré en `1.127.2` et archivé à côté sous
> `_ancienne-CONSIGNE-DU-JOUR-2026-09-09-texte-accueil-aide.md` — **commets l'archivage avec ton
> premier commit.**
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`,
> `TZ=America/Toronto date`.
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Les numéros de ligne ci-dessous ont été
> relevés le 10 septembre sur `5c29d3fd` ; vérifie-les avant d'écrire.
>
> **Préalable de lecture** : `Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md`, qui porte
> la mesure complète. Ne la refais pas.

---

## POURQUOI

Dans les mots de Grégoire, le 10 septembre :

> « L'application nomme un contexte et on ne sait pas comment elle fait pour le qualifier ainsi. »

Quatre mécanismes qualifient un contexte d'apprentissage, chacun avec sa règle écrite en dur chez
lui. **Le mot « Favorable » a trois définitions** :

| Où | Ce que « Favorable » veut dire | Source |
|---|---|---|
| Tableau de bord › Aperçu | bande 65 – 82,5 % de l'indice composite | `tableau-bord-apercu.js:1791` |
| Profil › contexte d'apprentissage | A ≥ 75 % **ET** C ≥ 75 % | `profil-etudiant-calculs.js:2026` |
| Profil › interprétation A-C | A ≥ 90 % **ET** C ≥ 90 % | `profil-etudiant-helpers.js:1049` |

Un étudiant à A = 80 %, C = 80 % est « Favorable » dans son profil et « Acceptable » quelques lignes
plus bas, **sur le même écran**. « Fragile » a le même défaut, trois définitions aussi.

▣ **Arbitrage de Grégoire, dans ses mots** : « Peu importe le chiffre, cette incohérence est à
corriger. Il faut unifier les définitions. » ⮕ **Le coût n'est pas à chiffrer. L'unification est
acquise.**

---

## ⛔ CE QUE CETTE CONSIGNE NE FAIT PAS

1. **Elle ne renomme rien.** « Fragile / Modéré / Favorable / Très favorable » restent tels quels à
   l'écran. Le renommage attend le travail d'automne avec l'orthopédagogue (`#821`).
2. **Elle ne déplace aucune borne.** 30 / 47,5 / 65 / 82,5 · 85 / 75 / 65 · 90 / 80 · 70 / 80 / 85 :
   toutes conservées à l'identique. ⚠ Les bornes de la légende viennent d'être rendues exactes le
   10 septembre (`#818`) — ne les rouvre pas en douce.
3. **Elle n'écrit dans aucune donnée.** Ni `seuilsInterpretation`, ni quoi que ce soit chez un
   utilisateur. Les réglages que des enseignants ont déjà faits **doivent survivre intacts** :
   `obtenirSeuil()` reste la seule porte d'entrée des seuils configurables.

⮕ **Le livrable de cette consigne est invisible à l'écran.** Si un pixel bouge, c'est un défaut.

---

## ⚠ LE PIÈGE — ce ne sont PAS quatre copies de la même règle

C'est la mesure qui a failli manquer, et elle change le travail. Les quatre mécanismes ne prennent
pas les mêmes entrées et ne rendent pas la même chose :

| # | Mécanisme | Entrée | Forme de la règle |
|---|---|---|---|
| 1 | Aperçu (`tableau-bord-apercu.js`) | un indice composite | **dégradé continu**, ne classe pas ; les bornes affichées sont dérivées de `ARRETS_DEGRADE` via `libelleBandeDistribution()` |
| 2 | Seuils d'interprétation (`interpretation-config.js`) | **un** pourcentage | 4 paliers, **configurable** (`obtenirSeuil('interpretation.*')`) |
| 3 | Contexte d'élève (`profil-etudiant-calculs.js:2010+`) | A **et** C | 4 paliers par **conjonction** (`A ≥ x && C ≥ x`), en dur |
| 4 | Interprétation A-C (`profil-etudiant-helpers.js:1040+`) | A **et** C | ≥ 9 branches par conjonction, bornes différentes, en dur |

⮕ **N'essaie pas de les fusionner en une fonction.** Une conjonction sur deux indices et un seuil
sur un scalaire ne se réduisent pas l'une à l'autre : les forcer produirait un changement de
comportement déguisé en refactorisation. **Le but n'est pas d'obtenir une règle, c'est d'obtenir un
seul ENDROIT où les règles sont écrites, déclarées, et comparables.**

---

## LE TRAVAIL — deux lots, une seule livraison à la fin

### LOT A — un module unique, comportement identique

Crée **`js/contexte-qualification.js`** (nom proposé ; tranche autrement si tu as mieux, et dis-le).
Il porte, en déclaratif et en un seul endroit :

- les **bornes** des quatre mécanismes, nommées, avec en commentaire leur provenance et leur date ;
- les **quatre fonctions de qualification**, une par mécanisme, déplacées telles quelles depuis leurs
  fichiers actuels — mêmes entrées, mêmes sorties, mêmes libellés, mêmes classes CSS de badge ;
- pour le mécanisme 2, **aucune borne en dur** : il continue de lire `obtenirSeuil()`.

Puis remplace les règles en dur par des appels, **un fichier à la fois** (`CLAUDE.md`, procédure de
développement, point 3) :
`tableau-bord-apercu.js` · `profil-etudiant-calculs.js` · `profil-etudiant-helpers.js` ·
`profil-etudiant-sections-affichage.js` · `etudiants.js`.

⛔ **Zéro-dette** (`CLAUDE.md`) : chaque règle déplacée est **retirée** de son fichier d'origine.
Pas d'alias, pas de « au cas où ».

**Ce que le lot A doit prouver, pas affirmer** — une sentinelle Vitest par mécanisme, qui fixe la
sortie AVANT/APRÈS sur une table de cas incluant **chaque borne et chaque borne ± 1 point** :

- A = 80 %, C = 80 % ⮕ mécanisme 3 rend « Favorable », mécanisme 4 rend « Acceptable ».
  **Cette divergence doit SURVIVRE au lot A.** Une sentinelle qui la fait disparaître prouve que tu
  as changé le comportement.
- A = 65 %, C = 64 % ⮕ mécanisme 3 : « Fragile » (la branche est un **OU**, pas un ET).
- Le mécanisme 2 avec un `seuilsInterpretation` stocké **partiel** ⮕ `fusionnerAvecDefauts()` comble,
  et les valeurs stockées ne bougent pas.

⚠ **Break-test obligatoire** (skill `verification-adverse` §4) : chaque sentinelle neuve doit avoir
été vue ÉCHOUER avant d'être crue.

⚠ **Deux sentinelles existantes couvrent ce terrain** et doivent rester vertes sans être réécrites :
`tests/unit/sentinelle-818b-curseurs-seuils-interpretation-branches.test.js` et
`tests/unit/sentinelle-audit-aide-lot-B-surfaces-concordent.test.js`.

⚠ `cd tests && npm run test:unit`. **PAS `npm test`** — il enchaîne Playwright, plus de dix minutes.

### LOT B — le tableau des divergences réelles

Une fois les quatre règles côte à côte dans un seul fichier, écris dans
`Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md`, en section neuve, **ce qui diverge
vraiment** : pour chaque mot employé par plus d'un mécanisme, les définitions concurrentes, et
**l'étendue de désaccord en points de pourcentage**.

⮕ C'est ce tableau qui part chez l'orthopédagogue cet automne. **Il est le vrai livrable de la
journée** : le lot A ne fait que le rendre possible.

⛔ **Aucune recommandation de borne dans ce tableau.** Constater, pas proposer : les bornes sont de
la pédagogie (`CLAUDE.md`, « ce qui remonte jusqu'à Grégoire », point 1).

---

## PORTE TERRAIN

Le lot A ne change rien à l'écran, donc **une seule porte**, et elle est un contrôle de
non-régression, pas une découverte :

- Ouvrir `https://app.codexnumeris.org` (⚠ **source unique de vérité** depuis le 8 septembre — pas le
  fichier local), sur un groupe réel, et confirmer que le tableau de bord et un profil d'élève
  affichent **exactement** les mêmes mots et les mêmes pourcentages qu'avant.

⮕ Skill `portes-terrain` : le markdown dans `plans de travail/` est à toi, **l'artefact est à
Cowork**. Une seule porte ne justifie probablement pas un artefact — tranche, et dis ce que tu as
supposé.

---

## CE QUI REMONTE À GRÉGOIRE

**Rien de ce lot, sauf ceci** : si, en déplaçant une règle, tu découvres qu'un mécanisme produit un
libellé que **personne n'affiche** (comme `interpreterPerformance`, supprimée en `#542` lot 3 parce
que son résultat n'était lu nulle part), **ne le supprime pas de ton chef** — inscris-le et continue
(`CLAUDE.md`, issue n° 2, le défaut).

Tout le reste est technique et mesurable : tranche, puis dis-le en une ligne en nommant ce que tu as
supposé.
