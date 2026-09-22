# Plan — réassigner une copie : un geste qui montre ce qu'il déplace (#932, #933, #934)

**Mot d'écran, décidé par Grégoire le 22 sept. (15 h)** : le verbe est **« réassigner »** (et « assigner » pour une copie sans production) — plus « réassocier ». Les noms de fonctions du code (`reassocierFichier`, `changerProductionFichier`, `associerProductionDepuisListe`) ne changent pas : c'est le mot vu, pas l'API. Deux libellés à renommer aujourd'hui (`liste-evaluations.js:1305` et `:1640`), dans le lot 2.

**Décidé** par Grégoire le 22 septembre 2026, après-midi : « Lots 1 + 2 + 3 ». **Quand** : matinée du 23 septembre (fenêtre 4 h – midi), avec le skill `design-interface` pour ce qui touche l'écran. **Source** : `Rapports/AUDIT-reassocier-une-copie-2026-09-22.md`, incident #931 du matin même.

**Principe qui tient les trois lots** : une seule fonction écrit la production d'une copie — `changerProductionFichier` (`js/travaux-ui.js`), qui porte la porte de conflit — et chaque point d'entrée montre la copie (nom de fichier, vignette) avant le geste. `reassocierFichier` (`travaux-stockage.js`) ne reçoit plus d'appel direct hors de cette fonction.

**Ce qui ne bouge pas** : le menu Production du tableau d'« Annoter et évaluer » reste — c'est lui qui a fait les 23 réassociations correctes du 22 sept. en quatre minutes. « Transférer » (changement de groupe-cours) n'est pas touché (C7 refusé). Aucune donnée réécrite : source seulement.

---

## Lot 1 — #933 · le tableau montre le fichier (≈ 60 min)

1. `genererLigneTableauFichier` (`travaux-ui.js:2970`) : colonne « Fichier » avant « Production » — nom LÉA (`leaParsed.nomProduction` + page) sinon `nomFichier`, échappé (règle 1). En-tête `#travaux-tableau-fichiers thead` à aligner ; le filtre « Rechercher… » cherche aussi dans ce nom.
2. `changerProductionFichierDepuisTableau` (`:7355`) : `await changerProductionFichier(...)` ; sur `false`, remettre `el.value` à `row.dataset.productionId` (l'ancienne), et ne poser la nouvelle qu'après `true`.

**Fin** : deux copies d'un même élève sont distinguables dans le tableau ; un « Annuler » à la porte laisse le menu sur l'ancienne production. Banc : Vitest sur le HTML de la ligne (nom LÉA, nom brut, échappement) et sur le verdict (refus ⇒ menu remis) ; spec WebKit : deux copies d'un même élève, refus de la porte, menu inchangé. Break-test : colonne retirée, `await` retiré.

## Lot 2 — #932 · Propriétés devient le geste unique (≈ 90 min)

1. `ouvrirProprieteFichier` (`liste-evaluations.js:1487`) : vignette de la première page (`travauxStockage.obtenirThumbnailSync(fichierId)`, repli : icône du type) + nom de fichier en lecture au-dessus des champs ; le champ « Nom » éditable reste.
2. Son enregistrement : `productionId` passe par `travauxUI.changerProductionFichier(fichierId, nouvelleProd)` (porte de conflit, nommée depuis #931) et **attend le verdict** ; `etudiantDA`, `nomFichier`, `evaluationId` gardent leur chemin. Sur refus, la modale reste ouverte, rien n'est écrit.
3. « Réassocier » / « Associer » de la liste (`associerProductionDepuisListe`, `:1603`) — **renommés « Réassigner » / « Assigner »** (menu Actions et titre de la modale) : ouvre Propriétés au lieu de sa modale aveugle. Le cas « Jeton de reprise » (`__jeton_reprise__`, #561) doit **survivre** : le porter dans Propriétés (une case « c'est une reprise » + production cible) ou le garder comme option distincte du menu — à trancher au design, pas à perdre. La modale `associer-prod-modal-overlay` disparaît si plus rien ne l'ouvre (zéro-dette).
4. Sentinelle structurelle : dans `js/`, hors `travaux-stockage.js`, `reassocierFichier(` n'a qu'un appelant, `changerProductionFichier` (et `reassocierFichiersBatch` pour Transférer).

**Fin** : aucun chemin n'écrit la production sans la porte ; aucun chemin ne réassocie sans montrer la copie ; le jeton de reprise fonctionne encore (banc #561 vert). Break-test : Propriétés qui rappelle `reassocierFichier` nu ; vignette retirée ; liste qui rouvre l'ancienne modale.

## Lot 3 — #934 · « Réassigner la sélection » en masse (≈ 45 min)

1. Tableau : quand ≥ 1 case est cochée, un bouton « Réassigner la sélection (N) » à côté de « Fusionner » ; un menu de production cible ; confirmation qui **compte** (« 24 copies vers Artefact 2 (rév) ») et **liste les conflits** (élèves déjà pourvus sur la cible) avant d'écrire.
2. Écrit copie par copie via `changerProductionFichier` (une porte par conflit) — ou, si trop de portes, une seule question groupée qui nomme chaque paire ; à trancher au design.

**Fin** : l'import de 24 copies sous la mauvaise production se corrige en un geste. Spec WebKit sur le pack démo : trois copies cochées, une en conflit, la question nomme le conflit.

---

## Ordre et preuves

Lot 1 → lot 2 → lot 3, une release `minor` à la fin (ou une par lot si la matinée se coupe). Chaque lot : Vitest ciblé, break-test à mutations rouges, restauration par copie, puis suite complète depuis `tests/`. Playwright au push (`scripts/pousser.sh origin main`, arrière-plan, Cowork fermé mesuré). Mots d'écran neufs (bouton, confirmation groupée) proposés à Grégoire **avant** la livraison.
