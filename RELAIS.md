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
| **Version** | **1.71.1** — build `0810-1754` |
| **Travail en avance sur `main`** | **aucun** |
| **Dernière mise à jour** | 10 août 2026, **post-clôture** — portes terrain corrigées après son relevé (documents seuls, code inchangé) |

✅ **Aucune dette de fusion.** Le cycle du soir (**18 commits, 1.67.1 → 1.71.1**) est
sur `main`. Suite rejouée sur l'arbre fusionné : Vitest **2169/2169** (244 fichiers),
arbre propre, `origin/main ↔ HEAD : 0 / 0`. Dernier ID utilisé : **#449**.

⏳ **RIEN N'EST VALIDÉ AU TERRAIN.** Grégoire fait les vérifications **demain**.
Elles sont dans **`plans de travail/PORTES-TERRAIN-2026-08-10.md`** (jumeau markdown
d'un artefact interactif). **Ne pas ouvrir de chantier de fond avant ses résultats** —
la règle `CLAUDE.md` est explicite : un retour testeur interrompt le plan.

⚠⚠ **LES PORTES ONT ÉTÉ CORRIGÉES APRÈS COUP — LIRE LA VERSION À JOUR, PAS LE SOUVENIR.**
Son relevé du soir a **invalidé trois attendus** que j'avais écrits :
 1. **1.1 annonçait « ~44 % » ; il a mesuré 100 %.** Le seuil mord pourtant (3 grosses clés
    parties en IDB) — mais `syncToLocalStorageCache()` **remplit** localStorage au boot avec
    tout ce qui passe sous le seuil. *J'ai modélisé l'éviction, pas le remplissage.*
    ⚠ **`db.statsStockage().projectionSeuils` a le même angle mort : un PLANCHER, pas une
    prévision.** C'est le premier point du chantier #353.
 2. **1.2 annonçait 448 K car. pour a2024 ; c'est 85 K / 21 clés.** Le détecteur n'énumère
    que localStorage (`diagnostic-353-cles-orphelines.js:102`) — les deux grosses clés a2024
    sont en IDB et lui sont invisibles.
 3. **1.3 attendait une purge de `simulation_indicesCP` ; la famille rend 0.** Même cause.
⮕ **Un attendu faux est PIRE que pas d'attendu** : il transforme un succès en échec aux yeux
du testeur. Versé comme anti-pattern dans `SKILL_portes_terrain.md`.

⮕ **Ce que le cycle a livré** : les cinq items de la priorité 0 des 81 portes —
**#442** (fusion des cours dédoublonnée par identité, + le cours fictif retiré de ses
données) · **#447** (⚠ la prémisse de l'item était FAUSSE ; un vrai trou dormait à
côté) · **#445** · 📐**#443** · **#353** (l'unité du quota + seuil IDB-first 200 → 25 Ki)
· le **bouton Supprimer d'un groupe-cours** (1.71.1). **#448** et **#449** versés.
⮕ **Et une règle de projet neuve** : **`SKILL_portes_terrain.md`**, adoptée à la demande
de Grégoire — modèle OBLIGATOIRE de toute liste de vérifications, deux livrables
jumeaux (artefact + markdown versionné).

⚠⚠ **LA LEÇON DU CYCLE, ET ELLE COMMANDE LA SUIVANTE : QUATRE DIAGNOSTICS POSÉS PAR
LECTURE DE CODE SE SONT RÉVÉLÉS FAUX, ET C'EST LA MESURE QUI LES A CORRIGÉS.**
 1. **#447** — le BACKLOG affirmait « l'aperçu lit le stocké sans recalculer » et
    prescrivait un contournement à l'utilisateur ; l'aperçu recalcule à chaque rendu.
    Prouvé en FAUSSANT le stockage puis en observant.
 2. **#353** — l'alerte criait « 200 % » d'un quota indépassable : le navigateur facture
    en **caractères UTF-16**, la mesure comptait des octets. *Un ratio impossible invite
    à ne plus croire l'alerte* — le pire résultat pour une alerte.
 3. **Le détecteur d'orphelines** classait des snapshots **VIVANTS** comme morts (ils
    sont nommés d'après le GROUPE-COURS) : **356 K car. de données réelles** étaient
    dans la liste à supprimer. Rattrapé en relisant SON rapport avant de dire d'exécuter.
 4. **Le bouton Supprimer** — annoncé cassé côté cours (faux), puis raté par mon propre
    script d'audit (fenêtre trop courte). Trouvé en lisant les sites d'appel un par un.
⮕ **Sur les DONNÉES et sur le DOM, un diagnostic lu au code est une HYPOTHÈSE.** Le
conteneur a Chromium ; reproduire coûte trois minutes.
⮕ **Corollaire, trouvé sur pièces** : *« ne rien casser » n'est pas « ne rien perdre »*.
La 3e copie du cours portait `heuresContact: 60` et `ponderation: '2-2-3'`, invisibles
parce que seul le 1er exemplaire est lu — un retrait « sans effet » les aurait effacées.
Les scripts de purge REFUSENT désormais tant que l'humain n'a pas tranché.
⮕ **Et sur les tests** : **quatre break-tests sont restés VERTS au premier jet**, chaque
fois par la faute du TEST. *Un break-test resté vert est une information sur le test.*

⚠ **GRÉGOIRE N'EST PAS DÉVELOPPEUR** — il l'a rappelé en adoptant le modèle des portes.
C'est la **règle première** de `SKILL_portes_terrain.md` : le « pourquoi » raconte le
SYMPTÔME VÉCU, jamais le mécanisme.

⚠ **PIÈGE D'ENVIRONNEMENT — toujours vrai.** Le clone du conteneur est **shallow** :
`git fetch --unshallow` AVANT toute comparaison ET toute fusion, puis vérifier que le
`main` local est un **ancêtre** d'`origin/main` (`git merge-base --is-ancestor`).

⚠⚠ **ET LE MÊME PIÈGE, CÔTÉ TESTEUR — deux formes.** (1) Son app tourne en `file://`
depuis son clone : son build est celui de son dernier `git pull`. (2) **Ses SCRIPTS
aussi** : le 10 août il a reçu trois fois `is not defined` parce que les outils console
vivaient sur une branche non fusionnée — puis parce qu'il avait collé mes commentaires
d'usage au lieu du contenu des fichiers. ⮕ **Un script se colle EN ENTIER, une commande
s'appelle APRÈS.** ⚠⚠ **(3) Et la parade que j'avais donnée était elle-même le piège** :
`cat scripts/<fichier>.js | pbcopy` est du **Terminal** posé au milieu de **console
navigateur** — collé dans Chrome, ça rend `SyntaxError: Unexpected identifier 'scripts'`.
⮕ **Méthode à une seule fenêtre** : Finder → `scripts` → glisser le `.js` dans un onglet du
navigateur → Cmd+A, Cmd+C → coller dans la console de l'app. **Règle 5 du skill des portes :
toute commande dit sur quelle SURFACE elle se tape.**

⮕ **Où lire la suite** : le **§3 de `SESSION.md`** porte la consigne complète — prémisse
chiffrée, priorité 0 (les résultats du terrain de demain), les quatre décisions en
attente, et la leçon du cycle en entier.

> ▣ **Tout ce qui suit décrit les journées du 9 août** — la collision des deux
> sessions et sa résolution. C'est de l'historique, conservé pour la méthode
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
