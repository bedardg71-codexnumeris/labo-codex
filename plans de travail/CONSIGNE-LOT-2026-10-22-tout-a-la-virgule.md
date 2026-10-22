# Consigne – Tout à la française, avec la virgule (#1137)

> Écrite par Cowork le jeudi 22 octobre 2026 vers 8 h 10 (Toronto), sur `main` à `07bc5929` (le miroir et ses retouches, non poussés). Décision de Grégoire : 22 oct., 6 h 59. Fiche : #1137 (BACKLOG), qui porte la mesure du 21 oct.

## Ce que Grégoire a décidé

Tout nombre affiché qui n'est pas une note passe à la norme que les notes suivent depuis la 1.213 : **virgule décimale, espace insécable U+00A0 avant « % »**. Cela comprend les indices (A, C, P), les taux, les pondérations, les points, les critères diagnostiques, les axes et les infobulles des graphiques, les valeurs de configuration affichées. À l'écran **et** dans le PDF de l'élève.

## Ce qui ne change pas (choix de Cowork, techniques)

- **Les champs où l'on tape un nombre** : saisie inchangée (`<input type="number">` et leurs valeurs).
- **Ce qui voyage** : les exports (CSV, JSON, codex, partage) gardent leur forme actuelle. Ce sont des données, pas de l'affichage.
- **Les valeurs stockées et les calculs** : rien n'est réécrit en base, rien ne change dans un calcul. Ce lot ne touche que l'affichage, donc aucun stock.

## Ce qu'il faut

1. **Mesure d'abord**, au `grep`, en partant de la liste de #1137. Mesuré par Cowork ce matin, à titre d'ordre de grandeur seulement : environ 200 lignes de `js/` où un nombre touche « % », environ 160 `toFixed`. Classe chaque site : affichage (à convertir), saisie, export, calcul (à laisser). Écris le décompte dans la demande de relecture.
2. **Une seule famille de fonctions** dans `js/note-pourcentage.js`, qui devient le module de l'affichage des nombres. Garde `formaterNotePourcentage`, `formaterNoteNombre` et `formaterPoints` ; ajoute ce qu'il faut pour un nombre et un pourcentage quelconques, avec un nombre de décimales choisi par l'appelant (un indice et une pondération n'ont pas toujours la même précision). Mets l'en-tête du module à jour : sa phrase « Pas les indices, les taux… : ils gardent leur forme » devient fausse.
3. **Les doublons qui existent déjà se rangent ici** : `_nb` de `js/miroir-algo.js`, le `replace('.', ',')` de `mentionPonderee` (`js/evaluation-enonces.js`), et tout autre formateur local à la virgule que la mesure trouvera. Un seul formateur à la fin.
4. **Les graphiques** (Chart.js) : graduations et infobulles par la même fonction. Le mot « % » suit l'espace insécable aussi sur les axes.
5. **Découpage** : si la mesure dépasse ce qu'un lot relisible porte, coupe par famille (par exemple : indices et taux ; pondérations et points ; graphiques ; PDF), un commit par famille, dans la journée. Dis où tu as coupé.

## Mac et iPad

Aucun changement de mise en page attendu, mais l'espace insécable peut allonger une étiquette d'axe ou une cellule : vérifie le profil, le tableau de bord et un graphique de progression à 1 440 px et à 820 px, sans débordement.

## Les bancs

- **Une sentinelle statique** sur le modèle de `sentinelle-note-pourcentage-affichage.test.js` : aucun fichier de `js/` n'affiche un nombre suivi de « % » ou de « pts » sans passer par le module, hors d'une liste blanche nommée et justifiée (saisies, exports). Elle doit rougir si l'on remet un `toFixed(1) + '%'` dans un site converti (break-test, code restauré, `cmp`).
- **Vitest** sur les fonctions neuves : virgule, U+00A0 (jamais `&nbsp;`), arrondi, zéro, négatif, valeur non numérique.
- **WebKit** : le profil d'un élève (indices et note finale composée, « 44,5 pts + 28,4 pts = 72,9 % ») et un graphique de progression lisent la virgule.
- Vitest complet vert ; specs WebKit du profil, du tableau de bord et des graphiques vertes.

## Ce qu'il ne faut pas

- Changer une saisie, un export, une valeur stockée ou un calcul.
- Toucher `js/config.js`, `js/navigation.js` ou `noms_stables.json`.
- Le verdict complet, un numéro de version, le push : la version portera le miroir et ce lot, au signal de Grégoire.

## Livrer

Un ou plusieurs commits sur `main`, non poussés, avec cette consigne, les bancs et deux captures (le profil d'un élève à 1 440 px ; un graphique de progression à 820 px), puis la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-22-tout-a-la-virgule.md`. `/fin-de-session` avant le dernier commit, sans le verdict complet. **Puis arrête-toi.**
