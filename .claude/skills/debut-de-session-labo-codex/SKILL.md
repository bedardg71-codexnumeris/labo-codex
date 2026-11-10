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
  qui ouvre, ou non, les mesures des §2 et §3.

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

### 1.0 ⚠ D'ABORD : où vit le travail ? (ajouté le 8 août 2026)

**Deux gestes, dans cet ordre, AVANT le reste.**

```bash
git fetch origin --prune
cat RELAIS.md                      # le fichier vit sur main : il dit la branche à prendre
git for-each-ref --sort=-committerdate \
    --format='%(committerdate:short) %(refname:short)' refs/remotes/origin | head
```

**Si une branche distante est plus récente que `main`** — ou si `RELAIS.md`
nomme une branche autre que `main` — **s'arrêter et le signaler à Grégoire
avant de coder**. Ne pas supposer que la prémisse de relance en tient compte.

▣ **POURQUOI CE CONTRÔLE EXISTE.** Le 8 août 2026, deux sessions sont parties
du même commit sans se voir : chacune a livré une « 1.55.0 » différente et pris
les mêmes identifiants de backlog. La seconde **avait fait ce rituel**, vérifié
la prémisse, et trouvé **zéro écart** — parce que la prémisse qu'elle lisait,
sur `main`, avait été périmée par une branche qu'elle ne pouvait pas voir.

⮕ **La leçon générale** : la consigne de relais est un fichier VERSIONNÉ. Quand
le travail vit sur une branche non mergée, la consigne qui le dit vit sur cette
branche aussi. *Une session qui ne démarre pas sur la bonne branche ne peut pas
lire l'instruction qui lui dit quelle branche prendre.* Le rituel ne protège
que contre ce que `main` sait — d'où ce balayage, qui coûte cinq secondes.

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

## ⛔ LES §2 ET §3 NE SE MESURENT QUE SUR DEMANDE DU MANDAT

**L'état des tests, le verdict de GitHub et la version ne se mesurent que si
le mandat demande une release, un verdict ou un push sur `main`.** Sinon,
sauter droit au §4 : une session de lot qui ne publie rien n'a pas à payer
Vitest ni `gh` à l'ouverture, et le verdict se prend de toute façon à la
clôture (skill `fin-de-session-labo-codex`, §4.5).

Quand ils se mesurent, leurs résultats entrent dans la comparaison du §4
comme le reste : seuls les écarts sortent.

---

## 2. ÉTAT DES TESTS — seulement si le mandat demande une release, un verdict ou un push sur `main`

**Objectif** : confirmer que la suite de tests passe avant d'attaquer
un nouveau chantier.

```bash
cd tests && npm run test:unit
```

⛔ **PAS `npm test`** (corrigé le 2 septembre 2026 ; ce skill le prescrivait
encore). Il enchaîne Vitest ET Playwright : **plus de dix minutes** sur cette
machine, et six minutes de silence ferment la connexion au serveur (#533).

**Et deux mesures d'ouverture que personne n'avait faites pendant cinq jours.**
Elles prennent dix secondes et elles ont trouvé deux retards le 31 août.

```bash
git rev-list --count origin/main..HEAD    # doit rendre 0
cat scripts/.verdict-playwright.json      # LIRE le verdict déjà rendu : sha, code, rendule
git rev-parse HEAD                        # à comparer au sha du jeton
```

⮕ La première rendait **8** : tout le travail d'un trio, son propre relais compris,
ne vivait que sur cette machine.
⮕ La seconde lit le dernier verdict Playwright. Le 31 août, il n'avait pas été
rendu depuis cinq jours, sur 299 commits dont 35 touchant `tests/integration/`.
**Aucun push n'avait été bloqué par un rouge Playwright, parce qu'aucun push ne
l'avait jamais consulté.**

⛔ **À L'OUVERTURE, ON LIT LE VERDICT, ON NE RELANCE RIEN** (corrigé le 30 septembre
2026 ; ce skill prescrivait `node ../scripts/verifier-playwright.mjs` comme une
mesure de dix secondes). Ce script lance **toute la suite Playwright** : environ
43 minutes sur cette machine. Le 30 septembre à 20 h 44, l'audit d'ouverture l'a
lancé ; il a été tué à 30 minutes, sans verdict. Ni `verifier-playwright.mjs`, ni
`npx playwright test` sans nom de spec, ni `npm test` dans ce rituel.

⚠ **Lire le JETON** (`scripts/.verdict-playwright.json`), pas un code de sortie
tuyauté : `echo "CODE=$?"` après un `| tail` rend le code de `tail`. Le jeton porte
le SHA du commit jugé (`sha`), le résultat (`code`, 0 = vert) et l'heure (`rendule`,
en UTC) ; **s'il ne correspond pas à `HEAD`, le verdict est périmé.** Un verdict
périmé ou absent se RAPPORTE (sha jugé, heure, nombre de commits depuis :
`git rev-list --count <sha>..HEAD`, et combien touchent `js/` ou `tests/`) ; il ne
se rattrape pas ici. Le verdict complet se prend à la clôture, par
`scripts/pousser.sh` (skill `fin-de-session-labo-codex`, §4.5).
⚠ **Un spec seul se lance en secondes** et départage mieux qu'une suite complète :
`cd tests && npx playwright test integration/<spec>.js`.

### 2.1 ⚠ LE VERDICT DE GITHUB — une troisième mesure d'ouverture (ajoutée le 2 septembre 2026)

**Pourquoi.** Question de Grégoire, le 2 septembre : *« Quand la vérification de GitHub
échoue après un push, est-ce que tu l'apprends ? »* Réponse : *« Je ne sais pas. »* Puis :
*« Je ne vois pas de rouge. »* La mesure du même jour a rendu **huit runs consécutifs en
échec ou annulés sur `main`, y compris sur `HEAD`**. Le verdict existait ; personne ne
l'allait chercher. Le hook pré-push n'y peut rien (il laisse passer faute de verdict
local, par décision du 26 août — Grégoire pousse depuis GitHub Desktop) ; la CI juge
chaque push de toute façon. **Le manque était la lecture.**

⚠⚠ **DEPUIS LE 10 OCTOBRE 2026, GITHUB NE JUGE PLUS AU NAVIGATEUR QU'À LA DEMANDE.**
Décision de Grégoire (journal de `tests.yml`, point 8 ; #1048) : le passage de nuit
(`schedule`) est retiré — ses huit derniers runs étaient coupés à 60 min et ne jugeaient
plus rien. Le job `Garde` est retiré avec lui. Donc :
· **le verdict de Vitest** vient du run du **dernier push** (GitHub) ;
· **le verdict au navigateur** est celui du **Mac** : le jeton
  `scripts/.verdict-playwright.json` (ci-dessus), rendu par `pousser.sh` avant chaque push
  de code. **Aucun run GitHub planifié n'existe : son absence n'est ni un manque ni un
  succès — ne pas la rapporter.**
· un run **demandé** (`workflow_dispatch`) peut exister, si Grégoire l'a lancé : alors,
  et alors seulement, lire ses jobs.
Sur le run d'un push, `Playwright (WebKit)` est `skipped` : c'est la forme attendue, pas
un « non jugé » à signaler.

**La mesure, dix secondes — pas de script neuf :**

```bash
# 1. Vitest : le run du dernier push
gh run list --branch main --event push --limit 1 --json databaseId,conclusion,createdAt,headSha \
  --jq '.[0] | "push · run \(.databaseId) · \(.conclusion) · \(.createdAt) · commit \(.headSha[0:8])"'
# 2. Navigateur, à la demande seulement (souvent vide : c'est normal)
gh run list --workflow tests.yml --event workflow_dispatch --limit 3 --json databaseId,conclusion,createdAt,headSha \
  --jq '.[] | "workflow_dispatch · run \(.databaseId) · \(.conclusion) · \(.createdAt) · commit \(.headSha[0:8])"'
gh run view <id du plus récent, s'il y en a un> --json jobs --jq '.jobs[] | "  \(.name) · \(.conclusion)"'
git rev-parse --short=8 HEAD
```

⚠ **Besoin d'un verdict GitHub au navigateur** : `gh workflow run tests.yml --ref main` —
mais c'est 35 à 55 minutes facturées, et le plafond de 60 min peut le couper : le proposer
à Grégoire, ne pas le lancer de soi-même.

⚠⚠ **LIRE LES JOBS, PAS SEULEMENT LE RUN** (depuis le 2 septembre au soir). Le workflow
a deux jobs : `Vitest` (push, pull request, à la demande) et `Playwright (WebKit)` (à la
demande seulement). **Un run de push rend donc `success` avec Playwright `skipped`** — et
c'est exactement la confusion qui a coûté deux jours : un verdict absent pris pour un
verdict bon. La seconde commande rend un état PAR JOB ; c'est lui qu'on rapporte.

⮕ **À rendre en français, dans le rapport d'état, pour un run DEMANDÉ, en distinguant
TROIS états** :
· **jugé et vert** — les deux jobs `success` ;
· **jugé et rouge** — un job `failure` : lequel, et (`gh run view <id> --log-failed`)
  quelle étape, quel(s) fichier(s) ; un job `cancelled` après 60 min est coupé par le
  plafond, pas rouge : le dire ;
· **jugé PARTIELLEMENT, N essais exclus de cette plateforme** — depuis le 2 septembre
  au soir, six essais (cinq specs du planificateur et un bandeau) ne tournent pas sur le
  runner WebKit Linux, où ils ne peuvent pas juger ; ils restent jugés par
  `npm run test:int` sur macOS. Le job Playwright le DIT dans le nom d'une étape :
  ```bash
  gh run view <id> --json jobs --jq '.jobs[] | select(.name | test("Playwright")) | .steps[] | select(.name | test("NON JUGÉS")) | .name'
  ```
  ⮕ rend `6 essais NON JUGÉS ici (5 specs, WebKit Linux ≠ Safari macOS)`. **Un vert de
  Playwright sur GitHub est TOUJOURS un vert sur 233, pas 239** : le dire dans la ligne.
  La liste vit dans `tests/playwright.config.js` (`EXCLUS_WEBKIT_LINUX`), verrouillée par
  le cliquet `sentinelle-ci-paths-ignore` (bloc 3) : elle ne grandit pas sans qu'on l'ait
  décidé.
Et toujours : *le <date>, sur le commit <sha>* — **et si ce commit est `HEAD`**. C'est la leçon du jeton Playwright, calquée sur
`scripts/lire-verdict.mjs` : **un verdict qui ne porte pas le SHA jugé ne dit pas sur quoi
il porte.** Un vert vieux de trois semaines n'est pas un vert.

⚠ **Pour le verdict de VITEST, si le SHA ne correspond pas à `HEAD`, deux cas, à
distinguer avant de conclure** (le verdict au navigateur, lui, est le jeton du Mac — voir
plus haut) **:**
· `HEAD` ne touche que de la documentation (`paths-ignore` de
  `.github/workflows/tests.yml`) → **aucun run ne le porte, et c'est normal** ; le verdict
  vaut pour le dernier commit qui touchait du code. Le dire tel quel.
· `HEAD` touche du code et aucun run ne le porte → le run n'a pas démarré (quota Actions,
  cf. l'en-tête de `tests.yml`) ou n'est pas fini (`status` ≠ `completed`). Le dire.

⚠ **Si `gh` est absent ou non authentifié** (`which gh && gh auth status`) : ⛔ **ne rien
installer, ne rien connecter** — un outil qui s'authentifie au compte GitHub de Grégoire
est une décision qui lui appartient. **Rendre la ligne quand même** : *« je ne peux pas lire
le verdict de GitHub : <motif> »*. Un « je ne peux pas, voici pourquoi » vaut infiniment
mieux qu'un silence : c'est le silence qui a produit « je ne sais pas ».

**Ce qu'une session fait d'un ROUGE.** Elle le **dit à Grégoire en français, en tête de
son rapport d'ouverture, avant tout le reste** — quel job, quelle étape, quel(s) fichier(s)
de test, en une ligne chacun (`gh run view <id> --log-failed`). **Elle ne corrige rien
d'elle-même** : un rouge de CI sur un commit déjà publié n'est pas le mandat du jour, c'est
une trouvaille, et elle reçoit la question habituelle — *est-ce que ça empêche un des huit
énoncés ?* — puis l'une des trois issues de `CLAUDE.md`.

Ce qui compte comme écart ici (§4) : un test en échec (nom, fichier, message
condensé), un nombre différent de celui que le mandat annonce, un jeton
périmé ou absent, un verdict de GitHub rouge ou illisible (§2.1), un commit
local absent d'origin.

Si la suite n'est pas exécutable, le signaler clairement — ne PAS
prétendre que les tests passent.

---

## 3. ÉTAT DE LA VERSION — même condition que le §2

**Objectif** : lire `version.json` pour connaître la version/build courante.

```bash
cat version.json
```

Reporter :
- Version SemVer (`X.Y.Z`) et build (`MMJJ-HHMM`) du fichier
- Comparaison avec ce que la prémisse annonce (s'il y a une assertion)
- Cohérence avec le dernier commit (le message du dernier commit
  contient souvent le build pour confirmation croisée)

Ne PAS vérifier ici la cohérence avec les fallbacks `init-inline.js`
et `main.js` — c'est le rôle du rituel de fin de session.

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
- un contrôle du §0.5 ou du §1.0 a levé un drapeau ;
- une mesure des §2 et §3, quand elles ont été prises, contredit le mandat.

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
  condition des §2 et §3
- N'inventorie pas les autres branches (le balayage du §1.0 mis à part)
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
