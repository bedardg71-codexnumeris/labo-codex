# Demande de relecture – lot 15 : rien ne s'écrit ni ne se perd en silence

> Claude Code, 11 octobre 2026, 16 h 37 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 14 à 19.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert à la fin du lot (730 fichiers, 8 645 essais).

## 1 · Ce qui change pour l'usager

- Ouvrir l'application ne réécrit plus, sans geste, les indices, le calendrier, l'horaire, les séances, les réglages des présences, le trimestre actif ni les cartouches démo, quand rien n'a changé (#1040).
- La fenêtre de suppression de l'onglet Données ne garde plus, sous son masque, la liste de la suppression précédente (#653).
- Retirer un type de production ou un forfait d'une pratique par spécifications propose d'abord le codex, comme pour un critère ou un niveau, si une évaluation porte sur une production de ces types (#1015).
- Supprimer en Conception une grille qu'emploient des évaluations ou des productions est refusé, en nommant les comptes, comme dans l'onglet Données (#624).

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #1040 | `67f9eb0b` | les douze écritures de la fiche, toutes encore là | `db.setSyncSiChange` : rien n'est écrit si la valeur stockée est la même, horodatages exclus (`dateCalcul`, `actuel.date`) ; `indicesAssiduite` (écrit par `sauvegarderDonneesSelonMode`) : même comparaison avant ; migration des cartouches : un drapeau « a changé » |
| #653 | `f5667c3c` | les deux blocs masqués sans être vidés | vidés quand ils sont masqués |
| #1015 | `de226e4a` | aucune évaluation ne cite un type ni un forfait ; elles les emploient par leur production (appariement du moteur, id ou nom) | `ligneEmployeeParUneEvaluation({ typeTravail })` ; la porte #1007 avant le retrait, relecture de la ligne après l'attente |
| #624 | `5a579f96` | échelles gardées depuis #648 ; Données bloque une grille employée ; Conception ne comptait que les cartouches | même refus en Conception, sous `cle()` |
| #646 | — | **non traitée**, voir § 4 | — |

Vérifications : #1040, 9 mutations rouges (dont le compte de l'absence, qui a d'abord survécu : `getSync(clé, undefined)` retombe sur `null` ; une sentinelle d'absence le règle). #653, 2 rouges. #1015, 6 rouges. #624, 3 rouges. Bancs mis à jour : le harnais `charger-script.js` pose `db.setSyncSiChange` sur un faux `db` qui ne l'a pas (`poserSetSyncSiChange`, même patron que `modifierEtAnnoncer`), utilisé aussi par #830 ; N1b réancré sur la nouvelle écriture ; #1007 : deux portes au registre (53).

## 3 · Mots d'écran – à soumettre à Grégoire

1. Codex avant de retirer un type (`js/codex.js`) : « **Retirer ce type de production l'efface pour de bon, et la note des spécifications change.** » (suivi de la phrase commune « Ton codex à jour pourra te le rendre… »).
2. Codex avant de retirer un forfait : « **Retirer ce forfait l'efface pour de bon, et la note des spécifications change.** »
3. Refus de supprimer une grille (`js/grilles.js`) : « **Impossible de supprimer la grille « X ».** » puis les comptes (« Utilisée par N évaluation(s) », « Utilisée par N production(s) », mots de l'onglet Données), puis « **Sans elle, ces notes n'auraient plus de grille.** »

## 4 · Ce qui revient à Grégoire

**#646 – non traitée.** Unifier les deux emplacements de `evaluationEnCours` passe soit par `js/config.js` (zone protégée : c'est son `let` qui crée la seconde liaison), soit par un pont `defineProperty` qui changerait les gardes de l'évaluation : `verifierEtChargerEvaluationExistante` compte sur l'absence du pivot `window` (#919, trois enregistrements perdus le 18 sept.). 126 lectures du nom nu, 94 de `window.`, 8 fichiers. Fiche laissée telle quelle.

## 5 · Ce que j'ai supposé – une ligne chacune

- #1040 : aucun lecteur des horodatages (`grep "actuel.date|.dateCalcul"` ne rend que les écrivains) ; une valeur inchangée garde son ancien horodatage.
- #1040 : le stock n'est pas touché ; la sonde WebKit du 7 oct. n'a pas été rejouée (le compte des écritures par ouverture n'est pas remesuré au navigateur).
- #1015 : « une évaluation l'emploie » se lit sur le trimestre (`cle()`), comme au lot 2b, sans vérifier quelle pratique est active pour le cours.
- #1015 : les fonctions jumelles de `pratique-notation-v2.js` ne sont pas touchées : code mort, retiré au lot 18.
- #624 : aucune issue n'est offerte (rattacher des évaluations à une autre grille changerait leurs notes) ; si une issue est voulue, c'est une décision.
- #624 : restent hors lot la cause de #542 (non remesurée) et la comparaison des quatre autres paires homonymes de `donnees-v2.js` (rejoint #587, lot 18) ; `ECHELLE_DEMO` : `grep` vide dans `js/`.

## 6 · Item de Nouvelles proposé

« Une grille qu'emploient des évaluations ne peut plus être supprimée par erreur depuis la Conception, et retirer un type de production ou un forfait qui compte déjà dans des notes propose d'abord de mettre ton codex à jour. »
