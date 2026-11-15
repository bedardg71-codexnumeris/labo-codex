# Mesures sous condition — tests, verdict de GitHub, version

> **Fichier voisin du skill `debut-de-session-labo-codex`. À ne charger que si le
> mandat demande une release, un verdict ou un push sur `main`.** Sorti du
> `SKILL.md` le 10 novembre 2026 pour que les sessions qui ne publient rien ne
> le paient pas à chaque ouverture. Le texte des §2, §2.1 et §3 est celui du
> skill, mot pour mot ; son historique reste dans le `SKILL.md`.
>
> C'est aussi la base factuelle du mode B (audit tiers) du skill
> `verification-adverse`.
>
> Lecture seule, comme le rituel. Les résultats entrent dans la comparaison du
> §4 du skill : seuls les écarts sortent.

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
cat scripts/.verdict-playwright.json      # LIRE le jugement déjà rendu : `nuage` et `complement`, chacun avec son sha et son code
git rev-parse HEAD                        # à comparer aux sha du jeton
node scripts/verdict-nuage.mjs            # relève le verdict du nuage pour HEAD (lecture ; ne lance rien)
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
deux parts depuis le 14 nov. 2026 (règle 7 de `PROTOCOLE.md`) : `nuage` (le verdict
complet, rendu par GitHub) et `complement` (ce que Linux ne juge pas, rejoué sur le
Mac), chacune avec le SHA jugé (`sha`) et le résultat (`code`, 0 = vert) ; le haut du
jeton (`sha`, `code`, `rendule`) est un verdict complet du Mac, quand il en a été pris
un. **Une part qui ne correspond pas à `HEAD` est périmée.** Un verdict
périmé ou absent se RAPPORTE (sha jugé, heure, nombre de commits depuis :
`git rev-list --count <sha>..HEAD`, et combien touchent `js/` ou `tests/`) ; il ne
se rattrape pas ici. Le jugement se prend à la clôture : verdict du nuage sur la
branche poussée, puis complément du Mac (skill `fin-de-session-labo-codex`, §4.5).
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

⚠⚠ **DEPUIS LE 16 OCTOBRE 2026, GITHUB JUGE AU NAVIGATEUR SUR LE PUSH ET À LA DEMANDE**
(corrigé le 12 novembre 2026 : ce paragraphe disait encore « à la demande seulement », l'état
du 10 octobre, point 8 de `tests.yml`). Le dépôt est public, les minutes sont gratuites
(point 9 de `tests.yml`) : un push sur `main` qui touche un chemin OBSERVABLE
(`scripts/lot-observable.sh`, dans le doute oui) fait jouer Playwright sur WebKit Linux, en
20 morceaux parallèles (`total=` dans le job `decision`), puis un job `verdict` les juge
contre `scripts/playwright-baseline-linux.json` : seule une rougeur NOUVELLE fait échouer.
Un `workflow_dispatch` (`gh workflow run tests.yml --ref main`) fait la même chose à la
demande. Donc :
· **DEPUIS LE 14 NOV. 2026, GITHUB EST LE JUGE DU VERDICT COMPLET** (décision de Grégoire,
  règle 7 de `PROTOCOLE.md`) : une branche se juge AVANT sa fusion, par un run demandé sur
  elle (`workflow_dispatch`, nommé « Verdict du nuage — <branche> ») ; le run du push sur
  `main` rejuge le même commit, en dernier filet ;
· **le Mac complète** : `scripts/complement-mac.mjs` rejoue sous le WebKit de macOS ce que
  Linux ne juge pas (la liste `playwright-baseline-linux.json` et les exclus), et écrit la
  part `complement` du jeton. WebKit Linux n'est pas Safari macOS : c'est pour cela que la
  liste existe, chaque entrée avec sa cause ;
· un push qui ne touche aucun chemin observable : `decision` dit non, les morceaux et le
  verdict sont `skipped` — c'est la forme attendue, le dire tel quel.

**La mesure, dix secondes — pas de script neuf :**

```bash
# Le run du dernier push (Vitest, puis Playwright s'il a joué), job par job
gh run list --branch main --event push --limit 1 --json databaseId,conclusion,createdAt,headSha \
  --jq '.[0] | "push · run \(.databaseId) · \(.conclusion) · \(.createdAt) · commit \(.headSha[0:8])"'
gh run view <id> --json jobs --jq '.jobs[] | select(.name | test("Vitest|décider|juger|verdict")) | "  \(.name) · \(.conclusion)"'
# Un run demandé, s'il y en a un (souvent vide : c'est normal)
gh run list --workflow tests.yml --event workflow_dispatch --limit 3 --json databaseId,conclusion,createdAt,headSha \
  --jq '.[] | "workflow_dispatch · run \(.databaseId) · \(.conclusion) · \(.createdAt) · commit \(.headSha[0:8])"'
git rev-parse --short=8 HEAD
```

⚠ **Besoin d'un verdict du nuage sur un commit qui n'en a pas** :
`node scripts/verdict-nuage.mjs --lancer` sur la branche poussée (gratuit depuis le 16 oct.,
une demi-heure environ). À l'OUVERTURE, le proposer à Grégoire, ne pas le lancer de
soi-même ; à la clôture d'un lot, c'est le geste normal (fin-de-session, §4.5).

⚠⚠ **LIRE LES JOBS, PAS SEULEMENT LE RUN** (depuis le 2 septembre au soir). Le workflow a
quatre jobs : `Vitest`, `Playwright doit-il juger ?` (`decision`), `Playwright (WebKit) n/20`
(chacun joue sa part et ne juge pas) et `Playwright — verdict` (qui juge). **C'est le job
`Playwright — verdict` qui porte le verdict au navigateur** ; un morceau `failure` sans
verdict rouge n'est pas un rouge, un morceau manquant rend le verdict NON JUGÉ (rouge, et
le dire comme tel). La seconde commande rend un état PAR JOB ; c'est lui qu'on rapporte.

⮕ **À rendre en français, dans le rapport d'état, pour un run qui a joué Playwright (push ou
demandé), en distinguant TROIS états** :
· **jugé et vert** — `Vitest` et `Playwright — verdict` `success` ;
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

⚠ **Pour le verdict de GitHub, si le SHA ne correspond pas à `HEAD`, deux cas, à
distinguer avant de conclure** (le verdict du Mac, lui, est le jeton — voir plus haut) **:**
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
une trouvaille, et elle reçoit la question habituelle — *est-ce que ça empêche la cible du
27 novembre (`OBJECTIF-COHORTE-1.md`) ?* — puis l'une des trois issues de `CLAUDE.md`.

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
