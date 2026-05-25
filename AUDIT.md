# Audit annuel — Labo Codex

> **Audit conduit** : 2026-05-12 au 2026-05-14
> **Version publique** : 1.1 — mise à jour 2026-05-25 (post-livraisons remédiation Priorité haute)
> **Mainteneur** : Grégoire Bédard, enseignant de littérature, Cégep de Drummondville
> **Documents apparentés** : [`PRIVACY.md`](PRIVACY.md), [`INCIDENTS.md`](INCIDENTS.md),
> [`DEPLOY.md`](DEPLOY.md), [`SECURITY.md`](SECURITY.md),
> [`docs/adr/`](docs/adr/README.md) (12 ADRs)

---

## Pourquoi ce document est public

Labo Codex est une application pédagogique de suivi des apprentissages, développée
depuis octobre 2025 par un mainteneur unique. Le dépôt GitHub est volontairement
public sous double licence (AGPL v3 + CC BY-NC-SA 4.0). Cette transparence
s'étend aux **fragilités du projet** : ce document est la version publique
d'un audit annuel volontaire conduit en mai 2026.

L'audit n'est pas une certification ; c'est une caractérisation factuelle de
Labo Codex à un instant donné, avec ses forces et ses fragilités. Il sert
trois publics :

1. **Les tiers GitHub** qui évaluent le projet pour le forker, le tester ou
   l'adopter — pour qu'ils décident sur des bases factuelles plutôt qu'un
   récit promotionnel.
2. **Les institutions** (direction de cégep, AQPC, Fédération des cégeps)
   qui envisagent une adoption élargie.
3. **Le mainteneur lui-même**, pour orienter les chantiers de remédiation et
   structurer la maintenance dans la durée.

L'audit annuel est inscrit comme politique projet ([`ADR-012`](docs/adr/012-audit-annuel.md)) :
il sera rejoué chaque année tant que Labo Codex reste maintenu.

---

## Contexte d'usage

Labo Codex est en production sur `app.codexnumeris.org` depuis janvier 2026,
derrière Cloudflare Access (Zero Trust, OTP par email, accès individuel
limité à une semaine). Environ **50 personnes en plus de l'auteur** ont
obtenu un accès entre janvier et mai 2026 ; aucune n'a renvoyé de feedback
ou de rapport de bug, et aucune n'est revenue après l'expiration de son
accès. **L'auteur est seul utilisateur actif depuis fin février 2026.**

Cette absence de retours est elle-même un signal — l'invitation alpha seule,
sans matériel d'accompagnement structuré, n'a pas suffi à enclencher un
engagement. La présentation AQPC du 3 juin 2026 (Cégep de Drummondville) vise
à amorcer la première vague significative d'expérimentateurs accompagnés.

---

## Périmètre et méthode

L'audit couvre **six axes complémentaires**, **25 sous-audits**, environ
**39 heures de travail** réparties sur 7 sessions. Exécution conjointe :
Grégoire Bédard (pilote, décisions) + Claude Code (Opus 4.7, exécution
méthodique).

L'audit a été conçu après recherche documentaire sur les standards reconnus :
ISO/IEC 25010:2023 (qualité logicielle), OWASP Top 10 (sécurité applicative),
WCAG 2.1 niveau AA (accessibilité), Loi 25 du Québec (protection des
renseignements personnels), CHAOSS et OpenSSF Scorecard (soutenabilité
open source).

| Axe | Question principale | Sous-audits |
|---|---|:---:|
| 1. Conformité pédagogique | Le code reflète-t-il fidèlement le cadre théorique ? | 3 |
| 2. Santé du code | Le code est-il maintenable ? | 5 |
| 3. Architecture (SSOT) | Le pattern Single Source of Truth est-il respecté ? | 3 |
| 4. Soutenabilité | Un tiers peut-il reprendre le projet ? | 6 |
| 5. Sécurité et données | Protection des élèves, conformité Loi 25 | 5 |
| 6. Accessibilité | Conformité WCAG 2.1 AA, iPad | 3 |

Outils : ESLint, jscpd (duplication), madge (graphe modulaire), axe-core et
Lighthouse (accessibilité), snippets console pour validation numérique, audit
déclaratif structuré OpenSSF Scorecard.

---

## Résultats globaux (au 14 mai 2026)

**25 sous-audits livrés sur 25 prévus.** Distribution initiale :
**5 Vert / 10 Jaune / 8 Rouge + 2 partiels** en attente de tests humains
(parcours clavier VoiceOver Mac et tests iPad réel).

| Axe | Statut au 14 mai | Lecture |
|---|:---:|---|
| Conformité pédagogique | 🟡 Jaune | Cœur algorithmique fiable (156/157 cas numériques conformes) ; finitions UI à compléter |
| Santé du code | 🔴 Rouge | Dette structurelle attendue d'un projet vibe-codé solo de 130 modules ; refactoring planifié hors audit |
| Architecture | 🔴 Rouge | Mêmes 8-10 modules concentrent la dette ; SSOT partiellement tenu |
| Soutenabilité | 🟡 Jaune | Documentation d'onboarding empiriquement validée ; pipeline déploiement non versionné |
| Sécurité et données | 🟡 Jaune | Aucune vulnérabilité OWASP exploitable ; documentation Loi 25 à compléter |
| Accessibilité | 🔴 Rouge léger | Chantier circonscrit et estimable (~10-12 h pour passer à Vert) |

**Verdict global** : projet fonctionnel, déployé en production sans incident
depuis 5 mois, avec des fragilités caractérisées et un plan de remédiation
chiffré.

---

## Forces structurelles

1. **Cœur algorithmique pédagogique fiable.** La validation numérique
   (sous-audit 1.2) a vérifié 157 cas-tests sur les formules canoniques
   (IDME, IPB, diagnostic croisé, indices A-C-P). 156 sont conformes.
   Le seul écart est un comportement documenté de configuration utilisateur,
   pas un défaut algorithmique.

2. **Documentation d'onboarding empiriquement validée.** Une session
   Claude Code « fraîche » (sans aucune mémoire ni contexte préalable) a
   produit en moins de 30 minutes une lecture exploitable de l'architecture,
   cochant 15/15 cases sur la grille d'évaluation. L'investissement
   documentaire du mainteneur compense réellement le mainteneur unique.

3. **Sécurité applicative de fond solide.** Aucune utilisation de `eval` ou
   `new Function`. Politique CSP stricte. ~568 appels systématiques d'une
   fonction d'échappement HTML. Sandbox d'aperçu pour les contenus importés.
   Validation par signature binaire (magic bytes) pour images et PDF. Score
   Lighthouse Best Practices 96/100.

4. **Conformité Loi 25 favorablement positionnée.** Aucune donnée pédagogique
   ne quitte la machine de l'enseignant (mode 100 % hors-ligne). Posture
   descriptive non prédictive opposable à l'article 12.1 (transparence
   algorithmique). L'audit annuel public lui-même constitue un signal de
   transparence directement opposable.

5. **Licences claires et compatibles.** Double licence
   AGPL v3 (code) + CC BY-NC-SA 4.0 (ressources pédagogiques). 8 librairies
   tierces incluses, toutes compatibles AGPL.

6. **12 décisions structurantes formalisées en cours d'audit.**
   [`docs/adr/`](docs/adr/README.md) contient 12 Architecture Decision Records
   rétroactifs (~1 085 lignes) couvrant vanilla JS, stockage hybride,
   hors-ligne, SSOT, IDME, Cloudflare Access, AGPL, vibe coding, 4 espaces
   de données, et la politique d'audit annuel elle-même.

---

## Faiblesses caractérisées

### Bloqueurs pré-adoption institutionnelle au 14 mai (~14 h estimés)

1. **README massivement obsolète.** Premier point de contact d'un tiers
   GitHub : version Beta 0.93 affichée vs Beta 99.42 actuelle, badge licence
   incomplet, statistiques fausses, 8 fichiers référencés absents.
2. **Pipeline de déploiement non reproductible.** Aucun document de
   déploiement versionné ; si l'accès aux tableaux de bord se perd,
   l'infrastructure est à reconstruire à la main.
3. **Politique de confidentialité publique absente.** Pas de `PRIVACY.md` à
   la racine ; seule conformité critique manquante au regard de la Loi 25.

### Dette structurelle assumée (~25-35 h sur 6 mois)

- **Santé du code et architecture** : 35 modules dépassent 1 000 lignes,
  387 fonctions dépassent les seuils de complexité standard. Les mêmes
  8-10 modules d'interface concentrent la dette sur 5 dimensions (taille,
  complexité, couplage, SSOT, surface publique).
- **Accessibilité** : 3 violations WCAG identifiées (2 critiques corrigeables
  en 7 minutes, 1 modérée). 22 sites de focus invisible probable. Préférences
  système (`prefers-reduced-motion`, `prefers-contrast`) non respectées.

### Limites structurelles assumées

- **Mainteneur unique** (Contributor Absence Factor = 1). 2 791 commits par
  Grégoire sur 7 mois. Limite mitigée par la licence AGPL v3 (fork possible)
  + la documentation d'onboarding validée empiriquement + l'audit annuel
  structuré.
- **Pas de revue par pair, pas de fuzzing, pas de signed-releases** : quatre
  zéros OpenSSF assumés comme limites structurelles d'un projet pédagogique
  solo. Score auto-évalué ~3,3/10 au 14 mai.

---

## Remédiation livrée depuis le 14 mai 2026

L'audit a été suivi d'un cycle de remédiation actif. **État au 25 mai 2026** :

### ✅ Bloqueurs pré-adoption — TOUS LEVÉS

| Item | Statut | Référence |
|---|---|---|
| Refonte README.md (Beta correcte, badges, retraits morts) | ✅ Livré 22 mai | [`README.md`](README.md) |
| Pipeline déploiement reproductible | ✅ Livré 22 mai | [`DEPLOY.md`](DEPLOY.md), `netlify.toml` |
| Politique de confidentialité (Loi 25) | ✅ Livré 22 mai | [`PRIVACY.md`](PRIVACY.md) (~400 lignes, 7 sections) |
| Registre incidents (Loi 25 art. 63.5) | ✅ Livré 22 mai | [`INCIDENTS.md`](INCIDENTS.md) |
| Information aux élèves (gabarit) | ✅ Livré 22 mai | `INFO-ELEVES.md` |
| Accessibilité (T-A1, T-A2, T-A3, T-A5, T-A7, T-A10 + aria-live + prefers-reduced-motion + prefers-contrast) | ✅ Livré 21-22 mai | Tests manuels A+B validés Grégoire 23 mai |
| Vocabulaire UI alarmiste (R → N « Niveau d'attention ») | ✅ Livré 22 mai | 49 substitutions cross-codebase + 4 fonctions code mort retirées |
| Audit `rapportsBugArchives` (seuil 50→20) | ✅ Livré 22 mai | Migration idempotente |

### ✅ Refactoring axes 2+3 (santé code + architecture) — LIVRÉ

| Module god | Cyc avant | Statut | Date |
|---|---:|---|---|
| `bilan-reflexif.js` (5 367 LOC) | — | ✅ Refactoré en 6 sous-modules | mai 2026 |
| `productions.js` (4 970 LOC) | — | ✅ Refactoré en 4 sous-modules | mai 2026 |
| `trimestre-v2.js` (5 470 LOC) | — | ✅ Refactoré en 7 sous-modules | mai 2026 |
| `profil-etudiant.js` (7 030 LOC) | — | ✅ Refactoré en 6 sous-modules | mai 2026 |
| `evaluation.js` (7 321 LOC) | — | ✅ Refactoré en 7 sous-modules + tests | 21 mai 2026 |

**Cycle Cat-B post-merge clos le 21 mai** : 10/10 critères atteints,
103/103 tests verts (Vitest + Playwright WebKit), 14 bugs latents fixés
en cours de route, sentinelles Vitest verrouillant les invariants critiques.

### ✅ Hygiène OpenSSF Scorecard (axe 4 résiduel) — LIVRÉ

| Item | Statut | Date |
|---|---|---|
| `SECURITY.md` (politique signalement vulnérabilités) | ✅ Livré | 25 mai |
| `.github/dependabot.yml` (surveillance hebdo) | ✅ Livré | 25 mai |
| `.github/workflows/tests.yml` (CI Vitest+Playwright Ubuntu) | ✅ Livré | 25 mai |
| `.github/workflows/codeql.yml` (SAST hebdo) | ✅ Livré | 25 mai |
| Doc Branch Protection (`.github/BRANCH-PROTECTION.md`) | ✅ Livré | 25 mai |
| 12 ADRs portés depuis branche audit vers main | ✅ Livré | 25 mai |
| `.gitconfig` attribution Claude → bedardg71-codexnumeris | ✅ Déjà OK | (vérifié) |

**Premier scan CodeQL post-livraison** : 7 erreurs détectées dans
`js/import-export.js` et `js/reserve-ouvrir.js` (bug latent + faux positif
défensif), **toutes fixées le jour même** (commits `1436803` + `de0e6a7`).

### ⏳ Reste à faire (Q3 2026)

- `libs/VERSIONS.md` (inventaire 8 libs vendored)
- Décision SPDX headers vs ADR de dérogation (129 fichiers JS)
- Doc opérationnelle obsolète (`docs/operations/PROTOCOLE_MISE_A_JOUR_BETA.md`,
  `scripts/update-version.sh`)
- Recherche de co-mainteneurs (allocation cégep prévue automne 2026)
- ÉFVP formalisée, politique de rétention détaillée (Loi 25 étendue)
- Refactoring `reserve.js` 3 couches (FSAPI/métier/UI)
- Plan Tier 6.5 sur `modalitesEvaluation` (14 écrivains, 47 sites)

---

## Démarches institutionnelles externes

Ces démarches dépendent de décisions institutionnelles, pas du mainteneur :

1. **Avis du responsable institutionnel de la protection des renseignements
   personnels** (Cégep de Drummondville) — délai externe 2 à 6 semaines.
   Conditionne la conformité formelle Loi 25 affichée dans `PRIVACY.md` v1.1.
2. **Avis juridique sur la licence AGPL v3 en contexte cégep** — clarification
   de l'applicabilité institutionnelle.
3. **Pen-test professionnel** recommandé pour diffusion institutionnelle
   large — coût indicatif 5 000 à 15 000 $ CAD.
4. **Test utilisateur avec personne en situation de handicap** — coût
   indicatif 500 à 1 500 $ CAD.

---

## Ce que l'audit ne mesure pas

À mentionner sans euphémisme, par honnêteté méthodologique :

1. La validité pédagogique empirique du cadre théorique implémenté (exigerait
   une recherche-action séparée).
2. Les vulnérabilités d'exécution dynamique (pen-test professionnel
   recommandé).
3. La performance en conditions réelles (classe de 30 élèves, iPad ancien,
   mauvais réseau).
4. La validité juridique de l'AGPL v3 en contexte cégep (exige un avis
   juridique).
5. L'évolution du codebase dans le temps (hotspots, code churn — outil
   commercial CodeScene à considérer si financement institutionnel).
6. L'interopérabilité avec les systèmes externes (Léa, Omnivox, dossier
   scolaire) — hors périmètre, non revendiqué.

---

## Recommandation synthétique

**Labo Codex est un projet utilisable en classe dans son périmètre actuel**
(usage individuel par enseignant, machine personnelle avec chiffrement
FileVault, mode hors-ligne) sans risque inacceptable identifié pour les
données d'élèves.

**Pour une adoption institutionnelle élargie**, les conditions sont :

- Engager les démarches institutionnelles externes ci-dessus.
- Compléter les chantiers Q3 2026 (refactoring résiduel, hygiène OpenSSF
  étendue, Loi 25 étendue).
- Envisager une allocation pour co-mainteneur à l'automne 2026, mitigant
  le bus factor de 1.

Le projet est **fork-friendly** (licence AGPL v3 + documentation interne
validée empiriquement + pipeline de déploiement désormais documenté) — il
peut survivre à un arrêt du mainteneur. L'audit annuel public lui-même
constitue un signal de sérieux et de transparence directement opposable
aux exigences institutionnelles.

---

## Annexes techniques

La version technique complète de l'audit (639 lignes) et les rapports
détaillés par axe et sous-audit vivent sur la branche
[`audit/2026-mai`](https://github.com/bedardg71-codexnumeris/Monitorage_v6/tree/audit/2026-mai)
du dépôt :

- `audit/reports/SUMMARY-internal.md` — référence technique complète
- `audit/reports/SUMMARY-aqpc.md` — version annexe AQPC (8-12 pages,
  ton public enseignant)
- `audit/reports/SUMMARY-institutional.md` — note 2 pages direction
- `audit/reports/0X-summary.md` — synthèse par axe (6 fichiers)
- `audit/reports/0X-Y-*.md` — sous-audits détaillés (25 fichiers)

Cette branche restera consultable indéfiniment ; un nouvel audit annuel
créera une branche `audit/2027-mai` qui répétera la démarche.

---

**Signataire** : Grégoire Bédard, 2026-05-14, Cégep de Drummondville.
**Mise à jour publique** : 2026-05-25, post-livraison du cycle de remédiation
Priorité haute. Aucun bilan ne sera arrière-corrigé sans note de révision
explicite.
