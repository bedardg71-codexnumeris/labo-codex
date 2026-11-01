# Rapport – La palette Évaluation n'a qu'une barre de défilement (#1214, 1er novembre 2026)

> Pour Cowork, en relecture. Commit sur `main`, **pas de push**, pas de release. `SUIVI-BUGS.md` : aux corrigés, « codé, pas en ligne ».

## En tête : la mesure ne confirme pas exactement la cause écrite

- **Cinq éléments pouvaient défiler, pas trois.** La consigne nommait la palette, le contenu et le corps. S'y ajoutent `.travaux-panneau-lateral` (le panneau) et `.zone-criteres .conteneur-liste` (la liste).
- **Le plafond de 750 px de la liste faisait pire que défiler : il tronquait les critères.** Les rangées de la grille s'écrasaient dans ces 750 px et le `overflow: hidden` des cartes coupait le reste. Le critère algorithmique montrait 63 px sur 287.
- **Je n'ai jamais mesuré deux éléments de la palette débordant en même temps.** Celui qui défile change avec la disposition, et la page défile derrière (1061 px pour 820). *Inférence* : le « double défilement » vécu est ce couple palette et page, ou ce changement d'élément. Je n'ai pas vu la capture, et ni sa grille ni l'iPad ne sont rejoués ici.

## La mesure (WebKit, 1180 × 820, 10 critères et 1 algorithmique)

| Disposition | Avant : qui défile (sur 5 candidats) | Après : qui défile (seul candidat) |
|---|---|---|
| À l'ouverture | le panneau, 853 pour 620 | le contenu, 1760 pour 598 |
| Toute la hauteur, 320 px (la capture) | la palette, 886 pour 631 | le contenu, 1086 pour 598 |
| Plein écran | la palette, 886 pour 751 | le contenu, 1086 pour 718 |
| Après ↔ | la palette, 886 pour 631 | le contenu, 1086 pour 598 |
| Après ↕ | la palette, 886 pour 631 | le contenu, 1760 pour 598 |
| Repliée | aucun | aucun |

| Autre mesure | Avant | Après |
|---|---|---|
| Carte de critère, 200 px de large | 63 px montrés sur 131 | 131 sur 131 |
| Carte algorithmique, 200 px | 63 sur 287 | 287 sur 287 |
| Carte de critère, 320 px | 120 sur 145 | 145 sur 145 |
| Carte algorithmique, 320 px | 120 sur 228 | 228 sur 228 |
| Bas de la palette à l'ouverture, zone finissant à 1060 | 1070 : 10 px hors d'atteinte | 1048 |

## Le correctif (`styles.css`, plus le jeton de `index.html`)

- **Une seule recette pour les trois palettes `.travaux-palette-eval`** : palette en colonne flex, `overflow: hidden`, bornée à sa zone (`max-height: calc(100% - 24px)`) ; contenu `flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain`.
- **Le panneau, son corps et la liste** prennent leur hauteur et ne défilent plus.
- **La Rétroaction** ne garde que sa hauteur et son `padding` : ses doublons sont retirés.
- **Le `.palette-flottante` générique** n'est pas touché.
- **Jeton** : `styles.css?v=20261031b`, la date du build, comme l'exige la sentinelle anti-cache. Mon premier jeton, `20261101a`, l'a fait rougir.
- **Sélecteur retiré** : `.travaux-palette-eval .travaux-palette-contenu`, dans la règle réécrite (aucune occurrence dans `js/` ni `index.html`).

**Source ou stock : affichage seulement, pas de stock.** Une position enregistrée reste valable ; une hauteur enregistrée trop grande est bornée à l'affichage, sans rien écrire.

**Paramètres : même famille, même défaut** (panneau qui défile, 10 px hors d'atteinte), corrigée par la règle commune. **Rétroaction : déjà correcte** ; son champ de texte garde son défilement, c'est un champ de saisie.

**Supposition nommée** : la poignée ne peut plus agrandir la palette au-delà de sa zone. Je juge cela voulu : une palette plus haute serait coupée.

## Le test et les contre-épreuves

`tests/integration/palette-evaluation-un-defilement-1214.spec.js`, 4 essais verts. Il compte ce qui **peut** défiler, pas seulement ce qui déborde : un `overflow-y: auto` remis sur le corps ne déborde pas et serait passé inaperçu.

Chaque mutation a été appliquée seule, avec un témoin, puis `styles.css` restauré et son empreinte vérifiée.

| Mutation de `styles.css` | Rouges sur 4 |
|---|---|
| `overflow-y: auto` remis sur le corps (celle de la consigne) | 3 |
| Le panneau garde son défilement | 4 |
| La liste retrouve son plafond | 2 |
| La palette défile de nouveau | 3 |
| La palette n'est plus bornée | 4 |
| `overscroll-behavior: contain` retiré | 1 : la page défile de 241 px sous la molette |
| La palette n'est plus en colonne | 3 |

## Vérifié, et pas vérifié

- **Vitest entier** : 10 615 verts.
- **WebKit, specs touchées** : 46 verts et 1 sauté (palette d'annotation, #644, #651, #868, #911, #1122, #1213, rendu de l'évaluation), puis 17 verts et 3 sautés (#773, #774, glisser, en-têtes, critère algorithmique, carrousel).
- **Captures** en clair et en sombre, en plein écran : critère algorithmique entier, note visible en bas. Non versées au dépôt.
- **Pas vérifié** : la vérification complète de Playwright (due à la cadence du soir), l'iPad, le vrai codex.
- **Rituel** : `/fin-de-session` n'a pas été lancé tel quel ; la consigne fixe la fin. Tests, contre-épreuves et relecture du diff sont faits.

**Incident de banc, sans effet sur le code** : une commande de ma part est restée bloquée environ une heure sur un `cat` sans entrée, avant toute mutation. `styles.css` n'a pas été modifié par elle (diff relu), et Grégoire a demandé de l'arrêter. Le fichier vide `/tmp/null` qu'elle avait créé est supprimé.

## Les trouvailles et leur issue

Aucune n'entre au BACKLOG : aucun symptôme vécu pour l'instant. Issue : **inscrites ici**, pour le lot de la palette compacte, qui touche les mêmes règles.

1. **La largeur des palettes d'Évaluer** : `min-width: 280px` et `max-width: none` perdent contre `.palette-flottante`, plus loin dans le fichier. La palette reste à 200 px et ↔ s'arrête à 320 px au lieu de la largeur de la zone (mesuré).
2. **Le badge « ALGORITHMIQUE » est coupé à 200 px** (vu sur les captures).
3. **En sombre, les champs Erreurs et Mots** sont clairs avec un texte clair (vu sur la capture, contraste non mesuré).
4. **Hors plein écran, la page défile toujours** : la zone commence à 403 px et finit à 1060 px. Ce n'est plus un défilement de la palette, et `contain` empêche le geste d'y passer.
5. **Une palette glissée vers le bas** dépasse sa zone, et sa poignée peut sortir de portée (lu, pas mesuré ; existait déjà).

## Geste à vérifier sur l'iPad, après la mise en ligne

Dans Évaluer, faire défiler d'un doigt la palette Évaluation jusqu'au critère algorithmique, en un seul mouvement, avec une seule barre de défilement. Regarder aussi que le critère s'affiche en entier.
