# Demande de relecture – lot 23 : l'outillage trié

> Claude Code, 12 octobre 2026, 8 h 23 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 20 à 24.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (749 fichiers, 8 742 essais).

## 1 · Ce qui change pour l'usager

La consigne disait « rien ne change à l'écran ». **Deux choses changent**, et je les nomme :

- **Boutons de l'accueil, de l'aide et de la visite guidée** : ils portaient `btn-primaire`, une classe sans règle ; ils portent maintenant `btn-principal`, le nom de la palette. Ils prennent la couleur du bouton principal (#679).
- **Profil de l'élève** : huit en-têtes de section (diagnostics, sections d'affichage) posaient `u-flex-between-mb15/20`, sans règle ; la règle existait sous le nom `d-flex-between-mb15/20`, que rien ne posait. Renommée : ces en-têtes s'alignent maintenant titre à gauche, actions à droite, avec leur marge (#679).
- Et, sans effet visible attendu : la visionneuse PDF, les graphiques et les exports PDF chargent leurs bibliothèques par une URL qui porte la version (#602).

Aucun de ces trois n'a été vu au navigateur.

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #642 | `91c4038d` | 139 masquages de `cle()` ; tri site par site, par la portée de chacun | **138 inertes** (aucun appel `cle(` dans leur portée) ; **1 défaut** : l'alias `const cle = window.cle \|\| (k => k)` de `mettreAJourBarreContexte` (trimestre-v2.js), retiré. Règle vérifiée : `masquagesActifs()` (helper) reste vide ; cliquet 139 → 138 |
| #784 | `87a4e5ac` | 9 conteneurs | **7 homonymes** (une variable du même nom réécrite par une autre fonction) : le détecteur cherche dans la portée de la déclaration ; **2 voulus**, raison écrite au banc (la carte des indicateurs garde ses enfants par `outerHTML`, clics délégués ; les rencontres recréent leur seul id) |
| #679 | `e2983cb6` | 248 classes (305 couples) | **142 crochets** lus par le JS (reconnus au banc, automatiquement) ; **106 muettes** ; 2 fautes corrigées (§ 1) ; cliquet 305 → 300 couples, muettes ≤ 103 |
| #602 | `ef99e2cc` | 4 balises `libs/` nues dans `index.html` ; le worker PDF sans jeton | jeton = la version de la bibliothèque (`chart ?v=4.4.1`, `chartjs-plugin-annotation ?v=3.0.1`, `jspdf ?v=2.5.1`, `jspdf-autotable ?v=3.8.1`, worker `?v=3.11.174`), comme `pdf.min.js` ; la liste-constat de #825 est vide |
| #616 | `9f14c0a9` | 85 lignes dans 44 bancs | outil `suitDansLaFonction` (tranche.js) ; **43 lignes de 21 bancs** converties ; le détecteur ne compte plus que les vraies bornes `[\s\S]{0,N}` hors commentaires ; **41 lignes / 28 bancs** restent |

Vérifications : #642, 1 mutation (l'alias remis), 2 rouges ; #784, 1 (le détecteur d'avant) ; #679, 2 (la borne des muettes à 102 ; `accueil.js` d'avant) ; #602, 1 (`travaux-visionneuse.js` d'avant) ; #616, l'outil : un commentaire de mille caractères entre les deux marqueurs laisse le banc #306 vert (l'ancien rougissait sur la même mutation), un geste inversé (`rendreModeFicheHoraireV2(false)`) le rougit ; témoin au banc.

## 3 · Coupé, avec la mesure

- **#616, le reste** : 41 lignes dans 28 bancs. Ce sont les formes que la conversion mécanique ne prend pas : bornes sur du HTML ou du YAML (l'ordre dans le fichier y serait plus faible que la distance), expressions sur plusieurs lignes, `.not.toMatch`, captures (`match(...)[1]`). À reborner un à un.
- **#679, les 103 muettes** : ni règle ni lecteur. Une partie est posée pour rien, une partie attend un style qui manque (21 sont à un trait d'une classe stylée, par exemple `u-texte-secondaire` / `texte-secondaire`, `td-center` / `td-center-80`). Chacune est un choix d'apparence : inscrites avec cette mesure.

## 4 · Ce que j'ai supposé – une ligne chacune

- #642 : un masquage sans appel `cle(` dans sa portée est voulu (un paramètre de `forEach`, une boucle sur des clés) ; le renommer ne changerait rien.
- #602 : la version de la bibliothèque est le bon jeton, puisqu'un fichier de `libs/` ne change qu'avec elle (`libs/VERSIONS.md`) ; la route de la spec du worker (`**/libs/pdf.worker.min.js*`) accepte déjà un `?v=`.
- #679 : une classe que le JS lit par un sélecteur est un crochet, même sans règle.
- #616 : convertir une borne en « ordre dans la fonction » n'affaiblit pas le banc quand les deux marqueurs sont dans la même fonction (vérifié : les 21 bancs restent verts, et la mutation de geste rougit).

## 5 · Documents à mettre à jour

- `libs/VERSIONS.md` (que je ne touche pas) pourrait dire que le jeton `?v=` d'`index.html` suit la version de chaque bibliothèque, et qu'il se change avec elle.

## 6 · Item de Nouvelles proposé

Aucun, sauf si Grégoire voit les deux changements d'apparence du § 1 et les garde : « Les boutons principaux de l'accueil et de l'aide prennent la couleur des autres boutons principaux. »
