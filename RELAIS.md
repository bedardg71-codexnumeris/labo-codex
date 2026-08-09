# RELAIS — où vit le travail en cours

> **Ce fichier ne dit qu'une chose : sur quelle branche se trouve le travail
> le plus récent.** Il est mis à jour au rituel de FIN de session et lu au
> rituel de DÉBUT. Il vit **toujours sur `main`**, et c'est toute sa raison
> d'être.

---

## État

| | |
|---|---|
| **Branche à ouvrir** | **`main`** |
| **Version** | **1.65.2** — build `0809-1101` |
| **Travail en avance sur `main`** | **aucun** |
| **Dernière mise à jour** | 9 août 2026, **PM** — session de reprise fusionnée (`--ff-only`), sur instruction de Grégoire |

✅ **Aucune dette de fusion.** La session du 9 août PM (audit de
`Plan Accompagnement/` → §4quater, versement #439/#440/📐#441, retrait du patron
`.option-accompagnement`) est dans `main` en fast-forward `02298a4b..acf47e61`.
Suite rejouée **sur l'arbre fusionné** : Vitest **2062/2062** (233 fichiers),
arbre propre. Dernier ID utilisé : **#441**.

⚠ **PIÈGE D'ENVIRONNEMENT CONFIRMÉ UNE FOIS DE PLUS, et il a mordu à la fusion**
(pas au rituel de début, où la branche était un calque exact du `main` distant) :
le clone du conteneur était **shallow**, et `main` LOCAL pointait au **10 juillet**,
200 commits en retard. `git merge --ff-only` a répondu **« refusing to merge
unrelated histories »** — un message qui fait croire à un dépôt corrompu alors
qu'il ne dit que « l'historique est tronqué ». ⮕ **`git fetch --unshallow` AVANT
toute fusion**, pas seulement avant les comparaisons. Vérifier ensuite que le
`main` local est bien un **ancêtre** d'`origin/main` (`git merge-base --is-ancestor`)
avant de le faire avancer : c'est ce qui distingue « en retard » de « divergent ».

⮕ **Où lire la suite** : le **§3 de `SESSION.md`** porte la consigne de démarrage
complète — prémisse chiffrée à vérifier, priorités dans l'ordre, décisions en
attente, et les cinq leçons de méthode que le 9 août a coûtées. **Ses priorités
sont inchangées** : les 81 portes terrain et les quatre valeurs gelées restent en
tête, et rien de cette session n'y touche.

> ▣ **Tout ce qui suit décrit la journée du 9 août au MATIN** — la collision des
> deux sessions et sa résolution. C'est de l'historique, conservé pour la méthode
> qu'il porte. L'état courant est le tableau ci-dessus.

✅ **La dette de fusion du 9 août (matin) est SOLDÉE.** Les deux sessions parallèles
(carte d'alignement #437, pratiques #434/#435/#436/#438) sont dans `main`, en
fast-forward, suite rejouée sur l'état fusionné : **Vitest 2057/2057**
(232 fichiers). Dernier ID utilisé : **#438**.

⮕ Ce qui reste dû n'est plus du code mais du **terrain** :
`plans de travail/PORTES-TERRAIN-1.57-1.65.md`, **complété des portes 1.61→1.64**
qui y manquaient tant que la branche pratiques n'était pas fusionnée (champ
legacy des pratiques PAN-Standards, mode « par objectifs » retiré, suggestion
holistique DEN, libellé d'onglet « Carte d'alignement », page 9 du guide).
Plus **quatre valeurs gelées** en attente de verdict (deux par session), et la
porte du 8 août toujours sans réponse : *le double-clic ouvre-t-il l'Inspecteur
au doigt sur iPad ?*

---

## ✅ CE QUI EST FAIT : la collision a eu lieu, et elle est RÉSOLUE

**La collision annoncée plus bas s'est produite.** Les deux sessions du 9 août
ont pris les mêmes ressources, à 24 minutes d'écart :

| Ressource | `incomplete-work-plans-h1nimp` | session « carte d'alignement » |
|---|---|---|
| Version | 1.64.0 (build `0809-0906`) | 1.64.0 (build `0809-0930`) |
| Identifiant | **#436** (G2-b, miroir `configPAN`) | **#436** (carte d'alignement) |

⮕ **C'est la session « carte » qui a renuméroté** : **1.65.0** et **#437**. Elle
est fusionnée dans `main` (fast-forward `164c4077..0f99b6d2`), Vitest
**1996/1996** (228 fichiers).

▣ **Pourquoi elle, et pas l'autre — le critère qui a servi.** La recette ci-dessous
dit « la seconde session à fusionner », mais ce critère ne départageait pas :
aucune des deux n'avait fusionné son code au moment du constat. Le critère qui
départage vraiment est le **coût**. La série 1.61.0 → 1.64.0 est contiguë et déjà
consommée dans quatre documents sur douze commits ; la session carte, c'était un
commit, une version, un identifiant. ⮕ **Retenir la règle pour la prochaine
fois : c'est le PLUS PETIT côté qui renumérote, pas le second à fusionner.** Le
second à fusionner est indéterminé tant que personne n'a fusionné — donc
inutilisable au moment où on en a besoin.

⚠ **1.65.0 a été choisie AU-DESSUS de toute la série de l'autre branche**, et
c'est délibéré : sa fusion n'a plus à refondre deux séries entrelacées, mais
seulement à garder le numéro le plus haut.

### ✅ FAIT — conflits résolus, puis FUSION EFFECTUÉE

> `main` a d'abord été fusionnée DANS la branche pratiques (5 conflits résolus,
> détail ci-dessous), ce qui l'a rendue fast-forwardable. La fusion inverse a
> ensuite été faite et poussée : `188213fc..529a5779`.

**Comment les cinq conflits ont été tranchés** (recette ci-dessous honorée) :

| Conflit | Résolution |
|---|---|
| Les 4 points de vérité | **1.65.0 / build `0809-0937`** conservés — jamais redescendus à 1.64.0 |
| `js/changelog-data.js` | l'entrée **1.65 coiffe** la série ; 1.64, 1.63 et 1.61 dessous. ⚠ Le conflit coupait **au milieu d'une entrée** — recomposition manuelle, syntaxe revérifiée |
| `index.html`, en-tête du module | **UNION D'INTENTIONS** : le renommage « Carte d'alignement » (#426) **ET** le retrait du bandeau « en développement » (#437). Prendre un côté aurait perdu l'autre en silence |
| `index.html`, deux hunks de `?v=` | la valeur la **plus haute** de chaque côté — aucune valeur retenue n'a jamais été servie plus bas, donc tout cache se casse |
| `js/planification-carte.js` | **auto-fusionné**, et vérifié : la page 9 du guide (#421) et les flèches ▲▼ (#437) coexistent |

⮕ **Les deux sentinelles retargetées sont à l'octet près celles de `main`** — la
consigne du point 5 est honorée sans intervention (la branche ne les avait pas
touchées).

⮕ **#438 pris après la fusion** (correctif de `release.mjs` : il ne bumpait pas
le `?v=` de `styles.css`, trou signalé par la session carte qui l'avait fait à la
main deux fois). Le dernier ID est donc **#438**, pas #437.

⮕ **Vitest 2057/2057 (232 fichiers) sur l'état FUSIONNÉ** — pas l'attestation
d'un des deux côtés, la suite rejouée après résolution.

### La recette d'origine, conservée pour mémoire

1. **Version** : garder **1.65.0** (ou au-delà). Ne pas redescendre à 1.64.0.
2. **Conflits certains** — les quatre points de vérité (`version.json`,
   `js/init-inline.js` ×2, `js/main.js`), les `?v=` d'`index.html`, la tête de
   `js/changelog-data.js`, et les quatre trackers.
3. **`js/changelog-data.js`** : l'entrée **1.65** (carte d'alignement) est déjà
   en tête. Les entrées 1.61 → 1.64 de l'autre branche se glissent SOUS elle —
   et se consolident entre elles, selon le point 3 de la recette.
4. **Code applicatif** : risque faible. La session carte n'a touché que
   `js/planification-carte.js`, `styles.css`, `index.html` et trois fichiers de
   tests — **aucun** des fichiers `js/pratiques*` du chantier G2-b.
5. ⚠ **Deux sentinelles ont été RETARGETÉES** par la session carte
   (`sentinelle-objectif-lecon-metadata`, `sentinelle-echappement-audit-386`) :
   elles lisaient un balisage devenu fonction. En cas de conflit, garder la
   version de `main` — chaque invariant y a été revérifié au rendu réel avant
   réécriture, et doublé d'un équivalent comportemental.

---

## ⚠⚠ LE DOSSIER D'ORIGINE — conservé tel qu'écrit

> Ce qui suit a été écrit AVANT la collision, par la session
> `incomplete-work-plans-h1nimp`. **Il avait raison sur tout**, y compris sur le
> fait qu'elle viendrait. Conservé sans retouche : il vaut mieux qu'un compte
> rendu après coup.

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
