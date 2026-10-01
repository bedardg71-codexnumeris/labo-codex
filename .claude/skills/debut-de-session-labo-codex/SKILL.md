---
name: debut-de-session-labo-codex
description: >
  Workflow exécutable de début de session pour Labo Codex. Déclencher
  SYSTÉMATIQUEMENT au premier tour de toute nouvelle session de travail
  sur ce projet, ou dès que Grégoire dit « où en est-on », « état des
  lieux », « on commence », « relai », « audit », ou envoie une prémisse
  de relance avec des commandes git. Objectif : produire un état des
  lieux factuel du dépôt AVANT de prendre la prémisse de relance pour
  argent comptant, et signaler tout écart entre la prémisse reçue et
  l'état mesuré.
  Lecture seule — aucune modification de fichier, aucun commit, aucun push.
  Pendant inverse du skill `fin-de-session-labo-codex`.
---

# SKILL : Rituel de début de session — Labo Codex

> Cette skill est une procédure exécutable, pas une référence. Elle
> automatise l'audit factuel qu'un développeur consciencieux ferait
> avant d'ouvrir un chantier dans un dépôt qu'il n'a pas touché depuis
> plusieurs heures. Elle est en lecture seule.
>
> **Justification** : la commande de relance que Grégoire envoie au
> début d'une session est souvent préparée la veille au soir et pointe
> vers un état du dépôt qui a évolué entre-temps (autre cycle de
> travail, commits poussés depuis, sessions intermédiaires). Sans
> audit, le risque est de coder sur la base d'une prémisse périmée —
> refaire un travail déjà livré, collider avec l'existant, ou rater
> une urgence ajoutée depuis. Acté 28 mai 2026 PM après écart de 24 h
> détecté sur le Lot A ✴ (livré au commit `11f87a1` mais demandé à
> nouveau dans la prémisse du lendemain).
>
> **Lien** : quand la demande est d'**auditer** le travail d'une session
> antérieure (et pas seulement d'ouvrir la journée), ce baseline factuel est
> l'étape 0 du mode B (audit tiers) du skill `verification-adverse` —
> enchaîner ensuite sur le break-test et la relecture des coutures.

---

## 0. QUAND DÉCLENCHER

- Tout premier tour d'une nouvelle session de travail sur ce projet
- Quand Grégoire dit « où en est-on », « état des lieux », « on commence »,
  « relai », « audit », « fais le point »
- Quand Grégoire envoie une prémisse de relance contenant des assertions
  vérifiables (« HEAD attendu », « N tests verts », « ~N occurrences »,
  « version X.Y.Z attendue »)
- Quand plus de quelques heures se sont écoulées depuis le dernier
  échange et que le contexte de session précédent est perdu

**Ne PAS déclencher** pendant une session déjà en cours (le contexte
récent suffit), pendant un debug actif, ou si Grégoire enchaîne
explicitement une demande sur un travail déjà en cours.

---

## 1. INVENTAIRE GIT

**Objectif** : connaître le HEAD réel et l'état du dépôt.

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

### 1.1 Ensuite, l'inventaire proprement dit

```bash
# depuis la racine du dépôt
git status
git log --oneline main -10
```

Produire :
- Branche courante
- HEAD réel (hash + message du commit)
- Date du dernier commit
- Nombre de commits depuis le HEAD attendu par la prémisse (s'il y en a une)
- Divergence éventuelle avec `origin/main` (ahead/behind)
- État des fichiers tracked (clean ? modifications non commitées ?)
- Volume des fichiers untracked (signal qu'un chantier est en cours
  mais pas commité, ou que des artefacts s'accumulent)

---

## 2. ÉTAT DES TESTS

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

⚠⚠ **DEPUIS LE 20 SEPTEMBRE 2026, IL Y A DEUX VERDICTS, DE DEUX RUNS DIFFÉRENTS.**
Décision de Grégoire (journal de `tests.yml`, point 7) : sur GitHub, la suite au
navigateur ne tourne plus à chaque push, mais **une fois par jour** (`schedule`, 8 h UTC
= 4 h à Toronto l'été, 3 h l'hiver) et à la demande (`workflow_dispatch`). Donc :
· **le verdict de Vitest** vient du run du **dernier push** ;
· **le verdict au navigateur** vient du **dernier run planifié (ou demandé) dont le job
  Playwright a conclu** — avec SON SHA. **Un écart entre ce SHA et `HEAD` est NORMAL,
  pas un défaut** : c'est le `main` de 4 h du matin qui a été jugé. Ce qui serait un
  défaut : un SHA jugé vieux de plusieurs jours alors que du code a été poussé depuis.
Sur le run d'un push, `Garde` et `Playwright (WebKit)` sont `skipped` : c'est la forme
attendue, pas un « non jugé » à signaler.

**La mesure, dix secondes — pas de script neuf :**

```bash
# 1. Vitest : le run du dernier push
gh run list --branch main --event push --limit 1 --json databaseId,conclusion,createdAt,headSha \
  --jq '.[0] | "push · run \(.databaseId) · \(.conclusion) · \(.createdAt) · commit \(.headSha[0:8])"'
# 2. Navigateur : les derniers runs planifiés ou demandés, et LEURS JOBS
for ev in schedule workflow_dispatch; do
  gh run list --workflow tests.yml --event $ev --limit 3 --json databaseId,conclusion,createdAt,headSha \
    --jq ".[] | \"$ev · run \(.databaseId) · \(.conclusion) · \(.createdAt) · commit \(.headSha[0:8])\""
done
gh run view <id du plus récent> --json jobs --jq '.jobs[] | "  \(.name) · \(.conclusion)"'
git rev-parse --short=8 HEAD
```

⚠ **Un run planifié `success` avec Playwright `skipped` n'a rien jugé** : la garde
d'inutilité (`scripts/ci-garde-inutilite.sh`) a constaté que rien d'observable n'avait
bougé depuis le dernier SHA jugé ; son résumé d'étape le dit. Le verdict au navigateur
est alors celui du run planifié PRÉCÉDENT où Playwright a conclu : remonter jusqu'à lui.
⚠ **Besoin d'un verdict tout de suite** : `gh workflow run tests.yml --ref main` — mais
c'est 35 à 55 minutes facturées : le proposer à Grégoire, ne pas le lancer de soi-même.

⚠⚠ **LIRE LES JOBS, PAS SEULEMENT LE RUN** (depuis le 2 septembre au soir). Le workflow
a trois jobs : `Vitest` (push, pull request, à la demande), `Garde` et
`Playwright (WebKit)` (planifié et à la demande seulement ; Playwright **seulement si la
garde répond oui**). **Un run peut donc rendre `success` avec Playwright `skipped`** — et c'est exactement la confusion qui a
coûté deux jours : un verdict absent pris pour un verdict bon. La seconde commande rend
un état PAR JOB ; c'est lui qu'on rapporte.

⮕ **À rendre en français, dans le rapport d'état, en distinguant QUATRE états** :
· **jugé et vert** — les deux jobs `success` ;
· **jugé et rouge** — un job `failure` : lequel, et (`gh run view <id> --log-failed`)
  quelle étape, quel(s) fichier(s) ;
· **NON JUGÉ, et pourquoi** — sur un run PLANIFIÉ, Playwright `skipped` : *« Playwright
  n'a pas tourné : rien d'observable au navigateur n'a bougé depuis le commit <sha> »*.
  ⚠ Vérifier que c'est vrai : `git diff --name-only <sha jugé> <sha du run>` ne doit
  montrer aucun chemin de `OBSERVABLE`. Si du code a bougé et que Playwright a sauté
  quand même, **la garde est trop étroite : le dire**, ne pas la corriger dans le rituel.
  (Sur le run d'un PUSH, `skipped` est la forme normale depuis le 20 septembre.)
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
distinguer avant de conclure** (pour le verdict au navigateur, l'écart est normal — voir
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

Reporter :
- Nombre de tests passés / échoués (Vitest + Playwright)
- **Le verdict de GitHub sur `main`** : réussi/échoué, date, commit jugé, = `HEAD` ?
  (§2.1) — ou pourquoi il n'est pas lisible
- Si écart avec un nombre attendu par la prémisse, le signaler
- Temps total
- Si échec : nom du test, fichier, ligne, message condensé

Si la suite n'est pas exécutable, le signaler clairement — ne PAS
prétendre que les tests passent.

---

## 3. ÉTAT DE LA VERSION

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

## 4. LECTURE DE SESSION.md

**Objectif** : prendre connaissance du dernier relai écrit.

Lire :
- Le bloc d'identification (lignes 1-20 environ) — « Chemin canonique »,
  « Dernier cycle livré », « Cycle suivant — démarrage »
- Le §0 (récap de la dernière session) — méthode, livrables, BACKLOG
  inscrit, prochain cap
- Toute « Note de relance » insérée plus haut qu'un §0 antérieur

Identifier :
- La priorité annoncée pour la prochaine session
- Les chantiers en suspens
- Les items BACKLOG cités ⚠️ urgents

Si le bloc d'identification mentionne un HEAD différent du HEAD réel
mesuré au §1, le signaler comme **écart documentaire** (SESSION.md
elle-même est périmée).

---

## 5. LECTURE DU HAUT DE BACKLOG.md

**Objectif** : connaître les items prioritaires actuels.

⚠ **NE PAS lire « les 25 premières lignes ».** Cette consigne datait d'un
fichier aux lignes courtes ; l'en-tête actuel a des lignes de plus de
10 000 caractères, et `head -25` coûte ~22 000 octets (~7 400 tokens).

**Lire UNIQUEMENT le premier bloc « État courant »** — le plus récent, en
tête de fichier, ~900 octets. Il contient l'essentiel : version, ce qui vient
d'être clos, ce qui reste dû.

```bash
grep -m1 -n "État courant" BACKLOG.md      # localiser
sed -n "<n>p" BACKLOG.md                   # lire cette ligne seule
```

En tirer :
- État courant annoncé (HEAD + items ouverts + dernier ID)
- Si la ligne « État courant » mentionne un HEAD différent du HEAD réel,
  le signaler comme **écart documentaire**

⚠ **Le « Dernier ID » fait foi à UNE ligne** : « Dernier ID utilisé » en tête de
`BACKLOG.md` (posée le 12 sept. 2026 ; compteur unique avec SUIVI-BUGS). Les
« Dernier ID » des blocs « État courant » sont historiques. Si un grep sur le
BACKLOG, son archive ou SUIVI-BUGS trouve un numéro plus haut que cette ligne,
le signaler comme écart documentaire.

Puis parcourir les sections (≤ 1 ligne par section) pour repérer :
- Items ⚠️ priorité haute actée
- Items ⚠️ AVANT AQPC (ou autres deadlines datées)
- Items 📐 en attente de décision UX

---

## 6. COMPARAISON PRÉMISSE vs RÉEL

**Objectif** : pour chaque assertion vérifiable de la prémisse de
relance, indiquer attendu vs mesuré.

Si la prémisse contient des éléments comme :
- « HEAD attendu : ... »
- « N tests verts attendus »
- « ~N occurrences attendues »
- « version X.Y.Z attendue »
- « branche X attendue propre »

Construire un tableau de comparaison ≤ 5 lignes :

| Vérification | Attendu par la prémisse | Réel mesuré |
|---|---|---|

Si écart, nommer le ou les commits qui expliquent la différence et
proposer une note de relance courte à insérer dans SESSION.md (juste
après le bloc d'identification, avant le §0 le plus récent).

Si pas d'écart, le dire en une ligne et passer au §7.

---

## 7. RAPPORT FINAL ET CAP

**Objectif** : produire une synthèse courte qui permet à Grégoire de
choisir le prochain chantier en toute connaissance de cause.

Format :

```
=== ÉTAT DES LIEUX — DÉBUT DE SESSION ===

Repo :
  - Branche : main (à jour avec origin)
  - HEAD : <hash> <message court>
  - Dernier commit : <date>
  - Untracked : <volume résumé>

Tests :
  ✅ N/N verts en T s
  ou
  ❌ K/N échecs

Version :
  X.Y.Z / build MMJJ-HHMM
  (cohérent avec le dernier commit)

Écart prémisse vs réel :
  ✅ Aucun écart
  ou
  ⚠ Écart détecté :
    [tableau attendu vs mesuré]
    Explication : <N commits passés depuis, dont ...>

Priorités annoncées (SESSION.md + BACKLOG) :
  ⚠️ AVANT AQPC : <items>
  ⚠️ Priorité haute actée : <items>
  📐 Décision UX en attente : <items>

Cap recommandé pour la session :
  <propose 1-2 options en question fermée si pertinent>
```

⏸ S'arrêter ici. Attendre confirmation Grégoire sur le cap avant
d'ouvrir un chantier.

---

## 8. CE QUE CETTE SKILL NE FAIT PAS

Lecture seule (cf. Justification en tête) : aucune modification de fichier,
aucun commit, aucun push. En particulier :

- Ne corrige pas la documentation périmée (SESSION.md, BACKLOG.md…) —
  seulement la signaler, et proposer une note de relance que Grégoire validera
- Ne décide pas du chantier à attaquer — prérogative de Grégoire
- Ne se substitue pas au skill `fin-de-session-labo-codex` (qui audite le code
  modifié contre les règles de sécurité)
- Ne lit pas tout SESSION.md (fichier de >1000 lignes en moyenne) —
  seulement le bloc d'identification et le §0 le plus récent

---

## ANTI-PATTERNS À ÉVITER

- ❌ Prendre la prémisse de relance pour argent comptant sans audit —
  c'est la raison d'être du rituel
- ❌ Sauter le `git fetch origin` (peut masquer une divergence avec le remote)
- ❌ Confondre « SESSION.md à jour » et « prémisse de relance à jour » —
  l'une peut être correcte et l'autre périmée
- ❌ Ignorer les fichiers untracked sans les énumérer rapidement (un
  chantier en cours non commité peut représenter du travail à préserver)
- ❌ Enchaîner directement sur un chantier sans avoir produit le §7
  rapport final — l'objectif du skill est de poser le décor, pas de
  faire le travail

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
