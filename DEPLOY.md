# Guide de déploiement — Labo Codex

> **Version** : 1.1 (28 mai 2026 — substitution domaine `labo` → `app` + acte la levée du Cloudflare Access)
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
| **GitHub** | Dépôt source, branche `main` = vérité | Gratuit (dépôt public) |
| **Netlify** | Build + hébergement statique de l'application | Plan gratuit |
| **Cloudflare DNS** | Résolution DNS du domaine `app.codexnumeris.org` | Gratuit |
| **Cloudflare Access** | ~~Contrôle d'accès Zero Trust (OTP par courriel)~~ **Retiré le 28 mai 2026 en préparation AQPC** — voir §3 | n/a |

### 1.2 URL et domaines

| URL | Rôle | Accessible |
|---|---|---|
| `labocodex.netlify.app` | URL Netlify par défaut | Accessible — origin Netlify, derrière le DNS Cloudflare via CNAME |
| `app.codexnumeris.org` | URL publique principale | **Publique** depuis le 28 mai 2026 (Cloudflare Access retiré) |
| `github.com/bedardg71-codexnumeris/Monitorage_v6` | Code source | Public en lecture |

⚠️ L'ancien sous-domaine `labo.codexnumeris.org` (référencé dans la
version 1.0 de ce document) n'a plus d'enregistrement DNS et n'est
plus utilisé. Toute mention résiduelle dans la documentation est
obsolète.

### 1.3 Principe directeur

Le déploiement est **entièrement automatisé sur push vers `main`**.
Aucune commande à lancer manuellement. Aucun build local requis (l'application
est servie telle quelle, pas de transpilation/bundling).

---

## 2. Procédure de déploiement (push vers main)

### 2.1 Cycle normal

1. **Travailler** sur une branche dédiée (ex : `cat-b/track-X`, `aqpc/privacy`).
2. **Tester localement** :
   ```bash
   cd tests && npm test
   # Attendu : 97/97 verts (85 Vitest + 12 Playwright)
   ```
3. **Bumper la version** : éditer `version.json` ET les fallback de
   `js/init-inline.js` lignes 121-122. *Voir CLAUDE.md « Avant chaque
   commit » pour le pattern complet.*
4. **Commit** :
   ```bash
   git commit -m "feat(<scope>): <description>"
   ```
5. **Push + merge sur `main`** :
   ```bash
   git push origin <branche>
   # Puis depuis le worktree main (ou GitHub web) :
   git push . HEAD:main
   git push origin main
   ```
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

---

## 3. Configuration Cloudflare Access (HISTORIQUE — retiré le 28 mai 2026)

> **⚠️ Section conservée à titre historique et pour permettre une réactivation rapide.**
>
> **Décision du 28 mai 2026** : retrait complet du Cloudflare Access en
> préparation de la présentation AQPC du 3 juin 2026 (J−6 au moment de la
> décision). La liste blanche de 50 places (dont 47 disponibles au moment
> de la décision) est libérée. L'application devient publiquement accessible
> sans authentification.
>
> **Motivations** :
> - Permettre aux visiteurs de la conférence AQPC de tester l'application
>   sans procédure d'inscription préalable.
> - Éliminer le risque que le challenge bot Cloudflare bloque des visiteurs
>   sur des appareils anciens ou réseaux institutionnels stricts.
> - Sortir de la contrainte du quota gratuit (50 utilisateurs).
>
> **Conséquences acceptées** :
> - Plus de logs d'accès individuels par identité courriel.
> - Plus de base de consentement explicite Loi 25 par liste blanche (cf.
>   PRIVACY.md §6, à réviser séparément — BACKLOG #298).
> - L'app reste 100 % hors-ligne par conception (ADR-003) : aucune donnée
>   pédagogique ne transite par les serveurs Netlify / Cloudflare.
>
> **Décision réversible** : la procédure ci-dessous reste valide pour
> remettre Cloudflare Access en place si nécessaire (quelques minutes
> dans le dashboard Zero Trust).
>
> Cf. ADR-008 (révisé le 28 mai 2026).

### 3.1 Tableau de bord

URL : **`https://one.dash.cloudflare.com`** (le tableau Zero Trust, distinct
du tableau DNS classique `dash.cloudflare.com`).

Organisation : *[À COMPLÉTER — nom de la team Zero Trust]*

### 3.2 Application Access protégée

`Access → Applications → [nom de l'app Labo Codex]`

| Paramètre | Valeur actuelle | Référence |
|---|---|---|
| **Application name** | *[À COMPLÉTER — ex : « Labo Codex »]* | Nom affiché à l'authentification |
| **Type** | Self-hosted | Type d'application Cloudflare Access |
| **Application domain** | `app.codexnumeris.org` | Domaine protégé |
| **Session duration** | **1 semaine** (confirmé 22 mai 2026) | Durée de cookie de session |
| **App launcher visible** | Activé / Désactivé *[à confirmer]* | Visible dans le launcher Cloudflare |
| **Authentication** | **One-time PIN (OTP) par courriel** (confirmé 22 mai 2026) | Méthode d'auth — seule méthode active |

**Utilisateurs autorisés au 22 mai 2026** : **51 personnes** (auteur +
une cinquantaine de collègues à qui un accès individuel a été accordé).

### 3.3 Policies (règles d'accès)

`Access → Applications → [app] → Policies → [nom de la policy]`

| Paramètre | Valeur |
|---|---|
| **Policy name** | *[À COMPLÉTER — ex : « Collègues invités »]* |
| **Action** | Allow |
| **Include rule** | `Emails` → liste blanche des ~50 courriels |

**Liste blanche actuelle** : voir `Include` → champ `Emails`. Les courriels
ne sont **pas publiés** dans ce document pour préserver la confidentialité
des personnes concernées (voir [`PRIVACY.md`](PRIVACY.md) §6.2).

### 3.4 DNS Cloudflare

`DNS → Records` (tableau de bord Cloudflare classique, pas Zero Trust)

| Type | Nom | Cible | Proxy |
|---|---|---|---|
| `CNAME` | `labo` | `labocodex.netlify.app` | **Orange (proxy activé)** |

⚠️ Le proxy orange est **obligatoire** pour que Cloudflare Access intercepte
les requêtes. Si le proxy est gris (DNS only), Cloudflare Access est
contourné et l'app est accessible sans authentification.

### 3.5 Vérification

Test rapide depuis un terminal :
```bash
curl -I https://app.codexnumeris.org
# Attendu : HTTP/2 302 (redirection vers Cloudflare Access login)
# Pas : HTTP/2 200 (signifie que Cloudflare Access est contourné)
```

---

## 4. Gestion des utilisateurs autorisés (HISTORIQUE — retiré le 28 mai 2026)

> **Section sans objet depuis le retrait de Cloudflare Access** (cf. §3).
> Conservée à titre historique et pour permettre une réactivation rapide
> si Access est remis en place.

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

⚠️ **Quota plan gratuit** : 50 utilisateurs maximum. La liste est
**actuellement saturée** au 22 mai 2026. Avant d'ajouter, libérer une
place (voir §4.2) ou évaluer les options du PLAN-AQPC §5.1 (upgrade
payant, politique de domaine, purge des accès expirés).

### 4.2 Retirer une personne de la liste blanche

1. Aller dans `Access → Applications → [app] → Policies → [policy]`
2. Ouvrir la règle `Include` → `Emails`
3. Retirer le courriel
4. Sauvegarder
5. **Avertir la personne** par courriel que son accès est retiré et
   pourquoi (fin de phase, demande de retrait Loi 25, etc.)

### 4.3 Demande de retrait par l'utilisateur (Loi 25)

Toute personne sur la liste blanche peut demander son retrait à
[labo@codexnumeris.org](mailto:labo@codexnumeris.org) (voir
[`PRIVACY.md`](PRIVACY.md) §9). Le retrait est exécuté **dans les 30 jours**.

### 4.4 Audit périodique

Une fois par session (recommandation) :
1. Lister les utilisateurs actuellement autorisés.
2. Identifier ceux qui n'ont pas accédé depuis 3+ mois.
3. Leur écrire pour confirmer l'intérêt continu — sinon les retirer.
4. Documenter l'audit dans `INCIDENTS.md` si une décision de retrait
   notable est prise.

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
| Liste blanche des emails | **Non versionnée** (donnée personnelle). Maintenue uniquement dans Cloudflare Access. Si Cloudflare est perdu, la liste devra être reconstruite via les courriels d'invitation envoyés. |

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
| Push malveillant sur `main` | Pas de Branch Protection actuellement — voir Phase moyen terme [PLAN-MOYEN-TERME `audit/PLAN-MOYEN-TERME.md` §5.3](audit/PLAN-MOYEN-TERME.md) |

### 8.2 Tests de sécurité automatiques

Le hook pré-push lance Vitest + Playwright (97/97 verts requis). Voir
[`docs/securite/TESTS-AUTOMATISES.md`](docs/securite/TESTS-AUTOMATISES.md).

### 8.3 Branch Protection (à activer — Phase moyen terme)

Recommandation [`audit/PLAN-MOYEN-TERME.md` §5.3](audit/PLAN-MOYEN-TERME.md) :
- Force-push interdit sur `main`
- Historique linéaire requis
- Status checks (CI Vitest + Playwright) requis avant merge

Statut : **non activé au 22 mai 2026**. À activer post-AQPC.

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
| 2026-05-22 | 1.0 DRAFT | Rédaction initiale, soumis à validation. Placeholders à confirmer sur 5 points marqués `[À COMPLÉTER]`. |
| 2026-05-28 | 1.1 | (a) Substitution `labo.codexnumeris.org` → `app.codexnumeris.org` partout. L'ancien sous-domaine n'a plus d'enregistrement DNS. (b) Retrait du Cloudflare Access acté en préparation de l'AQPC du 3 juin. Sections 3 et 4 marquées historiques. PRIVACY.md à réviser séparément (BACKLOG #298). Cf. ADR-008 révisé. |

---

**Document à compléter** :
- ~~§1.2 `labocodex.netlify.app` restreint par Access ?~~ Sans objet depuis le retrait de Access.
- ~~§3.1 à §3.3 noms exacts de la team / app / policy Cloudflare Access~~ Sections historiques.
- §7 registrar du domaine et coût annuel
- §8.1 statut 2FA sur GitHub / Netlify / Cloudflare
