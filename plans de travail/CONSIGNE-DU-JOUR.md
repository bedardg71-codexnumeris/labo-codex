# Consigne du jour — le lot 3 des trois types de grille, puis UNE publication pour les lots 2 et 3

> **Écrite le 4 septembre 2026 au soir, par Cowork, à la clôture de la séance, pour la séance suivante.**
> **Application au moment de l'écriture : `1.115.0`, build `0903-2103`.**
> ▣ **État mesuré à l'écriture** : `HEAD` = `37660b76` (le lot 2), **un commit devant
> `origin/main`** (`16dfc5eb`), 0 derrière — témoin : `git rev-list --left-right --count
> origin/main...HEAD` rend `0 1`. Arbre : quatre fichiers modifiés non commités, tous à Cowork
> (`CONSIGNE-DEMARRAGE-COWORK.md`, `OU-EN-EST-ON.md`, `SESSION.md` pour ton bloc de clôture, la
> consigne des lots). **Ils partent AVEC le commit du lot 3.**
>
> ⚠ **Si tu lis ceci plus de quelques heures après son écriture, remesure avant d'exécuter.**
> ⚠ **Tu as un état mesuré plus frais que celui-ci : ton propre bloc de clôture du 4 septembre
> dans `SESSION.md`. Il fait foi sur le mien.**

---

## Ce que cette consigne produit à l'écran, pour Grégoire

Il saisit **24 sur 30** sur un critère analytique, et **la rétroaction de cartouche attachée au
niveau où tombe 80 % apparaît**, sans qu'il ait choisi de niveau nulle part. Et le PDF de l'élève
liste ce critère avec son chiffre — **24 / 30** — et rien d'autre.

---

## 1 · Lis d'abord

1. `PROTOCOLE.md`, puis `OU-EN-EST-ON.md` (la ligne des trois types de grille est à jour).
2. **`plans de travail/CONSIGNES-2026-09-03-lots-des-trois-types-de-grille.md`** — les arrêtés,
   le hors-périmètre, **le lot 3**, et sous le lot 2 la **relecture croisée de Cowork** avec ses
   trois trouvailles. ⛔ **Sa ligne « N'ouvre pas ce lot avant que Grégoire ait vu le lot 2 à
   l'écran » est LEVÉE par la décision du 4 septembre** : il regarde les deux lots ensemble.
3. Ton bloc de clôture du 4 septembre dans `SESSION.md`.

---

## 2 · Le mandat : le lot 3, avec une exigence que le texte du 3 septembre ne portait pas

**Le lot 3 tel qu'écrit** : le pourcentage d'un critère analytique trouve son niveau par les
bornes de l'échelle **de la grille** ; ce niveau ouvre la cartouche (clé `critereId_niveau`).
Mesure d'abord les deux points de sa section « À mesurer avant d'écrire ».

**L'exigence ajoutée** (trouvaille 1 de la relecture du lot 2, mesurée le 4 septembre) :
**un critère analytique DOIT entrer dans `evaluation.criteres[]` en base**, comme les autres,
parce que seize fichiers lisent ce tableau et qu'aucun ne voit les points aujourd'hui — dont le
PDF de l'élève (`travaux-export-pdf.js:949`, qui rend `critereNom — niveauSelectionne`) et la
matrice de dépistage (`consolidation.js:118`).

⚠ **Et ici les deux règles se croisent — tranche-les ensemble, pas l'une contre l'autre :**
- Le niveau déduit **entre** dans `criteres[]` (c'est ce qui le rend visible au dépistage, à la
  synthèse, à la cartouche) ;
- mais **l'élève ne voit que le chiffre** (arrêté 4, et « ce qui ne doit pas bouger » du lot 3).
  ⮕ Le rendu du PDF **doit donc distinguer** un critère analytique : il imprime **« 24 / 30 »**,
  pas le niveau. C'est **dans** le périmètre (le chiffre) ; tout ce qui irait au-delà du chiffre
  dans le PDF est nommé hors périmètre. Mesure où `criteres[]` se construit à l'enregistrement
  (les quatre écrivains du lot 2 : `evaluation-sauvegarde.js`, `evaluation.js`, l'auto-save) et
  fais entrer le critère analytique **avec ses points ET son niveau déduit**, sous des noms qui
  disent ce qu'ils sont.
- **Les points restent dans `pointsAnalytiques`** (lot 2) : la source ne change pas de place, le
  tableau `criteres[]` en porte une **lecture**. Si tu vois mieux, dis-le avant d'écrire.

**Ce qui ne bouge pas** : un critère holistique ou algorithmique se calcule et s'enregistre
exactement comme avant ; les sentinelles du calcul passent **sans modification** ; la boucle de
`calculerNote` reste intouchée (le lot 2 y a mis un témoin de source).

**Trouvaille 2 du lot 2** (points bornés à la saisie, pas en base) : **pas dans ce lot.** Inscrite.

---

## 3 · L'ordre de la séance, et il ne se négocie pas

```
lot 3 commité (avec les fichiers de Cowork)
  → relecture croisée de Cowork (le lot touche le calcul et ce que l'élève lit)
  → corrections
  → coup d'œil de Grégoire sur les DEUX lots, une seule fois
      (le champ « sur 30 » est-il lisible et à sa place, Mac ET iPad ? · 24 → la cartouche s'ouvre · le PDF dit 24 / 30)
  → verdict au jeton (scripts/pousser.sh le rend sur le commit poussé)
  → release MINEURE : 1.116 — UNE entrée de changelog pour les deux lots, dont les mots sont à Grégoire
  → push
```

⛔ **Rien ne part avant son coup d'œil.** Le lot 2 est resté sur sa machine exprès : publier le
lot 2 seul mettait en ligne un PDF qui omet un critère que la note compte.

---

## 4 · Ce que tu rends à Cowork, pour la relecture

Le commit du lot 3, et **la liste des fichiers où `criteres[]` se construit et se lit** que tu as
mesurée, avec pour chacun : *le critère analytique y entre / y est lu / n'a pas à y être*. C'est la
carte dont la relecture a besoin ; sans elle, elle lit le patch seul, et le protocole dit pourquoi
ça ne suffit pas.
