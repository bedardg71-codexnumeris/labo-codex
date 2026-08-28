# Checklist OWASP Top 10 (2021) pour Labo Codex

**Pour chaque catégorie OWASP** : pertinence pour Labo Codex (application 100 % hors-ligne, pas de backend), méthode d'audit, statut V/J/R.

---

## A01 — Broken Access Control

**Pertinence Labo Codex** : Faible (pas d'auth multi-utilisateur en local, mais Cloudflare Access en frontal).

**Audit** :
- Vérifier que Cloudflare Access est correctement configuré (**règle `Include` — `Everyone` à partir du 1er septembre 2026, pas de liste d'emails**, durée de session, géo-restriction). *Mis à jour le 27 août 2026 : cette ligne demandait de vérifier une « liste d'emails autorisés ». Il n'y en a plus — la porte est ouverte par décision, et une liste qui réapparaîtrait serait le signal à relever, pas l'inverse. Cf. ADR-008 et `DEPLOY.md` §3.6.*
- Vérifier qu'aucune route Netlify n'expose des données sensibles sans authentification.

**Statut** : __

---

## A02 — Cryptographic Failures

**Pertinence Labo Codex** : Élevée si données élèves dans IndexedDB.

**Audit** :
- Lister toutes les données stockées (voir sous-audit 5.3).
- Identifier celles qui sont en clair et pourraient être chiffrées avec Web Crypto API.
- Vérifier qu'aucun secret (token, clé API) n'est en dur dans le code :
  ```bash
  grep -rEn "api[_-]?key|secret|password|token|bearer" js/ --include="*.js"
  ```

**Statut** : __

---

## A03 — Injection

**Pertinence Labo Codex** : **Élevée**. Vecteur dominant : XSS via contenu utilisateur (artefacts saisis, imports JSON/ZIP, commentaires).

**Audit** :

```bash
# Tous les vecteurs DOM dangereux
grep -rn "innerHTML\|insertAdjacentHTML\|outerHTML\|document\.write\|document\.writeln" js/

# eval et équivalents
grep -rn "\beval(\|new Function(\|setTimeout([\"']\|setInterval([\"']" js/

# Construction dynamique de regex (risque ReDoS)
grep -rn "new RegExp(" js/

# innerHTML avec template literals (risque XSS si variable interpolée)
grep -rEn "innerHTML.*\\\$\{" js/
```

**Pour chaque occurrence** : lire 10 lignes de contexte et juger Sûr / À assainir / Critique.

**Cas spécifiques à vérifier** :
- Si import JSON depuis un fichier utilisateur : utiliser `JSON.parse` (jamais `eval`).
- Si import ZIP : valider la structure avant utilisation.
- Si saisie d'artefact texte affichée ensuite : utiliser `textContent`, pas `innerHTML`.
- Si Markdown converti en HTML : utiliser une lib reconnue (DOMPurify, sanitize-html) ou une whitelist stricte.

**Statut** : __

---

## A04 — Insecure Design

**Pertinence Labo Codex** : Modérée.

**Audit** : threat modeling léger (STRIDE) :

| Menace | Vecteur potentiel Labo Codex | Mitigation actuelle |
|---|---|---|
| **S**poofing (usurpation) | Utilisateur usurpe l'identité d'un autre enseignant | Cloudflare Access par email |
| **T**ampering (altération) | Manipulation des données IndexedDB depuis console | Aucune (par conception, données locales) — à documenter |
| **R**epudiation (dénégation) | Enseignant nie avoir saisi une évaluation | Aucune (pas de signature) — à documenter |
| **I**nformation disclosure | Fuite de données élèves via XSS | Audit A03 |
| **D**enial of service | Saturation IndexedDB par import malicieux | Validation taille imports |
| **E**levation of privilege | Pas d'élévation possible (pas de rôles) | N/A |

**Statut** : __

---

## A05 — Security Misconfiguration

**Pertinence Labo Codex** : Modérée.

**Audit** :
- Headers HTTP Netlify (`netlify.toml` ou `_headers`) : Content-Security-Policy, X-Frame-Options, X-Content-Type-Options.
- CSP : interdit `unsafe-inline` et `unsafe-eval` ?
- HTTPS forcé.
- Pas de fichiers de config exposés (`.env`, `.git`, etc.).

**Commandes** :

```bash
# Headers actuels en production
curl -I https://<URL_LABO_CODEX>

# Vérifier qu'aucun fichier sensible n'est dans le repo
git ls-files | grep -E "\.env|\.key|secret|password"
```

**Statut** : __

---

## A06 — Vulnerable and Outdated Components

**Pertinence Labo Codex** : Faible (projet vanilla, peu ou pas de dépendances).

**Audit** :

```bash
# Si package.json existe
[ -f package.json ] && npm audit --audit-level=moderate --json > audit/reports/05-1-npm-audit.json

# Lister toutes les dépendances JS chargées via CDN ou copiées localement
grep -rEn "<script.*src=" *.html
```

**Statut** : __

---

## A07 — Identification and Authentication Failures

**Pertinence Labo Codex** : **N/A** — Cloudflare Access gère l'authentification en amont, pas d'auth applicative.

**Statut** : N/A

---

## A08 — Software and Data Integrity Failures

**Pertinence Labo Codex** : Modérée. Vecteur : validation des imports ZIP/JSON.

**Audit** :
- Pour chaque format d'import accepté (JSON, CSV, ZIP, Markdown) : la validation est-elle suffisante ?
- Spécifiquement ZIP : protection contre zip-slip (chemins relatifs avec `../`), bombe ZIP (compression excessive) ?

**Recherche** :

```bash
grep -rn "JSZip\|zip\." js/
grep -rn "\.parse(\|JSON\.parse(" js/
```

**Statut** : __

---

## A09 — Security Logging and Monitoring Failures

**Pertinence Labo Codex** : Modérée. Vecteur : log injection (CWE-117, 88 % d'échec selon Veracode 2025).

**Audit** :

```bash
# Tous les console.* susceptibles de logger des données utilisateur
grep -rn "console\.\(log\|info\|debug\|warn\|error\)" js/ > audit/reports/05-1-logs.txt
```

**Pour chaque log** : vérifier que les données utilisateur loggées sont :
1. Assainies (pas de saut de ligne injecté).
2. Justifiées (debug temporaire ? à retirer en production).
3. Pas de PII (nom d'élève, etc.).

**Statut** : __

---

## A10 — Server-Side Request Forgery (SSRF)

**Pertinence Labo Codex** : **N/A** — pas de backend, pas de requêtes serveur côté serveur.

**Statut** : N/A

---

## Synthèse

| Catégorie | Statut |
|---|---|
| A01 Broken Access Control | __ |
| A02 Cryptographic Failures | __ |
| A03 Injection | __ |
| A04 Insecure Design | __ |
| A05 Security Misconfiguration | __ |
| A06 Vulnerable Components | __ |
| A07 Authentication Failures | N/A |
| A08 Data Integrity | __ |
| A09 Logging Failures | __ |
| A10 SSRF | N/A |

**Statut global axe 5.1** :
- Vert : toutes catégories applicables en vert.
- Jaune : ≥ 1 catégorie en jaune, aucune en rouge.
- Rouge : ≥ 1 catégorie en rouge.

Si rouge : **arrêter et corriger** avant de continuer l'audit.
