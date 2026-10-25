# Verdict de relecture – Les bibliothèques en deux colonnes, lot 1 : le composant et la bibliothèque des grilles (#1154)

> Cowork, dimanche 25 octobre 2026, 8 h 25 (Toronto). Relu : `DEMANDE-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-1.md`, la consigne et le plan, la maquette (les mots validés le 24 à 19 h 50), `ae34b7cd` en partie (`_renderApercu` et `_renderRangee` de `js/bibliotheque-ui.js`, `renderMenuActions`, le recalage de la sentinelle #467), la chaîne de « Supprimer définitivement » (`supprimerGrilleDefinitivement` l. 3074, `supprimerGrilleAvecPorteDeSortie` l. 2925 et sa confirmation), `partageExport.resoudreEntite`, deux captures (Mac 1 440 sombre, iPad 820 clair). Sécurité : noms, lignes, aperçu et total passent par `echapperHtml`, attributs et `aria-label` par `echapperAttribut` ; les onze interpolations ajoutées au cliquet #467 sont des valeurs du code (booléen, nombre, constantes, textes déjà échappés), nommées dans le fichier ; `marqueHtml` ne reçoit que le badge fixe « Dépistage ».
> **Pas relancé par Cowork** : Vitest, WebKit.

## Verdict : **accepté, avec une retouche** (§ 2)

La fenêtre est celle de la maquette : deux colonnes, un seul passage par rangée, l'aperçu qui se déplie au nom, ⋮, « Importer ou exporter ▾ ». Le banc éprouve les gestes dans le vrai `index.html`.

## 1. Ce que Claude Code a supposé ou décidé seul

| Question | Cowork |
|---|---|
| « Garder dans ma bibliothèque → » sans confirmation | **Accepté** : il ajoute un exemplaire, qui se retire d'un geste. |
| Les notifications du passage à l'unité | **Accepté**, sauf « ta sélection » : § 2.2. |
| Le badge « Dépistage » après le nom | **Accepté.** |
| La discipline quitte la rangée, « Inspiré de » passe dans l'aperçu | **Accepté** : la consigne fixe la ligne (types, nombre, auteur). |
| Le sous-titre parti | **Accepté** (en-tête sur une ligne). |
| La phrase « C'est d'ici que tu peux les partager. » retirée | **Accepté** : fausse dans ce lot. La maquette mettait « Exporter pour partager » dans le ⋮ de la bibliothèque ; l'export d'aujourd'hui (`partageExport.resoudreEntite`) ne lit que les grilles des trimestres : ce serait du code neuf. **Inscrire et continuer** : une ligne au plan, « Exporter pour partager depuis « Dans ta bibliothèque » (maquette) ; la phrase revient avec ce geste ». |
| `js/partage-section.js`, `js/gabarits-utils.js` | **Acceptés** : la section « Partagés » prend la forme des rangées ; le badge retiré n'avait plus de lecteur (zéro dette). |
| Une seule couleur forte | **Accepté.** |
| `conduireAuxImportes` lit le libellé de la case | **Accepté.** |
| Les captures sous `CAPTURES_1154` | **Accepté.** |
| `design-system.html` sans spécimen | **Au lot 3**, avant la mise en ligne groupée : un composant neuf entre dans la source de vérité visuelle avant que les utilisateurs le voient. |
| Le rouge anti-cache de Vitest (jetons du 25) | **Accepté**, sur la branche seulement : `scripts/release.mjs` repose les jetons à la fin du lot 3. Ne pas le contourner. |

## 2. La retouche

### 2.1 « Supprimer définitivement » garde l'exemplaire de la bibliothèque : décision de Grégoire, 25 oct., 8 h 22

Aujourd'hui, « Supprimer définitivement » (⋮ de « Dans ce trimestre », et l'action `supprimer` du bandeau des doublons, `js/grilles.js` l. ~2427) efface la grille du trimestre **et** son exemplaire de la bibliothèque (`retirerGrilleDeLaBibliotheque` dans `apres`, l. ~3084), sans le dire. **Décidé : l'exemplaire de la bibliothèque reste.** Motifs donnés à Grégoire : la fenêtre présente deux exemplaires séparés ; la bibliothèque est ce qu'il garde pour tous ses trimestres ; une grille effacée par erreur se ramène par « ← Utiliser dans ce trimestre » (même `id`).

1. `supprimerGrilleDefinitivement` (`js/grilles.js`) ne retire plus la grille de `bibliothequeGrilles`. Mesure ses appelants ; `donnees-v2.js` (onglet Données) a sa propre fonction du même nom : si elle sert un autre geste, laisse-la et nomme-la dans la demande (trois issues).
2. La confirmation (`supprimerGrilleAvecPorteDeSortie`, l. ~2954 : « Supprimer la grille « X » ? ») ajoute, **seulement quand un exemplaire du même `id` est dans la bibliothèque**, la phrase de Grégoire : « Son exemplaire de ta bibliothèque reste. » (après une ligne vide). Elle doit être vraie par tous les chemins qui l'affichent : mesure-les.
3. **Stock : rien.** Les grilles déjà supprimées ont perdu leur exemplaire ; rien ne se répare.
4. Preuve : WebKit, une grille présente dans les deux colonnes, « Supprimer définitivement » → elle quitte « Dans ce trimestre », reste dans « Dans ta bibliothèque », et « ← Utiliser dans ce trimestre » la ramène ; la phrase présente dans la confirmation avec un exemplaire, absente sans. Break-test.

### 2.2 « ta sélection » devient « ce trimestre », dans cette fenêtre (décidé par Cowork)

« Ta sélection » n'est plus un mot de la fenêtre des grilles ; ce qui en sort le dit :

- `js/grilles.js` l. ~2754 : « Grille ajoutée à ce trimestre ! »
- `js/grilles.js` l. ~2728 (garde #476) : « « X » est déjà dans ce trimestre. » puis la phrase sur « Dupliquer », inchangée.
- Le bandeau des doublons (`js/bibliotheque-ui.js` l. ~1226, « Dans ta sélection », « Bibliothèque ») : dans une fenêtre en deux colonnes, les titres de ses colonnes (« Dans ce trimestre », « Dans ta bibliothèque ») ; les neuf autres fenêtres gardent leurs mots jusqu'à leur lot.
- Les mêmes phrases dans `cartouches.js`, `echelles.js` et `pratiques-gestion.js` : à leur lot. Une ligne au plan.

### 2.3 Dans le même commit

Ce verdict ; les deux lignes au plan (§ 1, l'export depuis la bibliothèque ; § 2.2, les mots des autres fenêtres).

## 3. Portes terrain

Aucune pour ce lot : il ne part pas en ligne. **À la fin du lot 3**, avant la mise en ligne groupée, une porte pour l'iPad et Safari réels (la fenêtre au doigt, ⋮, l'aperçu, le défilement après un passage).

## 4. Les trouvailles

| Trouvaille | Cowork |
|---|---|
| #1160, la grille retirée introuvable | **D'accord : inscrite** ; ses deux pistes reviendront à Grégoire avec elle. |
| « Tout garder » verse aussi les grilles retirées | **D'accord : nommée**, sans suite (elle ramène plutôt qu'elle n'abîme). |
| En démonstration, « Garder » écrit dans la clé globale | **D'accord : nommée**, comportement d'avant le lot ; masquée par le filtre démo. |
