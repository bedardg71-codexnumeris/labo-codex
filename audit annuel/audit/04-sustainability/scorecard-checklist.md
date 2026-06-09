# OpenSSF Scorecard — Auto-évaluation (18 checks)

**Documentation officielle** : <https://scorecard.dev/>
**Outil automatisé (si repo public GitHub)** : <https://github.com/ossf/scorecard-action>

---

## Instructions

Pour chaque check, évaluer 0-10. Pour un projet à mainteneur unique, plusieurs scores seront structurellement bas — c'est attendu, à documenter comme limite assumée.

Format de réponse pour chaque check :

```
Check : <nom>
Score : X/10
Justification : <1-3 phrases>
À améliorer : <action ou « non applicable au contexte »>
```

---

## Thème 1 — Pratiques de sécurité holistiques

### 1. Maintained
**Question** : le projet a-t-il reçu des commits dans les 90 derniers jours ?
**Mesure** : nombre de commits sur les 90 derniers jours.
**Score Labo Codex (à remplir)** : __/10

### 2. License
**Question** : le projet a-t-il une licence open source reconnue ?
**Vérification** : présence d'un fichier `LICENSE` valide (AGPL v3 attendu).
**Score Labo Codex** : __/10

### 3. Security-Policy
**Question** : le projet a-t-il un fichier `SECURITY.md` décrivant comment signaler une vulnérabilité ?
**Vérification** : présence de `SECURITY.md`.
**Score Labo Codex** : __/10 (probablement 0 — à créer)

### 4. CII-Best-Practices
**Question** : le projet a-t-il un badge CII Best Practices ?
**Vérification** : badge sur le README pointant vers <https://bestpractices.coreinfrastructure.org/>.
**Score Labo Codex** : __/10 (probablement 0)

---

## Thème 2 — Risques liés au code source

### 5. Code-Review
**Question** : les changements de code passent-ils par une revue par pair ?
**Mesure** : pourcentage de commits ayant été reviewés par un autre développeur.
**Score Labo Codex** : __/10 (**0 attendu** — mainteneur unique, à documenter comme limite assumée)

### 6. Contributors
**Question** : le projet a-t-il des contributeurs de plusieurs organisations ?
**Mesure** : nombre de contributeurs distincts dans les 12 derniers mois.
**Score Labo Codex** : __/10 (**bas attendu** — projet solo)

### 7. SAST (Static Application Security Testing)
**Question** : le projet utilise-t-il un outil d'analyse statique de sécurité ?
**Vérification** : présence d'une intégration ESLint security, CodeQL, ou similaire dans la CI/CD.
**Score Labo Codex** : __/10 (peut être amélioré avec GitHub CodeQL Action)

### 8. Vulnerabilities
**Question** : le projet a-t-il des vulnérabilités connues non corrigées ?
**Mesure** : OSV (Open Source Vulnerabilities) database.
**Score Labo Codex** : __/10

### 9. Dependency-Update-Tool
**Question** : le projet utilise-t-il un outil de mise à jour automatique des dépendances ?
**Vérification** : présence de Dependabot, Renovate, ou équivalent.
**Score Labo Codex** : __/10 (à activer si non fait — Dependabot gratuit sur GitHub)

### 10. Pinned-Dependencies
**Question** : les dépendances sont-elles épinglées à une version exacte (hash) ?
**Vérification** : package-lock.json présent et à jour.
**Score Labo Codex** : __/10 (souvent non applicable pour un projet sans `package.json` actif)

### 11. Fuzzing
**Question** : le projet a-t-il du fuzzing en CI/CD ?
**Vérification** : OSS-Fuzz, ClusterFuzzLite, etc.
**Score Labo Codex** : __/10 (**0 attendu** — hors périmètre pour projet pédagogique solo)

### 12. Signed-Releases
**Question** : les releases sont-elles signées cryptographiquement ?
**Vérification** : signatures GPG/Sigstore sur les tags git.
**Score Labo Codex** : __/10 (**0 attendu** — pas de release formelle)

### 13. Branch-Protection
**Question** : la branche principale est-elle protégée (pas de force-push, revue obligatoire) ?
**Vérification** : configuration GitHub branch protection rules.
**Score Labo Codex** : __/10 (peut être configuré sur main)

### 14. Packaging
**Question** : le projet a-t-il un système de packaging reconnu (npm, PyPI, etc.) ?
**Vérification** : publication sur un registre public.
**Score Labo Codex** : __/10 (non applicable — application web hébergée, pas un package distribuable)

---

## Thème 3 — Risques liés au processus de build

### 15. CI-Tests
**Question** : le projet a-t-il des tests automatisés exécutés en CI ?
**Vérification** : présence de GitHub Actions / GitLab CI / etc.
**Score Labo Codex** : __/10 (probablement bas — à examiner)

### 16. Dangerous-Workflow
**Question** : les workflows CI utilisent-ils des patterns dangereux (commandes shell injectées, `pull_request_target` mal configuré) ?
**Vérification** : analyse des workflows `.github/workflows/*.yml`.
**Score Labo Codex** : __/10 (probablement N/A si pas de workflows)

### 17. Token-Permissions
**Question** : les tokens utilisés dans CI ont-ils des permissions minimales ?
**Vérification** : `permissions:` explicite dans chaque workflow.
**Score Labo Codex** : __/10 (N/A si pas de workflows)

### 18. Binary-Artifacts
**Question** : le projet contient-il des binaires non vérifiables (executables, archives) ?
**Vérification** : recherche de fichiers binaires dans le repo.
**Score Labo Codex** : __/10 (probablement bon — projet web pur HTML/CSS/JS)

---

## Score global

**Formule Scorecard** : moyenne pondérée des 18 checks, mais Scorecard applique des poids variables. Pour une auto-évaluation simplifiée :

**Score Labo Codex global** : __/180 → __/10

---

## Commentaire global

À rédiger par Grégoire / Claude Code :

- Les 0 structurels (Code-Review, Contributors, Fuzzing, Signed-Releases) reflètent la nature solo et pédagogique du projet, **pas un défaut à corriger artificiellement**.
- Les améliorations réalistes : Security-Policy (SECURITY.md), Dependency-Update-Tool (Dependabot), CI-Tests (au moins des tests de fidélité automatisés), Branch-Protection (sur main).
- Les améliorations hors périmètre : Fuzzing, Signed-Releases, multi-contributeurs.

---

## Référence

<https://github.com/ossf/scorecard/blob/main/docs/checks.md>
