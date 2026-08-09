# RELAIS — où vit le travail en cours

> **Ce fichier ne dit qu'une chose : sur quelle branche se trouve le travail
> le plus récent.** Il est mis à jour au rituel de FIN de session et lu au
> rituel de DÉBUT. Il vit **toujours sur `main`**, et c'est toute sa raison
> d'être.

---

## État

| | |
|---|---|
| **Branche à ouvrir** | ⚠ **`claude/incomplete-work-plans-h1nimp`** |
| **Version** | **1.64.0** — build `0809-0906` |
| **Base de la branche** | `83ee41d3` (= `origin/main` au 9 août, 1.60.0) |
| **Travail en avance sur `main`** | **12 commits** — voir le tableau de réconciliation ci-dessous |
| **Dernière mise à jour** | 9 août 2026, fin de journée |

⚠ **NE PAS ouvrir le conteneur sur `main`.** Vérifier `git log origin/main` :
si son sommet est encore `83ee41d3`, il est à **1.60.0**, soit quatre versions
mineures en arrière, et son §3 de `SESSION.md` ne connaît pas cette branche.

---

## ⚠⚠ DEUX SESSIONS TRAVAILLENT EN PARALLÈLE — lire avant de fusionner

**Grégoire a signalé le 9 août qu'un autre agent travaillait sur `main`** pendant
que cette branche avançait. Au dernier `git fetch` de cette session,
`origin/main` était **encore à `83ee41d3`** : l'autre travail n'était pas
poussé. Il le sera. **C'est exactement la configuration du 8 août**, qui a coûté
une journée de réconciliation — sept conflits, une renumérotation complète,
trois numéros de version à fondre en un.

⮕ **La différence, cette fois : c'est écrit AVANT la collision, pas après.**
Le tableau ci-dessous dit précisément ce que cette branche a pris.

### Ce que cette branche a consommé

| Ressource partagée | Pris ici | Conséquence si l'autre session a pris pareil |
|---|---|---|
| **Versions** | **1.61.0 · 1.61.1 · 1.62.0 · 1.63.0 · 1.63.1 · 1.64.0** | Une session doit renuméroter. ⚠ **1.62.0 n'a jamais été déployée** et est déjà consolidée dans l'entrée de changelog 1.63 — précédent de la 1.48. |
| **Identifiants BACKLOG** | **#434, #435, #436** (dernier ID de `main` : #433) | Renumérotation, comme le 8 août (les IDs avaient glissé de +2). |
| **Build** | `0809-0733` → `0809-0906` | Sans importance, le script réhorodate. |

### Fichiers où le conflit est CERTAIN si l'autre session a livré

Les quatre points de vérité de la version, plus les trackers :
`version.json` · `js/init-inline.js` (×2 replis) · `js/main.js` (snapshot) ·
`index.html` (les `?v=` de cache-busting — `release.mjs` en réécrit jusqu'à 9) ·
`js/changelog-data.js` (tête du tableau) · `BACKLOG.md` (bloc d'état + items) ·
`SESSION.md` (bloc de tête + §3) · `ETAT-PROJET.md` (en-tête + journal §11) ·
`RELAIS.md` (ce fichier).

### Recette de réconciliation

1. **Ne pas trancher au hasard qui renumérote** : la règle du 8 août veut que ce
   soit **la seconde session à fusionner**. Vérifier laquelle l'est réellement.
2. **Versions** : fondre en une seule série continue à partir de 1.60.0. Ne pas
   réécrire les messages de commit qui portent les anciens numéros — le 8 août a
   fait ce choix volontairement, garder la même convention.
3. **`js/changelog-data.js`** : consolider les entrées non déployées plutôt que
   de les empiler. Du point de vue de l'utilisateur, tout ce qui n'a jamais
   atteint la production est **une** livraison.
4. **Code applicatif** : le risque de conflit y est faible mais **pas nul** —
   cette branche a touché `js/pratiques*.js`, `js/profil-etudiant-*.js`,
   `js/etudiants.js`, `js/liste-evaluations.js`, `js/tableau-bord-apercu.js`,
   `js/objectifs.js` et `js/pratiques/pratique-pan-standards.js` (chantiers #435
   et #436). Si l'autre session a touché les pratiques ou le calcul de la note,
   **relire les coutures à la main** : les deux chantiers retirent du code.
5. **Après fusion** : `cd tests && npm test` doit rendre **2018/2018** au moins
   (231 fichiers), et repasser ce tableau à « aucun ».

---

## Ce que porte cette branche (12 commits)

| Item | Objet |
|---|---|
| **#426** | L'onglet « Alignement pédagogique » devient « **Carte d'alignement** » (7 surfaces) |
| **#421** | Conformité du manuel avec l'interface réelle — 4 surfaces (l'audit en annonçait 3) |
| — | **§4ter de `ETAT-PROJET.md`** : vérification AU CODE des 43 plans que le §4bis n'avait pas tranchés |
| — | Verrou des **phases B et C** du plan note finale (livrées depuis longtemps, sans filet) |
| **#434** | Phase D — une seule commande pour la construction de la note |
| **#435** | Ablation du mode « par-objectifs » — **extension de #396**, sur vérification demandée par Grégoire |
| **#436** | Phase G2-b — fin du miroir `configPAN`. **Le plan de refonte de la note finale est CLOS.** |

### Portes terrain dues sur cette branche

Le nouveau libellé d'onglet et la page 9 du guide (1.61) · le champ legacy
disparu des réglages PAN-Standards et la description sous le Mode de sélection
(1.63) · une pratique legacy « par objectifs », si tu en as une, doit s'ouvrir
sur son mode réel avec un avertissement console (1.63) · les écrans de suivi
doivent suivre immédiatement une modification des réglages de pratique (1.64).

### Deux décisions en attente, consignées au BACKLOG (#436)

Deux valeurs **affichées** ont été gelées en constantes explicites plutôt que
branchées sur la SSOT — les migrer changerait ce que l'utilisateur voit :
le dénominateur de l'indice C du tableau de bord, et le quota affiché des jetons.

---

## Pourquoi ce fichier existe

Le 8 août 2026, **deux sessions sont parties du même commit sans se voir**.
Chacune a livré une version « 1.55.0 » différente et pris les mêmes
identifiants de backlog. La journée s'est terminée par une réconciliation
manuelle : sept conflits, une renumérotation complète, trois numéros de
version à fondre en un.

Ce n'était pas un défaut d'attention. La session du matin **a fait le rituel
de début, a vérifié la prémisse, et a trouvé zéro écart** — parce que la
prémisse qu'elle lisait, sur `main`, avait été périmée par une branche qu'elle
ne pouvait pas voir.

▣ **La cause est structurelle, et elle est circulaire** : la consigne de relais
(le §3 de `SESSION.md`) est un fichier **versionné**. Quand le travail vit sur
une branche non mergée, la consigne qui le dit vit sur cette branche **aussi**.
La session suivante, elle, lit celle de `main`. *Une session qui ne démarre pas
sur la bonne branche ne peut pas lire l'instruction qui lui dit quelle branche
prendre.* Aucun soin apporté au rituel ne compense ça.

⮕ Ironie qui vaut d'être retenue : le §3 du 7 août s'ouvrait **précisément** sur
une mise en garde contre cette classe de problème. L'avertissement était juste —
et il a été mis en échec par le même mécanisme le lendemain, **parce que son
correctif avait été écrit là où la session suivante ne pouvait pas le lire**.

⚠ **Et le 9 août, ce fichier lui-même est pris dans la boucle** : la session qui
l'écrit tourne dans un conteneur **contraint à sa branche de développement**.
Elle ne peut ni fusionner, ni pousser ce fichier seul sur `main`. Le filet est
rempli — il n'est pas à l'endroit où il devrait être. **Seul Grégoire peut l'y
mettre.**

---

## La règle adoptée (décision de Grégoire, 8 août 2026)

**On fusionne vers `main` à la fin de CHAQUE session.** C'est le remède : c'est
le report du merge qui ouvre la fenêtre de divergence, et il avait été reporté
trois fois dans la semaine avant de coûter une journée.

**Ce fichier est le filet**, pour les cas où un merge doit vraiment attendre —
travail à mi-chemin, validation terrain en suspens, décision de Grégoire non
prise. Dans ce cas, et dans ce cas seulement :

1. le remplir en nommant la branche et ce qu'elle porte ;
2. le **committer et le pousser sur `main`**, seul, sans le reste du travail.

Un `RELAIS.md` qui pointe vers une branche est le signal qu'une dette de fusion
existe. Il doit repasser à « aucun » dès que la fusion est faite.
