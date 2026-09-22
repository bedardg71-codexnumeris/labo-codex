# Guide de déploiement — Labo Codex

> **Version** : 1.10 (21 septembre 2026 — §3.4 ter : Web Analytics (payant, faussé par Cloudflare) et Real User Monitoring (aucune donnée) de Netlify désactivés. Historique antérieur : v1.9, 19 septembre 2026 — §3.4 bis : mode « Under Attack » trouvé actif depuis un an et désactivé ; il bloquait au moins un utilisateur légitime. Historique antérieur : v1.8, 14 septembre 2026 — §1.4 : correction du fondement juridique cité. La loi ne «exclut» pas les fins personnelles, elle délimite son objet à l'exploitation d'une entreprise (art. 1525 C.c.Q.) ; même correction que `PRIVACY.md` v1.3. Historique antérieur : v1.7, 1er septembre 2026 — les deux sous-domaines `*.netlify.app` servaient l'application sans authentification, MESURÉ ; redirigés en 301 vers `app.codexnumeris.org` dans `netlify.toml`. Historique antérieur : v1.6, 27 août 2026 — réactivation de Cloudflare Access au 1er septembre 2026 avec une policy ouverte ; quatre affirmations fausses corrigées ; §4.4 refondue en export périodique des identités)
> **Public** : Grégoire Bédard (mainteneur principal) + co-mainteneur éventuel
> **Document apparenté** : [`PRIVACY.md`](PRIVACY.md), [`INCIDENTS.md`](INCIDENTS.md)

Ce document décrit la chaîne complète de mise en ligne de Labo Codex :
de l'écriture du code sur la machine du mainteneur jusqu'à sa disponibilité
pour les personnes invitées.

---

## 1. Vue d'ensemble

```
┌──────────────────┐    git push     ┌──────────────────┐
│ Machine locale   │ ───────────────▶│ GitHub (main)    │
│ MacBook M3       │                  │ Dépôt public     │
└──────────────────┘                  └──────────────────┘
                                              │
                                              │ webhook
                                              ▼
                                      ┌──────────────────┐
                                      │ Netlify          │
                                      │ Build + Deploy   │
                                      │ (auto sur main)  │
                                      └──────────────────┘
                                              │
                                              │ origine
                                              ▼
                                      ┌──────────────────┐
                                      │ Cloudflare       │
                                      │ DNS + Access     │
                                      │ (proxy orange)   │
                                      └──────────────────┘
                                              │
                                              │ HTTPS / OTP
                                              ▼
                                      ┌──────────────────┐
                                      │ Expérimentateur  │
                                      │ Mac / iPad       │
                                      └──────────────────┘
```

### 1.1 Composants

| Composant | Rôle | Plan / coût |
|---|---|---|
| **GitHub** | Dépôt source, branche `main` = vérité | Plan gratuit — ⚠ **dépôt PRIVÉ depuis le 23 juin 2026** (cf. §8.3). Les minutes Actions sont dès lors décomptées d'un quota mensuel. |
| **Netlify** | Build + hébergement statique de l'application | Plan gratuit |
| **Cloudflare DNS** | Résolution DNS du domaine `app.codexnumeris.org` | Gratuit |
| **Cloudflare Access** | Identification Zero Trust (OTP par courriel), porte ouverte à toute adresse. Retiré le 28 mai 2026 pour l'AQPC, **réactivé le 1er septembre 2026** — voir §3 | Gratuit (50 sièges) |

### 1.2 URL et domaines

| URL | Rôle | Accessible |
|---|---|---|
| `app.codexnumeris.org` | URL publique principale | Publique sans authentification du 28 mai au 31 août 2026 ; **identification par OTP à partir du 1er septembre 2026** (porte ouverte, cf. §3) |
| `codexnumeris-051225.netlify.app` | Sous-domaine Netlify par défaut du site | ↻ **Redirigé en 301 vers `app.codexnumeris.org` depuis le 1er septembre 2026** (`netlify.toml`). Servait auparavant l'application complète sans authentification |
| `main--codexnumeris-051225.netlify.app` | Origin Netlify de la production (branche `main`) | ↻ **Redirigé en 301 vers `app.codexnumeris.org` depuis le 1er septembre 2026** (`netlify.toml`). ⚠️ **MESURÉ le 1er septembre 2026, le doute est levé** : cette URL ne passait PAS par le proxy Cloudflare — `curl` rendait **200**, avec le même `etag` que la production. Elle contournait donc Access et ne laissait aucune identité |
| `deploy-preview-<N>--codexnumeris-051225.netlify.app` | **Aperçu automatique de la pull request n° N** | Accessible dès que la PR est ouverte, ~30 s après le push |
| `github.com/bedardg71-codexnumeris/Monitorage_v6` | Code source | **Privé** |

⚠️ **Le site Netlify s'appelle `codexnumeris-051225`, pas `labocodex`.** Les
versions 1.0 à 1.4 de ce document annonçaient `labocodex.netlify.app` : ce nom
ne correspond à rien dans le compte. Vérifié le 23 août 2026 par l'API Netlify
(`site_id f06b34ab-3511-4bf5-9beb-4736cc56ca8c`). C'est le nom à chercher dans
le tableau de bord, notamment pour un rollback (§5.2) ou une reprise (§6.3).

💡 **Les aperçus de PR sont actifs.** Toute pull request vers `main` reçoit une
URL complète et isolée, sans toucher à la production. C'est le moyen d'éprouver
un chantier sur iPad avant de fusionner. ⚠ C'est une **origine différente**
d'`app.codexnumeris.org` : le stockage du navigateur n'y est pas partagé, l'app
y démarre donc vide.
⚠️ **Les aperçus de PR ne sont VOLONTAIREMENT pas redirigés**, contrairement aux
deux sous-domaines Netlify ci-dessus. Ce sont donc les seules portes `*.netlify.app`
encore ouvertes — le prix assumé pour pouvoir éprouver un chantier sur iPad avant
de fusionner. Elles n'existent que le temps d'une PR ouverte.

✅ **Les déploiements de branche sont DÉSACTIVÉS — mesuré le 1er septembre 2026.**
La question valait d'être posée : si chaque branche poussée recevait son
`<branche>--codexnumeris-051225.netlify.app`, les deux redirections fermeraient deux
hôtes NOMMÉS sans fermer la CLASSE — et `from` n'accepte pas de joker sur l'hôte, ce
qui se réglerait dans le tableau de bord, pas ici. **Elle ne se pose pas** :

| Hôte interrogé | Code |
|---|---|
| `claude-relais-md-continuation-b7i2jq--…` (branche réelle) | 404 |
| `branche-qui-n-existe-pas-temoin--…` (témoin inventé) | 404 |
| `main--…` (branche de production) | **200** |

Une branche réelle rend le même 404 qu'une branche inventée : aucun déploiement de
branche n'existe. Le 200 de `main--…` est le **témoin positif** — il prouve que la
forme d'URL atteint bien le routeur de Netlify, et que le 404 signifie « pas de
déploiement » plutôt qu'une mesure cassée. `main--…` n'était joignable que parce que
`main` est la branche de production.
⚠ **À revérifier si les déploiements de branche sont activés un jour** : la commande
est `curl -sI -m 12 -o /dev/null -w "%{http_code}" https://<branche>--codexnumeris-051225.netlify.app/`,
avec un nom de branche inventé comme témoin.

⚠️ **Le 301 est PERMANENT, et les navigateurs le retiennent durablement** — Safari en
particulier. Rouvrir un jour l'une de ces deux adresses coûtera plus cher que de
retirer la règle de `netlify.toml` : les navigateurs qui l'ont apprise continueront de
rediriger d'eux-mêmes, sans redemander au serveur. C'est assumé (l'intention est bien
que ces portes restent fermées), mais ça se sait d'avance plutôt qu'après coup.

⚠️ L'ancien sous-domaine `labo.codexnumeris.org` (référencé dans la
version 1.0 de ce document) n'a plus d'enregistrement DNS et n'est
plus utilisé. Toute mention résiduelle dans la documentation est
obsolète.

### 1.3 Principe directeur

Le déploiement est **entièrement automatisé sur push vers `main`**.
Aucune commande à lancer manuellement. Aucun build local requis (l'application
est servie telle quelle, pas de transpilation/bundling).

### 1.4 Cadre de protection des renseignements personnels

Les versions 1.0 et 1.1 de ce document, comme l'ADR-008 et `PRIVACY.md`,
présentaient la liste blanche Cloudflare Access comme une «base de
consentement explicite Loi 25». Cette qualification était disproportionnée
et la v1.2 la retire. Cadrage réel :

Labo Codex est un projet d'expérimentation pédagogique conduit par son
auteur à titre personnel, sans activité économique organisée au sens
de l'article 1525 du Code civil du Québec. *Inférence à confirmer par
un juriste en cas de doute* : dans cette configuration, la *Loi sur la
protection des renseignements personnels dans le secteur privé*
(modifiée par la Loi 25) ne s'applique vraisemblablement pas – son
article premier délimite l'objet de la loi aux renseignements personnels
traités «à l'occasion de l'exploitation d'une entreprise au sens de
l'article 1525 du Code civil». Hors d'une telle exploitation, la loi ne
trouve pas application — ce n'est pas une exclusion à invoquer, c'est un
champ d'application qui n'est pas atteint.

*Corrigé le 14 septembre 2026 : ce passage invoquait un «article premier,
deuxième alinéa» excluant les renseignements collectés «à des fins
exclusivement personnelles, domestiques ou artistiques». Cette formulation
est celle du RGPD européen, non de P-39.1 : l'article 1 de la loi
québécoise ne porte aucune exclusion de ce type, et son deuxième alinéa
traite du support des renseignements. La conclusion est inchangée ; son
fondement est corrigé. Voir `PRIVACY.md` v1.3, même correction.*

**Renseignements personnels effectivement traités par l'infrastructure** :

- **Niveau application** : aucun. L'app est 100 % hors-ligne (ADR-003).
  Les données pédagogiques (noms d'étudiants, évaluations, productions)
  restent sur la machine de chaque utilisateur. Aucun flux serveur.
- **Niveau infrastructure** : quand Cloudflare Access est actif, les
  adresses courriel des personnes qui s'identifient transitent par Cloudflare
  pour l'authentification OTP. Les journaux d'accès sont retenus 24 h sur le
  plan gratuit ; **les adresses elles-mêmes, elles, sont conservées sans limite**
  dans `My Team → Users` et exportées périodiquement (§4.4, et `PRIVACY.md` §3.3).

**Discipline maintenue** : retrait sur demande (§4.3), non-diffusion des
courriels, et export périodique consigné plutôt que consultation au fil de l'eau
(§4.4). *Révisé le 27 août 2026 : il n'y a plus de liste blanche à tenir.* Cette discipline relève de l'hygiène
professionnelle et de la courtoisie envers les testeurs, pas d'une
obligation légale.

**Quand cette posture devra être revue** : si Labo Codex est porté un
jour par une organisation (cégep, OBNL, entreprise), s'il acquiert une
base d'utilisateurs hors cercle personnel/collégial, ou si l'architecture
évolue pour traiter des données pédagogiques côté serveur (par exemple
une Voûte avec contenus identifiants), il faudra reprendre l'analyse
à zéro et probablement enclencher un dispositif de conformité Loi 25
complet (registre, EFVP, politique de confidentialité formelle,
désignation d'un responsable).

**Documents à aligner sur ce cadrage** : ADR-008 (sections «Conséquences»
et «Notes de révision 28 mai 2026»), `PRIVACY.md` (entière révision
au BACKLOG `#298`, à reformuler – pas «mettre à jour la posture Loi 25
après retrait Access» mais «clarifier que le cadre Loi 25 a été
surinvoqué et préciser le régime réel»).

---

## 2. Procédure de déploiement (push vers main)

### 2.1 Cycle normal

1. **Travailler** sur une branche dédiée (ex : `cat-b/track-X`, `aqpc/privacy`).
2. **Tester localement** — ⚠ **depuis `tests/`, jamais de la racine** :
   ```bash
   cd tests && npm test
   ```
   L'ordre de grandeur au 23 août 2026 : ~2 970 tests Vitest et ~110 specs
   Playwright. *Le compte exact n'est pas figé ici : il change à chaque
   chantier, et un chiffre périmé dans une consigne se fait ignorer.*
3. **Bumper la version** :
   ```bash
   node scripts/release.mjs patch|minor|major
   ```
   Le script écrit les **quatre points de vérité** d'un coup (`version.json`,
   les deux fallbacks de `js/init-inline.js`, le snapshot de `js/main.js`) et
   bump le `?v=` anti-cache des fichiers modifiés dans `index.html`.
   *Ne plus éditer ces fichiers à la main : c'est ce qui les désynchronisait.*

   ⚠ **INCIDENT DU 23 AOÛT 2026, À CONNAÎTRE.** Le script ne bumpait le `?v=`
   que des fichiers vus par `git status`, donc **non commités**. Un chantier
   commité AVANT la release passait au travers : seuls `init-inline.js` et
   `main.js` étaient bumpés — c'est-à-dire exactement les deux fichiers qui
   AFFICHENT le numéro de version. Résultat mesuré sur l'iPad : « 1.92.0 ·
   build 0823-1013 » en bas de page, et l'ANCIEN code à l'écran. Corrigé le
   jour même — `fichiersModifies` compare désormais aussi à la release
   précédente — et verrouillé par
   `tests/unit/sentinelle-anticache-fichiers-modifies.test.js`.
4. **Commit** :
   ```bash
   git commit -m "feat(<scope>): <description>"
   ```
5. **Push + merge sur `main`** — par `scripts/pousser.sh`, jamais `git push` nu :
   ```bash
   scripts/pousser.sh                  # branche courante vers origin
   scripts/pousser.sh origin main      # arguments passés tels quels à git push
   ```

   ⚠ **INCIDENT DU 26 AOÛT 2026, À CONNAÎTRE (#533).** Trois pushs de suite ont
   échoué alors que rien n'était cassé :

   ```
   Connection to github.com closed by remote host.
   Transferred: sent 3620, received 19832 bytes, in 360.5 seconds
   ✓ Sentinelle Playwright : aucune rougeur nouvelle (1 échec connu, inchangé).
   ```

   Ces trois lignes, lues dans l'ordre, sont tout le défaut. `git push` ouvre la
   connexion vers GitHub **avant** d'exécuter le hook pré-push ; le hook lançait
   WebKit lui-même — six minutes — pendant lesquelles la session ne transmet
   rien, et GitHub la ferme. Le verdict tombait après : juste, vert, et sans
   personne à qui le dire. **Le danger n'est pas l'échec, c'est ce qu'il
   enseigne** — un push qui échoue alors que tout est vert apprend à taper
   `--no-verify` par réflexe, et ce réflexe emporte aussi Vitest et la baseline
   #456.

   Depuis, l'ordre est renversé : `scripts/pousser.sh` lance la sentinelle
   Playwright **avant** d'ouvrir la connexion et dépose un verdict rattaché au
   SHA ; le hook ne fait plus que le lire, en une fraction de seconde. Chaque
   suite ne tourne qu'une fois — Playwright dans le script, Vitest dans le hook.
   Un `git push` nu sur un lot qui touche `js/`, `index.html`, `styles.css` ou
   `tests/integration/` **passe en avertissant** quand aucun verdict local ne
   couvre le commit — la CI lance de toute façon Vitest et Playwright WebKit à
   chaque push. Seul un verdict **rouge** bloque.

   ⚠ **CORRIGÉ LE JOUR MÊME, ET LA LEÇON VAUT PLUS QUE LE RÉGLAGE.** La première
   version REFUSAIT en l'absence de verdict. Elle a bloqué un push lancé depuis
   **GitHub Desktop**, en donnant pour seule issue une commande de terminal :
   un refus dont la solution est hors de portée de l'outil où il se produit.
   C'est mot pour mot le « hook inapplicable » contre lequel `pre-push` met en
   garde depuis août — le correctif s'était mis à le devenir. Le message donne
   désormais la commande **complète** (`cd <racine> && scripts/pousser.sh`),
   copiable telle quelle. Verrouillé par
   `tests/unit/sentinelle-533-verdict-avant-connexion.test.js`.
6. **Netlify déclenche le build automatiquement** (webhook GitHub → Netlify).
7. Le déploiement est en ligne en **~30-60 secondes** sur `app.codexnumeris.org`.

### 2.2 Vérification post-déploiement

1. Ouvrir `app.codexnumeris.org` dans un onglet **privé** (pour forcer un
   nouveau login Cloudflare Access).
2. Vérifier dans l'en-tête de l'application :
   - Numéro de Beta affiché correspond à `version.json`.
   - Build ID (`MMJJ-HHMM`) correspond.
3. Si Safari iPad : Cmd+Q insuffisant pour purger le cache → tester sur
   un appareil propre ou utiliser le mode privé.

### 2.3 Configuration Netlify (référence)

Le fichier [`netlify.toml`](netlify.toml) versionné définit :
- `[build]` — paramètres de build (publish = racine du repo, pas de commande)
- `[[headers]]` — règles de cache et de sécurité (consolide l'ancien `_headers`)

Toute modification de cette configuration **doit passer par un commit**
sur `main` — pas de configuration ad hoc dans le dashboard Netlify.

### 2.4 État de l'intégration continue (23 août 2026)

⚠ **La CI GitHub Actions ne démarre plus depuis le 21 août, 16 h 21 UTC.** Le
job « échoue » en 3-5 secondes sans qu'aucun runner ne lui soit assigné
(`runner_id: 0` dans l'API) : il n'est jamais dispatché. Le workflow est
pourtant `active` et aucun commit n'a touché `.github/workflows/tests.yml` dans
la fenêtre. La signature est celle de minutes Actions indisponibles sur un
dépôt privé — **à vérifier dans Settings › Billing › Actions**. Rien dans le
dépôt ne peut rétablir des minutes épuisées.

⚠ **Et avant de s'arrêter, elle était déjà rouge.** Dernier run complet
(18 août) : Vitest vert de bout en bout, puis Playwright **88 passés,
5 échoués** en 12,5 minutes — cinq specs de glisser-déposer et de mise en page
du planificateur. Rétablir les minutes ne rendra donc pas la CI verte.

**Ce qui a été fait le 23 août pour cesser de gaspiller** : le workflow ignore
désormais les commits purement documentaires (`paths-ignore`, liste verrouillée
par `tests/unit/sentinelle-ci-paths-ignore.test.js`) et met en cache le binaire
WebKit. Sur les 87 runs précédents, **61 avaient été annulés et aucun n'avait
réussi** — le `cancel-in-progress` fauchant les runs plus vite qu'ils ne
finissaient.

---

## 3. Configuration Cloudflare Access (réactivation au 1er septembre 2026 — policy ouverte)

> **Statut au 27 août 2026** : réactivation décidée pour le **1er septembre 2026**,
> avec une **policy ouverte** (`Include → Everyone`), OTP par courriel et une
> **durée de session d'un mois**. Le motif n'est pas de filtrer l'entrée mais
> d'identifier les utilisateurs, via la page `My Team → Users` et son export CSV.
> Gestes et vérifications : `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`.
> Décision et corrections : ADR-008, révision du 27 août 2026.
>
> ⚠️ Le §4 ci-dessous décrit la gestion d'une **liste blanche**. Avec une policy
> ouverte, ses procédures 4.1 et 4.2 sont **sans objet** ; 4.3 et 4.4 restent
> valables sous la forme révisée.
>
> ---
>
> **Statut au 2 juin 2026 (périmé, conservé pour la chronologie)** : Cloudflare Access est **désactivé sur
> `app.codexnumeris.org` sans date de réactivation planifiée**.
> L'application est publiquement accessible sans authentification.
> Les procédures de gestion d'accès documentées dans cette section et
> dans §4 ne s'appliquent à aucune opération actuelle ; elles sont
> conservées comme référence technique pour une éventuelle
> réactivation future (cf. §3.6 et ADR-008).
>
> **Chronologie de la décision** :
>
> - **28 mai 2026** : décision initiale d'une fenêtre d'ouverture
>   publique cadrée du 3 juin au 30 juin 2026, suivie d'un refermage
>   planifié au 1er juillet avec liste blanche reconstituée (cf.
>   DEPLOY.md v1.3 et ADR-008 révision du 28 mai 2026 PM).
> - **2 juin 2026** : décision révisée après examen des justifications
>   restantes du refermage. Le scénario «refermage 1er juillet» est
>   abandonné au profit d'une ouverture publique par défaut. Motifs
>   détaillés ci-dessous.
>
> **Motifs du retrait du refermage** (décision du 2 juin 2026) :
> Une fois retirées les justifications qui ne tiennent plus l'examen,
> il ne reste pratiquement rien pour fonder un refermage actif :
>
> - **Loi 25** : ne s'applique vraisemblablement pas à la configuration
>   actuelle (cf. §1.4 et ADR-008 PM). Plus pertinente comme contrainte.
> - **Anti-scraping / anti-DDoS** : la protection de base de Cloudflare
>   fonctionne indépendamment d'Access. Les assets statiques de l'app
>   n'ont rien de sensible à voler (code public sur GitHub).
> - **Traçabilité des accès** : la phase alpha janvier-mai 2026 a
>   démontré que les logs Cloudflare ne produisent rien d'actionnable
>   (purgés à 24 h sur plan gratuit ; aucun retour utilisateur n'est
>   passé par cette voie). Les vrais canaux d'engagement passent par
>   la CoP et `labo@codexnumeris.org`.
> - **Voûte future** : aura son propre contrôle d'accès applicatif
>   quand elle existera. Maintenir Access actif sur l'app principale
>   ne sert pas la Voûte.
> - **Quota 50 sièges gratuits** : c'est une conséquence opérationnelle
>   du choix de maintenir Access, pas une raison de le maintenir.
>
> **Pression du calendrier académique** : refermer le 1er juillet
> couperait l'accès précisément pendant la fenêtre d'appropriation et
> de préparation des cours d'automne (mi-juillet à mi-août). Or l'ADR-008
> situe l'AQPC du 3 juin comme «la première vraie amorce d'une vague
> significative d'expérimentateurs accompagnés, en vue d'une phase
> structurée à l'automne 2026». Un refermage à J+27 contredit cette
> finalité.
>
> **Conséquences acceptées de l'ouverture publique par défaut** :
>
> - Pas de logs d'accès individuels par identité courriel — sans impact
>   matériel jusqu'ici, et sans portée Loi 25 (cf. §1.4).
> - L'app reste 100 % hors-ligne par conception (ADR-003) : aucune
>   donnée pédagogique ne transite par les serveurs Netlify / Cloudflare.
> - Surface d'attaque résiduelle limitée à : scraping des assets
>   statiques publics (faible enjeu), DoS absorbable par le CDN
>   Cloudflare, et exposition d'image (captures d'écran publiables
>   par n'importe qui).
> - La CoP devient le seul vecteur d'engagement et de recrutement —
>   ce qui correspond à son rôle conçu, plutôt que de partager cette
>   fonction avec une liste blanche Cloudflare.
>
> **Note sur le cadre Loi 25** : la v1.1 de ce document (et l'ADR-008 du
> 28 mai) inscrivaient parmi les conséquences la perte d'une «base de
> consentement explicite Loi 25 par liste blanche». La v1.2 retire cette
> formulation après consultation – elle surinvoquait un cadre légal qui,
> sur le fond, ne semble pas s'appliquer à la configuration actuelle
> (cf. §1.4). Le BACKLOG `#298` reste ouvert mais doit être reformulé.
>
> **Note sur l'usage hors-ligne** : l'application reste téléchargeable
> depuis GitHub et utilisable en local (`file://`) en tout temps,
> indépendamment du statut de l'accès web hébergé. C'est une propriété
> structurelle de l'app, pas un mécanisme conditionnel.
>
> **Précédent alpha de janvier 2026** : une première phase d'invitations
> alpha (Beta 95) reposait sur une logique de liste blanche élargie.
> Elle n'a pas généré d'engagement, mais deux paramètres clés étaient
> défavorables : application en phase alpha plutôt que beta (pas assez
> stable pour un usage soutenu) et début de trimestre (bande passante
> mentale des enseignants saturée). Le contexte de juin 2026 est
> différent (beta publique stable, fin de session, dispositif CoP en
> place) – le précédent n'invalide donc pas le modèle, et n'invalide
> pas non plus l'ouverture publique sans contrôle.
>
> **Réversibilité** : la procédure technique documentée ci-dessous
> (§3.1 à §3.5) et la procédure de gestion (§4) restent valides pour
> remettre Cloudflare Access en place en quelques minutes si une
> raison concrète apparaît un jour (cf. §3.6 pour les conditions qui
> pourraient déclencher cette décision). Pas d'anticipation, pas de
> calendrier prévu.
>
> Cf. ADR-008 (révisé le 2 juin 2026).

### 3.1 Tableau de bord

URL : **`https://one.dash.cloudflare.com`** (le tableau Zero Trust, distinct
du tableau DNS classique `dash.cloudflare.com`).

Organisation (nom de l'équipe Zero Trust) : **`labo-codex`** — relevé le 31 août 2026 dans le tableau de bord. Offre : **Zero Trust Free**.

### 3.2 Application Access protégée

`Access → Applications → [nom de l'app Labo Codex]`

| Paramètre | Valeur actuelle | Référence |
|---|---|---|
| **Application name** | **`Labo Codex`** — renommée le 31 août 2026 (elle s'appelait `Codex Numeris beta`, du nom du blog et non du projet). Type : auto-hébergée | Nom affiché à l'authentification, donc lu par l'utilisateur avant de saisir son adresse |
| **Type** | Self-hosted | Type d'application Cloudflare Access |
| **Application domain** | `app.codexnumeris.org` | Domaine protégé |
| **Session duration** (application) | **1 semaine** (confirmé 22 mai 2026) | Durée de cookie de session au niveau de l'application. ⚠️ **Cette valeur ne fait pas foi** : voir la durée de la policy ci-dessous |
| **App launcher visible** | Activé / Désactivé *[à confirmer]* | Visible dans le launcher Cloudflare |
| **Authentication** | **One-time PIN (OTP) par courriel** — vérifié le 31 août 2026 : c'est l'unique fournisseur d'identité de l'espace Zero Trust | Méthode d'auth, seule méthode active. Cloudflare précise qu'à défaut de fournisseur configuré, l'OTP est de toute façon la méthode par défaut |

**Identités enregistrées au 20 mai 2026** : **51** (auteur compris), dont **4 sièges
Access actifs**, selon l'export `User_Seats_Log_2026-05-20T20_03_38Z.csv`. *Corrigé le
27 août 2026 : la rédaction antérieure parlait de 51 « utilisateurs autorisés » à qui un
accès aurait été « accordé » individuellement. La liste blanche avait été abandonnée en
cours d'hiver ; ces identités se sont enregistrées d'elles-mêmes par une porte ouverte.*

### 3.3 Policies (règles d'accès)

`Access → Applications → [app] → Policies → [nom de la policy]`

| Paramètre | Valeur |
|---|---|
| **Policy name** | **`Test Labo Codex`** — unique stratégie de l'unique application, créée le 6 décembre 2025, id `b9db35f4-b080-4d5a-922f-cb6175025bb2`. ⚠️ Le nom dit « Test » et une renomination en « CoP Labo Codex » a été envisagée le 31 août puis écartée par Grégoire. À ne pas lire comme un accès restreint : la règle est `Everyone` |
| **Action** | **Allow** depuis le 31 août 2026. ⚠️ *Découvert ce jour-là : la policy n'avait jamais été « désactivée » comme l'affirmait ce document et l'ADR-008 — son action était **`Bypass` (Contourner)** avec `Include → Everyone`. C'est ce qui rendait l'application ouverte depuis juin : Access était en place et laissait tout passer. Le geste de réactivation n'a donc pas été de rallumer une policy éteinte, mais de faire passer son action de `Bypass` à `Allow`.* |
| **Include rule** | **`Everyone`** (au 1er septembre 2026). *Corrigé le 27 août 2026 : cette ligne indiquait une liste blanche d'`Emails`, ce qui décrivait l'état de janvier 2026 seulement.* |

⚠️ **La durée de session qui fait foi est celle de la POLICY, pas celle de l'application.**
Le tableau de bord l'écrit noir sur blanc sous le champ : « Cette durée de session remplacera
les durées de session de l'application et globales ». Elle était à **6 hours** au 31 août 2026 ;
la valeur visée est **1 month**, **appliquée le 31 août 2026 à 08 h 36**. *Corrigé le 31 août 2026 : ce document et la fiche opératoire
désignaient tous deux la durée de l'application (§3.2), qui est le mauvais réglage. Régler
l'application sans régler la policy laisserait les utilisateurs se réauthentifier toutes les six
heures, alors que le bandeau, la page d'accueil, `PRIVACY.md` et le courriel CoP annoncent un mois.*

**Aucune liste blanche.** La règle `Include` est `Everyone` : toute adresse capable de
recevoir le code OTP entre. Les identités enregistrées se consultent dans
`My Team → Users` et **ne sont pas publiées** dans ce document (voir
[`PRIVACY.md`](PRIVACY.md) §3.3 et §6.2).

### 3.4 DNS Cloudflare

`DNS → Records` (tableau de bord Cloudflare classique, pas Zero Trust)

⚠️ **CETTE TABLE EST HISTORIQUE — elle décrit l'état d'avant le 28 mai 2026,
et DEUX de ses trois colonnes sont périmées.**

| Type | Nom | Cible | Proxy |
|---|---|---|---|
| `CNAME` | ~~`labo`~~ | ~~`labocodex.netlify.app`~~ | **Orange (proxy activé)** |

- Le sous-domaine était **`labo`** ; c'est **`app`** depuis le 28 mai (§1.2), et
  `labo.codexnumeris.org` n'a plus d'enregistrement.
- La cible annoncée, **`labocodex.netlify.app`, n'a jamais correspondu au site
  réel** : il s'appelle `codexnumeris-051225` (vérifié le 23 août par l'API
  Netlify). Une reprise DNS qui recopierait cette ligne telle quelle pointerait
  dans le vide.

⮕ **L'état courant à reconstituer en cas de reprise (§6.3)** : un enregistrement
pour `app` visant l'origin Netlify du site `codexnumeris-051225`. Relever la
valeur exacte dans le tableau de bord Netlify (`Domain management`) plutôt que
de la recopier d'ici — c'est ce document qui a menti, pas le tableau de bord.

⚠️ Le proxy orange était **obligatoire** pour que Cloudflare Access intercepte
les requêtes. Si le proxy est gris (DNS only), Cloudflare Access est
contourné et l'app est accessible sans authentification. *Ce point redevient
opérant le 1er septembre 2026 (§3.6) : vérifier que le proxy est bien orange
avant de considérer la policy comme active.*

### 3.4 bis Mode « Under Attack » — désactivé le 19 septembre 2026

**Constat (lu au tableau de bord le 19 sept. 2026, Cowork, à la demande de Grégoire).**
Le mode *I'm Under Attack* était actif sur toute la zone `codexnumeris.org`.
Selon Cloudflare, ce réglage avait été modifié pour la dernière fois « il y a
un an » : il a donc couru pendant toute la période des testeurs. Rien dans le
dépôt ne documentait son activation.

**Effet mesuré** (`Sécurité → Analytics → Événements`, 7 jours, règle `iuam`,
service « Niveau de sécurité », action *Managed Challenge*) :
- 607 refus (403) sur la page d'accueil `/` en 7 jours, contre 80 ouvertures
  réussies ;
- l'adresse la plus touchée appartient au réseau d'un établissement
  d'enseignement, avec un Safari 16.6 : requêtes en boucle sur l'heure du midi
  les 17 et 18 septembre, émises depuis l'app elle-même (référent
  `app.codexnumeris.org`) ; une adresse résidentielle porte le même navigateur ;
- la connexion de Grégoire était elle-même défiée toutes les 5 minutes.

**Inférence, non vérifiée** : une personne de cet établissement essayait d'utiliser
l'app et butait sur le défi, qu'un Safari ancien ne passe pas.

**Geste** : mode désactivé le 19 sept. 2026 vers 16 h 40 (`Vue d'ensemble` de la
zone → `Actions rapides` → `Mode Under Attack`), avec l'accord de Grégoire.
Motif : aucune attaque visible, et Access protège déjà l'entrée.

**À vérifier** : relire les événements de sécurité après la prochaine journée
de semaine. Attendu : plus d'événements `iuam` ; les 403 sur `/` doivent
tomber près de zéro.

⚠ **Ne pas le réactiver par réflexe.** Ce mode sert pendant une attaque DDoS
réelle, pour quelques heures. Laissé actif, il bloque des utilisateurs
légitimes sans laisser de trace ailleurs que dans ces événements.

### 3.4 ter Netlify — Web Analytics et Real User Monitoring retirés le 21 septembre 2026

**Constat (lu au tableau de bord Netlify le 21 sept. 2026, Cowork, à la demande de Grégoire).**
- **Web Analytics** : abonnement payant actif. Ses chiffres étaient faussés par le proxy Cloudflare placé devant le site : Netlify voyait surtout les adresses de Cloudflare (« 566 visiteurs uniques » sur 30 jours, majorité « United States », alors que Cloudflare mesurait un trafic presque entièrement canadien). Il ne voit ni les identités d'Access ni les refus. Doublon moins fiable des statistiques de Cloudflare.
- **Real User Monitoring** : activé, script `/.netlify/scripts/rum` injecté dans chaque page, **aucune donnée collectée en 30 jours**. Hypothèse non vérifiée : la CSP de l'app bloque l'envoi des mesures.

**Geste** : les deux désactivés par Grégoire le 21 sept. 2026 (`Analytics & metrics` du projet `codexnumeris-051225`), vérifié ensuite par Cowork (les deux pages proposent de nouveau « Enable »). L'abonnement cesse d'être facturé à la période suivante.
Motif : doublon payant pour l'un ; pour l'autre, un script qui tente d'envoyer des données depuis le navigateur des utilisateurs n'a pas sa place dans une app qui promet que rien ne sort de l'appareil.

⚠ **Ne pas les réactiver par réflexe.** Le suivi de fréquentation passe par Cloudflare (tableau de bord du domaine), selon le protocole de suivi hebdomadaire, conservé HORS du dépôt.

### 3.5 Vérification

Test rapide depuis un terminal :
```bash
curl -I https://app.codexnumeris.org
# Attendu jusqu'au 31 août 2026 (Access désactivé) : HTTP/2 200 (accès direct).
# Attendu à partir du 1er septembre 2026 : HTTP/2 302 (redirection vers le login Access).
# Un 200 après la réactivation signifie que la policy n'est pas active.
```

### 3.6 Réactivation — décidée pour le 1er septembre 2026

**Décision du 27 août 2026** (ADR-008, révision du même jour). La configuration
n'a jamais été défaite : le DNS reste en proxy orange, seule la policy est
désactivée. La réactivation est une opération de quelques minutes.

**Motif** : identifier les utilisateurs, pas les filtrer. Le projet n'a aucun
autre moyen de savoir qui se sert de l'application, puisqu'elle est locale et
hors ligne (ADR-003). La porte reste donc ouverte à tous.

**Les quatre conditions listées ci-dessous** (risque opérationnel, création de la
Voûte, bascule institutionnelle, croissance qualitative inattendue) n'ont pas été
retenues et **aucune n'est survenue**. La réactivation
procède d'un cinquième motif, énoncé plutôt que rangé de force dans les quatre
autres. Ces conditions restent valides pour d'éventuelles décisions ultérieures.

**Gestes, vérifications et consignation** :
`plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`.

Conditions envisagées au fil du dossier. **Les quatre premières n'ont joué aucun
rôle dans la décision du 1er septembre 2026** et restent valides pour des
décisions ultérieures ; la cinquième est le motif de cette décision :

1. **Émergence d'un risque opérationnel concret** : abus mesurable
   (DoS persistant non absorbé par Cloudflare, scraping intensif
   identifié, dérive d'usage). Aucun de ces signaux n'est anticipé,
   mais ils restent les seuls motifs matériels.
2. **Création de la Voûte** (cf. §Contexte de ADR-008) : la Voûte
   imposera son propre contrôle d'accès applicatif ; selon
   l'architecture retenue, il pourrait être commode de réactiver
   Access sur l'app principale comme première barrière. Décision
   à prendre au moment d'implémenter la Voûte, pas avant.
3. **Bascule institutionnelle** : si Labo Codex est porté un jour par
   une organisation (cégep, OBNL, entreprise), la posture devra être
   reprise à zéro, et un contrôle d'accès formel deviendra
   vraisemblablement requis (cf. §1.4).
4. **Croissance qualitative inattendue** qui rendrait utile une
   traçabilité dont l'absence ne pose actuellement aucun problème.
5. **Savoir qui utilise l'application** (ajouté le 26 août 2026, **reformulé le
   27 août**). Ni incident, ni contrainte externe. *Correction du 27 août : ce
   point était rédigé « contrôle d'accès voulu par le porteur du projet », en
   préférence de gouvernance. Ce n'est pas le motif de Grégoire, qui a dit
   explicitement ne pas chercher à filtrer l'entrée. Le motif est
   d'**identifier** les utilisateurs pour pouvoir les joindre — d'où une policy
   ouverte et non une liste blanche.* C'est le motif de la réactivation du
   **1er septembre 2026** ; voir ADR-008, révision du 27 août, et la fiche
   opératoire `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`.

⚠ **Ce que l'identification ne donne pas.** Elle enregistre qui franchit la
porte, jamais ce qui se passe ensuite : l'application est locale et hors ligne,
et l'usage réel n'est observable par personne. *Correction du 27 août 2026 : ce
paragraphe concluait « refermer pour mesurer l'usage serait se tromper d'outil ;
refermer pour filtrer l'entrée est légitime, et c'est ce qui est décidé ». Les
deux moitiés sont fausses. La confusion portait sur l'objet à consulter — les
journaux purgés à 24 h, et non la page `My Team → Users`, qui est persistante et
exportable (§4.4). Et rien n'est filtré : la porte est ouverte.* Ce qui reste
vrai, et qui est assumé : une adresse dans la liste dit « cette personne est
entrée », pas « cette personne s'en sert ».

Procédure de réactivation : suivre §3.1 à §3.5 (configuration Access) et §4.4
(export périodique des identités). §4.1 et §4.2 sont sans objet, faute de liste
blanche. À documenter au moment de la réactivation : date effective, motif,
durée de session relevée avant modification, règle `Include` trouvée dans la
policy dormante, et surveillance du quota gratuit de 50 sièges.

---

## 4. Gestion des utilisateurs autorisés (référence technique pour un usage futur)

> **Révisé le 27 août 2026.** Avec une policy ouverte (`Include → Everyone`), il
> n'y a plus de liste blanche à tenir : **§4.1 et §4.2 sont sans objet** et sont
> conservées comme référence technique au cas où une liste redeviendrait
> nécessaire. **§4.3 (demande de retrait) et §4.4 (suivi périodique) restent en
> vigueur** et prennent même plus d'importance, puisque les identités
> s'accumulent désormais sans intervention.

### 4.1 Ajouter une personne à la liste blanche

1. Aller dans `Access → Applications → [app] → Policies → [policy]`
2. Ouvrir la règle `Include` → `Emails`
3. Ajouter le courriel **après vérification** (s'assurer qu'il s'agit
   bien d'une personne invitée à participer)
4. Sauvegarder
5. Envoyer un courriel d'invitation à la personne en lui expliquant :
   - L'URL : `app.codexnumeris.org`
   - Le mécanisme : code OTP envoyé sur son courriel à chaque session
   - Le fait que ses données pédagogiques restent locales sur sa machine
   - Le lien vers `PRIVACY.md` (politique de confidentialité)

⚠️ **Quota plan gratuit** : 50 utilisateurs maximum. *Corrigé le 27 août 2026 :
ce paragraphe affirmait la liste « saturée au 22 mai 2026 ». Elle ne l'a jamais
été — 51 identités enregistrées, mais 4 sièges Access actifs.* Avec une porte
ouverte, le nombre d'identités n'est plus borné par une liste : c'est le point à
surveiller au premier export (§4.4). Si le plafond approche, évaluer les options
(upgrade payant, politique de domaine, sélection).

### 4.2 Retirer une personne de la liste blanche

1. Aller dans `Access → Applications → [app] → Policies → [policy]`
2. Ouvrir la règle `Include` → `Emails`
3. Retirer le courriel
4. Sauvegarder
5. **Avertir la personne** par courriel que son accès est retiré et
   pourquoi (fin de phase, demande de retrait Loi 25, etc.)

### 4.3 Demande de retrait par l'utilisateur

Toute personne dont l'adresse figure dans `My Team → Users` peut demander son retrait à
[labo@codexnumeris.org](mailto:labo@codexnumeris.org). Le retrait est
exécuté **dans les quelques jours ouvrables qui suivent la demande**.
Geste de courtoisie professionnelle, pas une obligation Loi 25 (cf.
§1.4 pour le cadrage). La référence à `PRIVACY.md` §9 sera mise à jour
quand ce document sera révisé (BACKLOG `#298` reformulé).

### 4.4 Export périodique des identités

**Révisé le 27 août 2026** : ce n'est plus un audit de liste blanche, c'est le
geste qui sert le motif de la réactivation.

⚠️ **Deux objets à ne pas confondre.** Les journaux d'authentification
(`Logs → Access`) sont purgés à 24 h sur le plan gratuit et n'apprennent rien.
C'est la page **`My Team → Users`** qu'il faut consulter : elle est persistante et
donne, par adresse, la date de création, la **dernière connexion réussie** et
l'état du siège.

Une fois par mois :

1. Exporter la liste en CSV depuis `My Team → Users`.
2. Déposer l'export daté dans `Cowork A26 CoP Labo Codex/`.
3. Comparer avec l'export précédent : les adresses neuves sont les nouveaux venus,
   les dates de dernière connexion distinguent les actifs des passants.
4. Surveiller le total au regard du plafond de 50 sièges.
5. Consigner dans `INCIDENTS.md` toute décision de retrait notable.

**Précédent** : `Cowork H26 App Labo Codex/Essais sur Cloudflare/User_Seats_Log_2026-05-20T20_03_38Z.csv`
(20 mai 2026, 51 identités).

⚠️ **Ce que l'export ne dit pas** : qui utilise réellement l'application. Il dit
qui a franchi la porte. L'application est locale et hors ligne ; l'usage n'est
observable par personne, et le rendre observable contredirait la posture du
projet.

---

## 5. Rollback (revenir à une version antérieure)

### 5.1 Pourquoi rollback ?

- Régression bloquante détectée en production (Grégoire ne peut plus
  travailler).
- Bug de données qui menace l'intégrité des Codex existants.
- Faille de sécurité découverte après déploiement.

### 5.2 Rollback via Netlify (le plus rapide — ~10 secondes)

1. Aller sur `app.netlify.com` → site Labo Codex.
2. Onglet `Deploys`.
3. Trouver le **dernier déploiement réussi avant la régression**.
4. Cliquer `...` → `Publish deploy`.
5. Netlify bascule instantanément le trafic vers ce déploiement.

⚠️ **Important** : un rollback Netlify **ne modifie pas le code dans GitHub**.
Le prochain push vers `main` redéployera la version cassée si elle n'est
pas corrigée. **Toujours faire un revert Git après un rollback Netlify**.

### 5.3 Rollback via Git (plus propre, ~5 minutes)

```bash
# Identifier le commit fautif
git log --oneline main -10

# Créer un revert (préserve l'historique — recommandé)
git revert <SHA-du-commit-fautif>

# Pousser le revert sur main
git push origin main

# Netlify redéploiera automatiquement le revert (~30-60 sec)
```

**Ne pas utiliser `git reset --hard` + `git push --force`** sur `main`
(perte d'historique, casse les forks éventuels).

### 5.4 Rollback partiel (cas particulier)

Si le bug ne concerne qu'**un fichier précis** et qu'un revert global
ferait perdre du travail légitime :

```bash
git checkout <SHA-bonne-version> -- chemin/du/fichier.js
git commit -m "fix(<scope>): rollback fichier.js vers <SHA>"
git push origin main
```

---

## 6. Récupération en cas de perte d'accès

### 6.1 Scénarios couverts

| Scénario | Procédure |
|---|---|
| Mot de passe GitHub oublié | Réinitialisation via GitHub → courriel d'auth |
| Compte Netlify inaccessible | Réinitialisation via Netlify → courriel d'auth |
| Compte Cloudflare inaccessible | Réinitialisation via Cloudflare → courriel d'auth |
| Domaine `app.codexnumeris.org` perdu (registrar) | Renouvellement chez le registrar de `codexnumeris.org` |

### 6.2 Sauvegarde de la configuration

Pour permettre la reconstruction en cas d'incident majeur :

| Élément | Sauvegarde |
|---|---|
| Code source | **GitHub `main`** est la source de vérité. Forks possibles. |
| Configuration Netlify | **`netlify.toml`** versionné dans le repo (depuis 22 mai 2026). |
| Configuration Cloudflare Access | **Non versionnable** (pas d'export programmatique sur le plan gratuit). À documenter manuellement dans ce fichier (§3) et à mettre à jour après chaque modification. |
| Liste des identités Cloudflare | **Non versionnée** (donnée personnelle). Maintenue uniquement dans Cloudflare (`My Team → Users`). Si Cloudflare est perdu, elle n'est pas reconstituable — d'où l'intérêt des **exports CSV datés** conservés hors du dépôt (§4.4), qui font office de sauvegarde. |

### 6.3 Procédure de reprise complète (hypothèse pire cas)

Si tout est perdu sauf le dépôt GitHub :

1. **Re-créer un compte Netlify** (gratuit) et y connecter le dépôt.
   `netlify.toml` configure automatiquement le build.
2. **Re-créer une équipe Cloudflare Zero Trust** (gratuit, 50 users).
3. **Reconfigurer le DNS** : le domaine `codexnumeris.org` doit pointer
   ses nameservers vers Cloudflare. Si Cloudflare est aussi perdu,
   re-créer un compte et re-configurer le DNS chez le registrar.
4. **Recréer l'Access Application** dans Zero Trust selon §3.
5. **Ré-inviter les personnes** un à un depuis la liste des courriels
   originaux d'invitation (ou ne pas les ré-inviter si la phase d'accès
   individuel est terminée).

**Estimation de temps de reprise** : 2-4 heures de configuration manuelle.

### 6.4 Cas de continuité (passage de relais à un co-mainteneur)

Si un co-mainteneur est désigné un jour :

1. Donner les accès `Owner` / `Admin` à :
   - GitHub : Settings → Collaborators
   - Netlify : Site settings → Team
   - Cloudflare : Account → Members
2. Communiquer la procédure complète de ce document.
3. Documenter la décision dans `INCIDENTS.md` ou un futur `GOVERNANCE.md`.

Au 22 mai 2026, Labo Codex est en mode **mainteneur unique** (CAF = 1).
Aucun co-mainteneur n'est désigné. Cette limite est assumée et inscrite
dans [`PRIVACY.md`](PRIVACY.md) §12.

---

## 7. Coûts récurrents

| Service | Coût | Échéance |
|---|---|---|
| Domaine `codexnumeris.org` | *[À COMPLÉTER — registrar et coût annuel]* | Annuel |
| GitHub | 0 $ | — |
| Netlify (plan gratuit, ~100 GB bande passante / mois) | 0 $ | — |
| Cloudflare DNS | 0 $ | — |
| Cloudflare Access Zero Trust (plan gratuit, 50 users) | 0 $ | — |

Si le volume des accès individuels dépasse les quotas gratuits :
- **Cloudflare Access** : plan « Pay-as-you-go » à environ $3-7 USD/user/mois.
  Voir [PLAN-AQPC `audit/PLAN-AQPC.md` §5.1](audit/PLAN-AQPC.md) pour les
  options à trancher.
- **Netlify** : passage au plan « Pro » (~$19 USD/mois) si la bande
  passante ou les builds dépassent les quotas gratuits — improbable à
  court terme.

---

## 8. Sécurité du pipeline de déploiement

### 8.1 Surface d'attaque

| Surface | Mitigation |
|---|---|
| Compromission compte GitHub | Activer 2FA — *[À COMPLÉTER : statut]* |
| Compromission compte Netlify | Activer 2FA — *[À COMPLÉTER : statut]* |
| Compromission compte Cloudflare | Activer 2FA — *[À COMPLÉTER : statut]* |
| Token d'API Netlify exposé | Aucun token n'est stocké dans le repo (deploy déclenché par webhook GitHub uniquement) |
| Push malveillant sur `main` | Pas de Branch Protection : inactive depuis la privatisation du 23 juin 2026 (exige GitHub Pro sur dépôt privé). Voir §8.3 et [`.github/BRANCH-PROTECTION.md`](.github/BRANCH-PROTECTION.md) |

### 8.2 Tests de sécurité automatiques

Le hook pré-push lance Vitest + Playwright (97/97 verts requis). Voir
[`docs/securite/TESTS-AUTOMATISES.md`](docs/securite/TESTS-AUTOMATISES.md).

### 8.3 Branch Protection (inactive — exige GitHub Pro)

Configuration de référence ([`.github/BRANCH-PROTECTION.md`](.github/BRANCH-PROTECTION.md),
[`audit/PLAN-MOYEN-TERME.md` §5.3](audit/PLAN-MOYEN-TERME.md)) :
- Force-push interdit sur `main`
- Historique linéaire requis
- Status checks (CI Vitest + Playwright) requis avant merge

Statut : **inactive depuis la privatisation du 23 juin 2026**. Brièvement activée
le 15 juin (#337), elle est retombée au passage en dépôt privé : l'API GitHub renvoie
`403 — Upgrade to GitHub Pro` (la feature exige Pro sur un dépôt privé). À réappliquer
si le dépôt redevient public ou passe à Pro — voir `.github/BRANCH-PROTECTION.md`
(statut « suspendu »). Le check `Analyse CodeQL` a par ailleurs été retiré (`codeql.yml`
supprimé le 26 juin).

---

## 9. Limites assumées

1. **Configuration Cloudflare Access non versionnée** (§6.2) — risque de
   divergence entre la documentation et l'état réel. À auditer après
   chaque modification de la policy ou de l'app Access.
2. **Liste blanche des courriels non versionnée** — donnée personnelle
   exclue du repo public. Reconstruction manuelle en cas de perte
   Cloudflare.
3. **Mainteneur unique** (CAF = 1) — pas de bus factor mitigé. Procédure
   §6.4 documentée pour faciliter un passage de relais futur.
4. **Pas de monitoring de production** — pas d'alerte automatique en cas
   de panne Netlify ou Cloudflare. La détection dépend de l'usage actif
   par l'auteur (qui travaille essentiellement en local).

---

## Historique des révisions

| Date | Version | Modification |
|---|---|---|
| 2026-08-27 | 1.6 | **Réactivation de Cloudflare Access décidée pour le 1er septembre 2026, avec une policy ouverte.** (a) Correction de quatre affirmations fausses ou périmées, toutes issues d'inférences non vérifiées : le quota n'a **jamais** été saturé (51 identités mais 4 sièges actifs au 20 mai) ; la règle `Include` d'hiver était `Everyone` et non une liste blanche (celle-ci n'a existé qu'en janvier) ; les 51 identités ne sont pas des personnes « autorisées » une à une mais des gens entrés par une porte ouverte ; la traçabilité n'est pas impossible — c'est la page `Users` qu'il faut lire, pas les journaux purgés à 24 h. (b) §3 retitrée et son encadré de statut réécrit ; §3.2 (durée de session portée à **1 mois**, changement assumé) ; §3.3 (`Include → Everyone`) ; §3.5 (attendus du `curl` inversés) ; §3.6 réécrite en « Réactivation décidée » avec le cinquième motif énoncé plutôt que rangé de force dans les quatre conditions existantes. (c) §4 : 4.1 et 4.2 marquées sans objet, 4.3 élargie hors liste blanche, **4.4 refondue en « Export périodique des identités »** — le geste qui sert le motif. (d) `PRIVACY.md` §3.3 et §6.2 alignés dans la même passe : la conservation sans limite des adresses et leur export périodique sont désormais déclarés aux utilisateurs, avec leur finalité. Cf. ADR-008 révision du 27 août 2026 et `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`. |
| 2026-05-22 | 1.0 DRAFT | Rédaction initiale, soumis à validation. Placeholders à confirmer sur 5 points marqués `[À COMPLÉTER]`. |
| 2026-08-23 | 1.5 | (a) §1.2 : le site Netlify s'appelle **`codexnumeris-051225`**, pas `labocodex` — vérifié par l'API ; l'ancien nom ne correspondait à rien dans le compte. (b) §1.2 : aperçus de PR documentés (`deploy-preview-<N>--…`), avec l'avertissement que c'est une **origine différente**, donc sans les données. (c) §1.1 : le dépôt est **privé**, avec sa conséquence sur les minutes Actions. (d) §2.1 : le bump passe par `scripts/release.mjs`, plus par une édition manuelle ; incident du jour consigné. (e) §2.4 (neuf) : état réel de la CI — ne démarre plus, et était déjà rouge. |
| 2026-05-28 | 1.1 | (a) Substitution `labo.codexnumeris.org` → `app.codexnumeris.org` partout. L'ancien sous-domaine n'a plus d'enregistrement DNS. (b) Retrait du Cloudflare Access acté en préparation de l'AQPC du 3 juin. Sections 3 et 4 marquées historiques. PRIVACY.md à réviser séparément (BACKLOG #298). Cf. ADR-008 révisé. |
| 2026-05-28 | 1.2 | Recadrage du référentiel Loi 25 après consultation Cowork. §1.4 ajoutée : Labo Codex, en configuration actuelle (mainteneur individuel, pas d'activité économique organisée, app 100 % hors-ligne), n'engage vraisemblablement pas la *Loi sur la protection des renseignements personnels dans le secteur privé*. §3 «Conséquences acceptées» et §4.3 réécrites en conséquence. ADR-008 (révision du 28 mai 2026) et PRIVACY.md à aligner ; BACKLOG `#298` à reformuler – pas «mettre à jour la posture Loi 25», mais «clarifier que le cadre a été surinvoqué et préciser le régime réel». |
| 2026-05-28 | 1.3 | Cadrage de la levée Access comme **fenêtre d'ouverture publique du 3 juin au 30 juin 2026**, pas comme retrait indéfini. §3 retitrée «SUSPENDU», intro réécrite pour acter la date de refermage, ajout d'une note sur l'usage hors-ligne (l'app reste téléchargeable en tout temps – le refermage ne coupe l'accès web qu'aux personnes hors liste blanche reconstituée) et d'une note sur le précédent alpha de janvier 2026 (paramètres défavorables aujourd'hui levés : beta stable, fin de session, dispositif CoP). Nouvelle §3.6 «Refermage planifié — 1er juillet 2026» : sources de reconstitution de la liste blanche (Cohorte 1 pilote 2026-2027 + demandeurs CoP + mainteneur), procédure technique, points à documenter au moment du refermage. §4 retitrée «SUSPENDU». §3.5 et §4.1 actualisées pour refléter les états successifs du quota. ADR-008 à aligner. |
| 2026-06-02 | 1.4 | **Retrait du refermage planifié au 1er juillet** après examen à froid des justifications restantes. Une fois retirées les invocations qui ne tiennent plus l'examen (Loi 25 absente par §1.4, anti-scraping géré indépendamment d'Access par le CDN Cloudflare, traçabilité Cloudflare n'ayant rien produit d'actionnable en phase alpha, Voûte ayant son propre contrôle d'accès applicatif futur), il ne reste comme justification matérielle du refermage que la contrainte du quota gratuit 50 sièges — qui est une conséquence opérationnelle du choix de maintenir Access, pas une raison de le maintenir. Argument additionnel : refermer le 1er juillet couperait l'accès pendant la fenêtre d'appropriation et de préparation des cours d'automne (mi-juillet à mi-août), en contradiction avec la finalité de l'AQPC du 3 juin telle que documentée par l'ADR-008. Décision : ouverture publique par défaut sans date de réactivation planifiée. §3 retitrée «désactivé par défaut — référence technique pour un usage futur», intro et motivations réécrites. §3.6 retitrée «Conditions de réactivation éventuelle» : liste des conditions qui pourraient justifier une réactivation future (abus mesurable, création de la Voûte, bascule institutionnelle, croissance inattendue). §4 retitrée «référence technique pour un usage futur». §3.5 et §4.1 actualisées. ADR-008 à aligner, BACKLOG `#298` à refondre une seconde fois, note CoP et message d'accueil dans l'app à amender. |

---

**Document à compléter** :
- **§1.2 `codexnumeris-051225.netlify.app` restreint par Access ?** — de nouveau pertinent à partir du 1er septembre 2026 : vérifier si l'URL Netlify directe contourne Access (elle n'est pas derrière le proxy Cloudflare). Si oui, c'est une porte dérobée qui vide la mesure de son sens.
- **§3.1 à §3.3 noms exacts de la team / app / policy Cloudflare Access** — de nouveau requis (lignes marquées `[À COMPLÉTER]`) : à relever dans le tableau de bord avant le 1er septembre 2026, avec la durée de session et la règle `Include` réellement en place. Cf. fiche de réactivation §3.
- §7 registrar du domaine et coût annuel
- §8.1 statut 2FA sur GitHub / Netlify / Cloudflare
