# Consigne – Des standards sans portfolio, lot 4 : choisir à l'écran les productions qui comptent (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 9 h 27 (Toronto, mesuré par `date`), sur `main` = `c2c79fe2` (non poussé). Ne remplace aucune autre consigne. **À lancer après la retouche du lot 3.** Un seul lot qui écrit à la fois : vérifie qu'aucune autre instance n'écrit dans `js/`.
> Plan : `PLAN-2026-10-28-standards-sans-portfolio.md`, § 3, lot 4. Les mots : `plans de travail/TEXTES-2026-10-29-standards-lot-4.md`, **validés par Grégoire à 9 h 26, à poser mot pour mot**.

## 0. Avant tout

- Rituel de début de session ; aucune suite qui tourne.
- Commit de docs seul : ce fichier et `TEXTES-2026-10-29-standards-lot-4.md`. Pas les fichiers d'une autre instance.

## 1. Ce que l'utilisateur verra

Dans une pratique Standards **sans aucun « Artefact » et hors hybride**, sous « Construction de la note », la liste « Productions qui comptent dans la note », avec sa ligne d'aide : les productions du pool (hors conteneur, terminale et diagnostiques), **toutes cochées par défaut**. Décocher une production l'écarte de la note et de tous les lecteurs du lot 2. **Une pratique avec des artefacts (celle de Grégoire) n'affiche pas la liste et ne change pas.** L'hybride garde ses deux listes, telles quelles.

## 2. Les décisions de Cowork (techniques)

1. **Le plan disait « écrire `categorie: 'selection'` » : non.** La retouche R1 du lot 1 a établi qu'une catégorie hors hybride est un reste (un hybride retiré) et ne restreint rien (`obtenirArtefactsIdsPoolStd`, commentaire de `js/pratiques/pratique-registre.js:~807-809`). La réutiliser ferait revivre ces restes et changerait la note de pratiques existantes : c'est le stock. **La désignation vit dans la pratique**, comme une **liste d'exclusions** (des ids de productions). Une exclusion colle aux mots validés : « Toutes, par défaut » ; une production créée plus tard compte d'office. Une pratique sans liste : rien ne change.
2. **Une seule source** : le pool (`obtenirArtefactsIdsPoolStd`, seconde branche) retire les exclusions de la pratique ; `obtenirIdsPoolStdDuCorpus` et les six lecteurs du lot 2 suivent sans recopier la règle. Mesure comment le pool reçoit la pratique sans changer le sens de ses appels actuels.
3. **La dernière case cochée ne se décoche pas** : un pool vide n'a pas de note, et la phrase du lot 1 (« Aucune production retenue pour la note n'est encore évaluée. ») le dirait à tort. Sans mot neuf si possible (la case désactivée) ; si un mot paraît nécessaire, propose-le dans la demande, ne le pose pas.
4. **Un id qui ne correspond à aucune production est ignoré.** Mesure ce que le partage `.lcz` et l'import d'une pratique font de la liste (`partage-schemas.js`) : si elle voyage, elle ne doit rien exclure chez quelqu'un d'autre ; dis-le dans la demande.
5. **Aucune donnée réécrite** : la liste ne s'écrit qu'au geste de l'enseignant·e, comme les autres réglages de la pratique (au changement, lot E1).

## 3. Les tests

- Dans `sentinelle-standards-sans-portfolio`, une section neuve : CHIM, une production exclue → la note et chaque lecteur du lot 2 la retirent (avant → après chiffré) ; une production créée après l'exclusion compte ; une catégorie restée d'un ancien hybride ne restreint toujours rien (R1 épinglé) ; GREG ne change pas (84,8) ; la liste n'existe pas pour GREG ; la dernière case refusée. Les deux textes, **lus dans le fichier TEXTES**, paraissent.
- **Break-test** (arbre restauré par sha256) : le pool sans les exclusions → CHIM rougit, GREG reste vert ; la liste réécrite en `categorie` → le cas R1 rougit.
- Vitest depuis `tests/` ; un essai Playwright ciblé (WebKit) : la liste paraît pour une pratique sans artefact, décocher change la note du profil ; elle ne paraît pas avec des artefacts. On attend l'élément, jamais `waitForTimeout`.

## 4. Clôture

`BACKLOG.md` (#1178, lot 4 coché) ; demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-29-standards-sans-portfolio-lot-4.md` : où vit la liste, comment le pool la reçoit, avant → après pour CHIM et GREG, le partage, la dernière case. Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
