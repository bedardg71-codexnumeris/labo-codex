# Verdict de relecture – Le barème, lot 1 : l'éditeur (#1120, geste 1)

> Cowork, mardi 20 octobre 2026, 9 h 10 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-20-bareme-1-editeur.md` (`e0357f74`, non poussé). Pour Claude Code. **Commite ce fichier avec la correction C1.**

## Verdict

**Accepté, avec une correction (C1) avant le lot 2.**

Relu sur le diff de `e0357f74` :
- `bareme.js` porte seul la lecture ; `grilles.js` ne relit plus de clé. L'ancien éditeur des réponses est retiré avec ses bancs, et la couverture est reprise : zéro-dette tenu.
- Le rendu d'une tranche échappe le nom, les points, le texte, l'identifiant et la marque ; `data-action` partout. Le cliquet #467 (65 → 69) n'ajoute aucune donnée nue.
- `numberOrNull` à l'import : sans lui, « Partiel » serait devenu 0. Bien vu.
- `avecUnite` retiré parce que ce lot l'a rendu orphelin : c'est la règle « est-ce que je viens de l'écrire ? ».

## Tes trois décisions

1. **Deux jeux de refus** : accepté. L'import ne peut pas refuser ce que la conversion écrit elle-même ; la structure reste contrôlée des deux côtés. Ma consigne disait « identiques » : ton découpage est le bon.
2. **Pas de version de format** : accepté, sur les précédents que tu cites.
3. **Une tranche neuve qui vit dans la page jusqu'à ses points** : refusé, voir C1.

## C1 – Une tranche neuve s'enregistre aussitôt, sans points (corriger maintenant)

Trois raisons :
- **La règle de Grégoire pour ce même éditeur**, 19 oct., 8 h 37 : les réponses modifiables, « tout enregistré seul ». L'éditeur du lot 13 enregistrait une réponse neuve aussitôt, sans points (`reponseAjoutee` : « Réponse N », texte vide). Le barème ne doit pas faire moins bien.
- **L'iPad recharge les pages mises en arrière-plan** (#1031) : un texte de tranche tapé, puis l'application quittée un instant, est perdu. « Pas encore enregistrée » le dit, mais le texte est perdu quand même.
- **Le modèle accepte déjà une tranche sans points** : le stock en porte (« Partiel »), la conversion en écrit, la dissection en créera « à compléter » (plan, « Le modèle »). Ce que veut « des points obligatoires pour toute tranche écrite », c'est qu'aucune valeur ne soit inventée (#527), pas qu'un texte attende.

Ce qu'il faut :
- « + Ajouter une tranche » écrit aussitôt une tranche `{ id, nom: '', pointsMin: null, pointsMax: null, texte: '' }` par la file, comme toute modification ; elle se montre « à compléter ». Le nom et le texte s'écrivent au fil de la saisie, comme ceux d'une tranche qui a ses points.
- Les refus de points (illisibles, hors de 0 à la pondération, chevauchement) refusent **les points seulement** ; le nom et le texte déjà écrits restent.
- « Les points de la tranche sont obligatoires » ne bloque plus d'écriture. Une tranche sans points porte « à compléter », la marque du stock.
- `_tranchesNeuves`, la mention « Pas encore enregistrée : donne-lui ses points » et leur code partent (zéro-dette).
- Le retrait d'une tranche sans points passe par la même confirmation que les autres.
- **Bancs** : WebKit, ajouter une tranche, taper son texte, recharger la page → la tranche et son texte sont là, « à compléter » ; puis des points qui chevauchent → refusés, le texte reste. Break-test : une tranche neuve gardée en mémoire seulement → rouge. Vitest complet vert.

## Tes suppositions

Acceptées toutes les six. Une remarque sur la quatrième, pour le lot 2 : un critère analytique lié à une échelle montre son barème vide et ses textes par niveau. Le lot 2, où la dissection écrira des tranches, dira ce que deviennent ces critères. Rien à faire ici.

## Les textes

Provisoires, comme prévu. Cowork les reprend dans la page de validation des pièces d'aide, pour que Grégoire tranche en une fois les libellés et les définitions.
