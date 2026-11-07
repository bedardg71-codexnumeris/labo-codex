# Consigne – lever ce qui empêche le premier push conforme (bascule du verdict du soir vers GitHub, #1114)

> Écrite par Cowork le samedi 7 novembre 2026, 7 h 39 (Toronto). Décision de Grégoire (7 h 38) : finir aujourd'hui ce qui ne dépend pas de lui. **Aucun fichier de `js/`, `styles.css` ni `index.html` n'est touché** : rien ne change dans l'application.
>
> ⚠ Une autre session Cowork travaille en parallèle (logo, icône 180, `RELAIS.md` non commité) : n'ajoute que tes fichiers, par chemin.

## Ce qui reste du chantier

Le critère de bascule (BACKLOG #1114, réécrit le 28 oct.) : trois pushs d'affilée où le run complet de GitHub n'a aucune rouge hors des deux listes de `scripts/playwright-baseline-linux.json`, et où le Mac est vert. **Compteur : 0 sur 3.** Ce lot lève les trois obstacles techniques ; les essais qui rougissent sous Linux restent un lot à part.

## 1. Le jugement de GitHub, rouge depuis la purge

Le job « Playwright — verdict » du push de `a5be544f` dit « 1347 spec(s) NOUVELLEMENT rouges » alors que ses 16 morceaux sont verts (RELAIS.md, trouvaille inscrite). Cause supposée, non vérifiée : ce que le juge compare après la réécriture de l'historique.

- **Mesure d'abord** : le journal de l'étape « Fusionner et juger contre la baseline » sur les runs de `a5be544f`, `d9200c75`, `ff3a91bf` (`gh run view --log`), et ce que `scripts/juger-rapport-playwright.mjs` reçoit (rapport fusionné vide ou partiel, chemins, identités).
- Corrige la cause trouvée, pas le symptôme. **Témoin** : le juge rejoué sur le rapport du dernier run complet rend le bon verdict ; une rouge ajoutée à la main hors des listes le fait échouer (code 1).
- Puis **reclasse la baseline Linux** selon la règle du 28 oct. (rouge aux trois derniers runs complets : `echecsConnus` ; rouge à au moins un et verte à au moins un : `echecsIntermittents` ; verte aux trois : retirée). Dis combien d'entrées entrent, sortent, changent de liste.

## 2. Un commit de relais annule la vérification du code

`tests.yml` a `cancel-in-progress: true`, et ses `paths-ignore` ne nomment pas les fichiers de coordination de la racine (`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, `CONSIGNE-DEMARRAGE-COWORK.md`, `OBJECTIF-COHORTE-1.md`, `PROTOCOLE.md` au moins ; mesuré le 7 nov.). Un commit qui ne touche qu'eux relance un run et annule celui du code (4 pushs sur 12 entre le 25 oct. et le 1er nov.).

- **Mesure** : tous les `.md` suivis à la racine, et pour chacun, si l'application le lit (`grep` dans `js/`, `index.html`, le service worker).
- Ajoute aux `paths-ignore` ceux que l'application ne lit pas, et mets à jour `scripts/lot-observable.sh` et `tests/unit/sentinelle-ci-paths-ignore.test.js` ensemble. Liste explicite ou motif, au choix ; dis lequel et pourquoi. **Témoin** : le cliquet rougit si l'un des deux côtés oublie un fichier.

## 3. Le plafond de 30 minutes

`timeout-minutes: 30` sur les morceaux Playwright coupait 1 à 4 morceaux sur 5 pushs sur 12 (le plus long : 28 min 47 le 1er nov.).

- **Mesure** : la durée de chaque morceau sur les trois derniers runs complets, après les lots des pauses.
- Règle de Cowork : le plafond garde **au moins un tiers de marge** au-dessus du morceau le plus long mesuré. Si la marge manque, relève le plafond, ou passe à plus de morceaux si un morceau dépasse 25 min (dépôt public : les minutes d'Actions ne coûtent rien). Dis ce que tu as choisi.

## L'ordre et la livraison

Une branche, un commit par point, Vitest vert. Rapport à Cowork : pour chaque point, la mesure, la correction, le témoin. **Pas de push avant le verdict complet du Mac de ce soir**, au signal de Grégoire, comme d'habitude. Ce push sera le premier jugé par la règle : le compteur de #1114 se met à jour d'après son run complet.
