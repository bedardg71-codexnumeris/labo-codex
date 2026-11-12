---
name: debut-de-session-labo-codex
description: >
  Rituel d'ouverture de Labo Codex. Déclencher au PREMIER TOUR d'une session
  de travail sur ce projet, et seulement là : jamais en cours de session, quel
  que soit le mot prononcé. Le premier message reçu est le mandat : le lire
  d'abord, mesurer l'état de la branche qu'il nomme (ou de `main` pour la
  session principale), lire le dernier relais du rapport de cette branche,
  puis ne rapporter que les écarts entre le mandat et l'état mesuré, en cinq
  lignes au plus. Sans écart, une ligne, et la session se met au travail.
  Lecture seule — aucune modification de fichier, aucun commit, aucun push.
  Pendant inverse du skill `fin-de-session-labo-codex`.
---

# SKILL : Rituel de début de session — Labo Codex

> Cette skill est une procédure exécutable, pas une référence. Elle est en
> lecture seule et elle est COURTE : elle vérifie que le mandat reçu tient
> encore debout sur la branche où il envoie travailler, rien de plus.
>
> **Justification** : le mandat d'une session est souvent préparé avant que
> le dépôt ait fini de bouger (autre cycle de travail, commits poussés
> depuis, sessions parallèles). Sans mesure, le risque est de coder sur une
> prémisse périmée — refaire un travail déjà livré, collider avec l'existant.
> Acté le 28 mai 2026 après un écart de 24 h sur le Lot A ✴ (livré au commit
> `11f87a1` mais redemandé dans la prémisse du lendemain).
>
> **Recentré le 10 novembre 2026** (décision de Grégoire, sur recommandation
> de Cowork). Le rituel se déclenchait à chaque session et dès que « relai »
> ou « audit » passaient ; il lisait `SESSION.md`, figé depuis le 15
> septembre, et l'en-tête de `BACKLOG.md`, puis rapportait des priorités
> périmées. Sept ou huit sessions par jour le payaient, et Grégoire devait
> lire ou ignorer ces rapports. **L'état d'ensemble et les priorités vivent
> dans la relève de Cowork, hors du dépôt : ce rituel ne les lit pas et ne
> les rapporte pas.**

---

## 0. QUAND DÉCLENCHER

- Au premier tour d'une session de travail sur ce projet. **C'est le seul
  déclencheur.**

**Ne PAS déclencher** en cours de session : ni sur un mot (« relai »,
« audit », « on commence », « où en est-on », « état des lieux » ne sont plus
des déclencheurs), ni parce que du temps a passé, ni pendant un debug, ni
quand Grégoire enchaîne une demande sur un travail en cours. Une question
posée en cours de session reçoit une réponse, pas un rituel.

### 0.1 LE MANDAT D'ABORD

**Le premier message reçu est le mandat. Le lire en entier AVANT toute
commande**, et en tirer quatre choses :

- **la branche** qu'il nomme. S'il n'en nomme aucune, c'est la session
  principale : la branche est `main` ;
- **sa base**, s'il la donne (« partie de `origin/main`, `<sha>` ou plus
  récent ») ;
- **ses assertions vérifiables** : un HEAD, un état d'arbre, un fichier qui
  doit exister, un travail présenté comme fait ou comme à faire ;
- **s'il demande une release, un verdict ou un push sur `main`** — c'est ce
  qui ouvre, ou non, le fichier voisin des mesures sous condition (§2 et 3).

Tout ce que le mandat ne dit pas n'est pas à mesurer ici.

---

## 1. INVENTAIRE DE LA BRANCHE DU MANDAT

**Objectif** : connaître le HEAD réel et l'état de la branche où le mandat
envoie travailler — elle seule.

### 0.5 ⛔ LE PIÈGE DU RÉPERTOIRE DE DÉMARRAGE (promu le 2 septembre 2026)

*Payé six jours de suite avant d'être nommé. Promotion depuis la consigne de
démarrage, règle 3 de `PROTOCOLE.md`.*

**Si la session s'ouvre dans `/Users/kuekatsheu` et non dans le dépôt, les skills
et les agents de `.claude/` ne se chargent PAS, et rien ne le dit.** Aucun message,
aucune erreur : le travail se fait sans les conventions du projet.

```bash
pwd     # doit rendre .../Documents/GitHub/Monitorage_v6
```

⚠ **Un `cd` fait APRÈS le démarrage ne recharge pas ce qui n'a pas été lu à
l'ouverture.** Si le répertoire est faux, la bonne réponse est de quitter et de
relancer depuis le dépôt, pas de se déplacer. Le repli, si la session ne peut pas
être coupée : lire à la main les `SKILL.md` de `.claude/skills/` concernés, et le
DIRE dans le rapport.

### 1.0 ⚠ D'ABORD : où vit le travail ? (ajouté le 8 août 2026, resserré le 10 novembre 2026)

```bash
git fetch origin --prune
```

**Le mandat nomme la branche** : c'est elle, et on ne lit rien de `RELAIS.md`.

**Le mandat n'en nomme aucune** (session principale) : lire la DERNIÈRE entrée
de `RELAIS.md`, et elle seule. Le fichier vit sur `main`, ses entrées vont de
la plus récente à la plus ancienne, et il pèse plus d'un mégaoctet : jamais de
`cat`, jamais de `Read` sans `offset`/`limit`.

```bash
grep -n -m2 '^## ' RELAIS.md     # ligne de la dernière entrée, puis de la précédente
# puis Read RELAIS.md avec offset = la première, limit = l'écart entre les deux
```

Si cette entrée dit que le travail vit sur une autre branche que `main`, c'est
un écart (§4).

▣ **POURQUOI CE CONTRÔLE EXISTE.** Le 8 août 2026, deux sessions sont parties
du même commit sans se voir : chacune a livré une « 1.55.0 » différente et pris
les mêmes identifiants de backlog. La seconde **avait fait ce rituel**, vérifié
la prémisse, et trouvé **zéro écart** — parce que la prémisse qu'elle lisait,
sur `main`, avait été périmée par une branche qu'elle ne pouvait pas voir.

⮕ **La leçon générale** : la consigne de relais est un fichier VERSIONNÉ. Quand
le travail vit sur une branche non mergée, la consigne qui le dit vit sur cette
branche aussi. *Une session qui ne démarre pas sur la bonne branche ne peut pas
lire l'instruction qui lui dit quelle branche prendre.* D'où les deux gardes :
le mandat nomme sa branche, et `RELAIS.md`, qui vit sur `main`, la nomme pour
la session principale.

⚠ **Retiré le 10 novembre 2026** : l'arrêt « si une branche distante est plus
récente que `main` », et le balayage `for-each-ref` qui le nourrissait. Avec
des lots menés en parallèle, c'était vrai presque toujours. Le seul cas qui
compte, la branche du mandat en retard sur son origin, se mesure au §1.1 et se
traite au §4.

### 1.1 Ensuite, l'inventaire — UNE branche

La branche que nomme le mandat ; `main` pour la session principale. Pas les
autres : ce qu'elles portent est l'affaire de leur session.

```bash
# depuis la racine du dépôt ; B = la branche du mandat
git rev-parse --abbrev-ref HEAD                      # suis-je dessus ?
git log -1 --format='%h · %cd · %s' --date=short     # HEAD
git status --short | head -20                        # état de l'arbre
git rev-list --left-right --count origin/B...HEAD    # retard <tab> avance sur origin
```

Trois mesures, pas plus : **HEAD**, **état de l'arbre** (propre ? fichiers
modifiés ou non suivis, et combien), **avance et retard sur origin**.

⚠ **Branche neuve** (le mandat dit « branche neuve, partie de… ») : elle
n'existe pas encore sur origin, et ce n'est pas un écart. Mesurer alors la
base : `git rev-parse --short origin/main`, à comparer au SHA que donne le
mandat (« ou plus récent » : `git merge-base --is-ancestor <sha> origin/main`).
En revanche, une branche dite neuve qui EXISTE déjà sur origin est un écart.

### 1.2 Le dernier relais de cette branche

Chaque lot tient son rapport dans `plans de travail/RAPPORT-<date>-<lot>.md`,
et son en-tête (du titre au premier `## `) porte le dernier relais : la
branche, sa base, ce qui est fait, ce qui reste. **Lire cet en-tête, et lui
seul.** Le rapport vit sur la branche : le lire là, pas sur `main`.

```bash
git ls-tree --name-only origin/B "plans de travail/" | grep RAPPORT | grep "<lot>"
git show origin/B:"plans de travail/RAPPORT-<date>-<lot>.md" | awk 'NR>1 && /^## /{exit} {print}' | head -c 4000
```

- **Pas de rapport** (branche neuve, ou session principale sur `main`) : rien
  à lire, et ce n'est pas un écart. Ne pas chercher un substitut dans
  `SESSION.md` ni dans `BACKLOG.md`.
- **Plusieurs rapports** pour le lot : le plus récent par la date du nom.
- Le reste du rapport se lit plus tard, de façon ciblée, si le travail le
  demande — pas à l'ouverture.

---

## 2 et 3. TESTS, VERDICT DE GITHUB, VERSION — SEULEMENT SUR DEMANDE DU MANDAT

**L'état des tests, le verdict de GitHub et la version ne se mesurent que si
le mandat demande une release, un verdict ou un push sur `main`.** Sinon,
sauter droit au §4 : une session de lot qui ne publie rien n'a pas à payer
Vitest ni `gh` à l'ouverture, et le verdict se prend de toute façon à la
clôture (skill `fin-de-session-labo-codex`, §4.5).

⮕ **Si la condition est remplie, et seulement alors**, lire le fichier voisin
`.claude/skills/debut-de-session-labo-codex/mesures-sous-condition.md` et
suivre ses §2 (tests, jeton Playwright), §2.1 (verdict de GitHub) et §3
(version). Leurs résultats entrent dans la comparaison du §4 comme le reste :
seuls les écarts sortent.

---

## 4. COMPARER LE MANDAT À L'ÉTAT MESURÉ — ET NE RAPPORTER QUE LES ÉCARTS

**Objectif** : dire à Grégoire ce qui, dans le mandat, ne tient pas devant la
mesure. Rien d'autre.

Un **écart** est une chose que le mandat affirme ou suppose et que la mesure
contredit :
- la branche n'est pas où le mandat la dit (HEAD, base, existence sur origin) ;
- l'arbre n'est pas propre, ou la branche est en retard sur origin ;
- le dernier relais du rapport dit fait ce que le mandat demande, ou réserve
  à quelqu'un d'autre ce qu'il confie ;
- le répertoire de démarrage est faux (§0.5), ou `RELAIS.md` nomme une autre
  branche que `main` pour la session principale (§1.0) ;
- une mesure du fichier voisin (tests, verdict, version), quand elle a été
  prise, contredit le mandat.

Ce qui concorde ne se rapporte pas. Ce que le mandat ne dit pas non plus.

**Le rapport :**

- **Aucun écart → UNE ligne**, puis la session se met au travail, sans
  attendre de confirmation :

  ```
  Ouverture : aucun écart (lot/<nom> à <sha>, arbre propre, à jour avec origin).
  ```

- **Des écarts → CINQ lignes au plus**, une par écart, chacune sous la forme
  *attendu par le mandat → mesuré* (avec le commit ou le fichier qui
  l'explique). Pas de tableau, pas de sections, pas d'état des lieux, pas de
  liste de priorités, pas de « cap recommandé ».
  - Un écart qui change ce que le mandat demande (travail déjà livré,
    mauvaise branche, arbre portant le travail de quelqu'un d'autre) :
    **s'arrêter et attendre Grégoire.**
  - Un écart qui ne le change pas : le dire, et se mettre au travail.

---

## 5. CE QUE CETTE SKILL NE FAIT PAS

Lecture seule : aucune modification de fichier, aucun commit, aucun push.
En particulier :

- **Ne lit pas `SESSION.md`** (figé depuis le 15 septembre 2026) ni l'en-tête
  de `BACKLOG.md`, et **ne rapporte pas de priorités** : l'état d'ensemble et
  les priorités vivent dans la relève de Cowork, hors du dépôt
- Ne choisit pas le chantier : le mandat l'a déjà fait
- Ne mesure ni les tests, ni le verdict de GitHub, ni la version, hors de la
  condition des §2 et 3
- N'inventorie pas les autres branches
- Ne corrige pas la documentation périmée — elle la signale si elle fait écart
- Ne se substitue pas au skill `fin-de-session-labo-codex`

---

## ANTI-PATTERNS À ÉVITER

- ❌ Lancer une commande avant d'avoir lu le mandat
- ❌ Prendre le mandat pour argent comptant sans mesurer sa branche — c'est
  la raison d'être du rituel
- ❌ Sauter le `git fetch origin` (peut masquer une divergence avec le remote)
- ❌ Rapporter ce qui concorde : un rapport d'ouverture long est un rapport
  que Grégoire doit lire ou ignorer, sept ou huit fois par jour
- ❌ Rejouer le rituel en cours de session parce qu'un mot est passé
- ❌ Mesurer les tests « tant qu'à y être » quand le mandat ne publie rien
- ❌ Attendre une confirmation quand il n'y a aucun écart

---

## HISTORIQUE

| Date       | Changement                                                |
|------------|-----------------------------------------------------------|
| 2026-05-28 | Création. Pendant inverse du skill `fin-de-session-labo-codex`. Acté après écart de 24 h sur le Lot A ✴ : prémisse demandait un travail déjà livré au commit `11f87a1`. |
| 2026-06-11 | Format de version aligné sur SemVer (`X.Y.Z`). Déduplication : §8 et ANTI-PATTERNS resserrés (la consigne « lecture seule / ne pas prendre la prémisse pour argent comptant » n'est plus répétée 3×, elle renvoie à la Justification). |
| 2026-09-20 | §2.1 : deux verdicts, deux runs. Sur GitHub, Playwright ne tourne plus à chaque push mais une fois par jour (`schedule`, 8 h UTC) et à la demande ; le verdict au navigateur vient du dernier run planifié où Playwright a conclu, avec son SHA, et **un écart entre ce SHA et `HEAD` est normal**. Sur un push, `Garde` et `Playwright` sont `skipped` par construction. Décision de Grégoire : « oui pour l'étendue, non pour la fréquence ». |
| 2026-09-02 (soir, 2) | §2.1 : quatrième état — *jugé partiellement, N essais exclus de cette plateforme* (six essais du planificateur exclus sur WebKit Linux, dits par le nom d'une étape du job Playwright). Un vert Playwright sur GitHub porte sur 233, pas 239. |
| 2026-09-02 (soir) | §2.1 : la commande lit les JOBS, pas le run — le workflow est devenu deux jobs et Playwright peut être `skipped` sans que le run cesse d'être `success`. Trois états à distinguer, dont NON JUGÉ. |
| 2026-09-02 | §2.1 : le verdict de GitHub entre dans le rituel (une commande `gh`, une ligne rendue, SHA comparé à `HEAD`, deux cas d'écart distingués, conduite à tenir devant un rouge, conduite sans `gh`). Motif : « je ne vois pas de rouge » alors que huit runs consécutifs étaient rouges sur `main`. |
| 2026-10-10 | §2.1 : le passage Playwright de nuit est retiré (#1048, décision de Grégoire) ; le job `Garde` aussi. Le verdict au navigateur est le jeton du Mac ; un run GitHub n'existe qu'à la demande, et son absence ne se rapporte pas. Trois états pour un run demandé (le « non jugé » de la garde est parti avec elle). |
| 2026-11-10 | **Recentrage** (décision de Grégoire, sur recommandation de Cowork). Déclencheur unique : le premier tour d'une session ; « relai », « audit », « on commence », « où en est-on », « état des lieux » sont retirés. Le premier message est le mandat, lu d'abord (§0.1). L'inventaire git se limite à la branche du mandat, ou à `main` pour la session principale (§1.1) ; lecture de l'en-tête du rapport de cette branche (§1.2, neuf). Tests, verdict de GitHub et version (§2, §2.1, §3, texte inchangé) ne se mesurent que si le mandat demande une release, un verdict ou un push sur `main`. Le rapport ne porte que les écarts, cinq lignes au plus, une seule s'il n'y en a pas, et la session se met au travail (§4). **Retirés** : la lecture de `SESSION.md` (ancien §4), celle de l'en-tête de `BACKLOG.md` (ancien §5), le tableau prémisse/réel (ancien §6), le rapport « état des lieux » avec priorités et cap recommandé, et l'arrêt systématique en attente de confirmation (ancien §7). §0.5 et §1.0 gardés tels quels. Motif : le rituel lisait un `SESSION.md` figé depuis le 15 septembre et rapportait des priorités périmées, sept ou huit fois par jour ; l'état d'ensemble vit dans la relève de Cowork. |
| 2026-11-10 (2) | Décisions de Cowork sur le rapport du lot. §1.0 : `cat RELAIS.md` retiré (rien de `RELAIS.md` quand le mandat nomme la branche ; sinon sa dernière entrée seule, avec `offset`/`limit`) ; l'arrêt « branche distante plus récente que `main` » et son balayage `for-each-ref` retirés. Les §2, §2.1 et §3 sortent, mot pour mot, dans le fichier voisin `mesures-sous-condition.md`, chargé seulement si le mandat demande une release, un verdict ou un push sur `main`. L'agent `audit-debut-session` est retiré : le rituel tient en quelques commandes et s'applique dans la session. |
| 2026-11-12 | `mesures-sous-condition.md`, §2.1 : périmé depuis le 16 oct. (signalé au relais de la 1.243.0). GitHub juge au navigateur sur le PUSH qui touche un chemin observable, en 20 morceaux, et à la demande ; le job `Playwright — verdict` porte le verdict ; la mesure lit les jobs du dernier push. Le jeton du Mac reste le verdict du Mac : WebKit Linux n'est pas Safari macOS. |
