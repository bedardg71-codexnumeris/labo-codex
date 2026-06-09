# Audit technique de Labo Codex — Rapport de synthèse

**Version 1.0 (à compléter)**
**Date de l'audit** : YYYY-MM-DD à YYYY-MM-DD
**Commit audité** : `<hash git>`
**Mainteneur** : Grégoire Bédard, enseignant de littérature, Cégep de Drummondville
**Exécution** : Grégoire Bédard + Claude Code (modèle, version)
**Licence du projet** : AGPL v3 (code) + CC BY-SA 4.0 (ressources pédagogiques)

---

## Préambule

Cet audit a été conduit volontairement, dans une démarche de transparence et d'anticipation des exigences institutionnelles. Il n'est pas une certification ; c'est une caractérisation honnête de l'objet « Labo Codex » à un instant donné, avec ses forces et ses fragilités, pour permettre :

1. À Grégoire d'orienter son travail.
2. Aux institutions (Cégep de Drummondville, AQPC, Fédération des cégeps) d'évaluer le projet pour adoption éventuelle.
3. À la communauté open source de comprendre l'objet sur des bases factuelles.

**L'audit assume que Labo Codex a des fragilités spécifiques à son contexte** : projet vibe-codé par un non-développeur professionnel, mainteneur unique, développement de 7 mois. Cette caractérisation est plus utile qu'un récit promotionnel.

---

## Cadres théoriques mobilisés

- Fidelity of Implementation : Penuel & Means (2004), O'Donnell (2008).
- Qualité logicielle : ISO/IEC 25010:2023, McCabe (1976), Campbell (SonarSource, 2018).
- Architecture : DDD (Evans), Modular Monolith (Brown), SSOT (Red Hat).
- Sécurité : OWASP Top 10 (2021), Veracode 2025 GenAI Code Security Report.
- Données personnelles : Loi 25 Québec, RGPD.
- Accessibilité : WCAG 2.1 AA, Apple HIG.
- Santé open source : OpenSSF Scorecard, CHAOSS.

---

## Tableau de bord global

| Axe | Sous-audits | Statut | Commentaire d'une ligne |
|---|---|---|---|
| 1. Conformité pédagogique | 3 | __ | |
| 2. Santé du code | 5 | __ | |
| 3. Architecture (SSOT) | 3 | __ | |
| 4. Soutenabilité | 6 | __ | |
| 5. Sécurité + données | 5 | __ | |
| 6. Accessibilité | 3 | __ | |
| **Statut global** | **25** | **__** | |

Légende : 🟢 vert / 🟡 jaune / 🔴 rouge / ⚫ N/A

---

## Synthèse par axe

### Axe 1 — Conformité pédagogique

**Question** : le code reflète-t-il fidèlement le cadre théorique revendiqué (IDME, A-C-P, RàI, blocage, vocabulaire descriptif) ?

**Résultats** :
- Traçabilité concept → fonction : __
- Validation numérique des formules : __
- Cohérence terminologique : __

**Constat principal** : ...

**Recommandations** : ...

---

### Axe 2 — Santé du code

**Question** : le code est-il maintenable, lisible, sans duplication ni complexité excessive ?

**Résultats** :
- Taille et composition : __
- Complexité (cyclomatic, cognitive, nesting) : __
- Duplication : __
- Code mort, fichiers orphelins : __
- Linting global : __

**Constat principal** : ...

**Recommandations** : ...

---

### Axe 3 — Architecture (SSOT)

**Question** : le pattern Single Source of Truth revendiqué est-il respecté ?

**Résultats** :
- Cartographie SSOT : __
- Modularité et couplage : __
- Isolation des modules : __

**Constat principal** : ...

**Recommandations** : ...

---

### Axe 4 — Soutenabilité

**Question** : un tiers peut-il reprendre, comprendre, maintenir Labo Codex ?

**Résultats** :
- Documentation (README, CLAUDE.md, ADRs) : __
- Bus factor / CAF : __ (1 par construction — limite assumée)
- Test d'onboarding : __
- Reproductibilité déploiement : __
- Licences : __
- OpenSSF Scorecard : __ / 10

**Constat principal** : projet à mainteneur unique. Soutenabilité dépend de la documentation et de la qualité du code, pas de la communauté.

**Recommandations** : ...

---

### Axe 5 — Sécurité et données

**Question** : le code est-il exempt de vulnérabilités OWASP ? Les données d'élèves sont-elles protégées ? Conformité Loi 25 ?

**Note préliminaire (Veracode 2025)** : selon le *2025 GenAI Code Security Report* publié le 30 juillet 2025, 45 % des complétions LLM introduisent une vulnérabilité OWASP Top 10. Pour JavaScript, 38-45 % d'échec. Pires CWE : XSS (CWE-80, 86 % d'échec) et log injection (CWE-117, 88 %). Cet audit a pris ces statistiques au sérieux et examiné spécifiquement ces vecteurs.

**Résultats** :
- Lighthouse Best Practices : __
- OWASP Top 10 : __
- Inventaire des données stockées : __
- Conformité Loi 25 : __

**Constat principal** : ...

**Recommandations** : ...

---

### Axe 6 — Accessibilité

**Question** : Labo Codex est-il accessible WCAG 2.1 AA ? Fonctionne-t-il correctement sur iPad ?

**Note** : selon le Deque Automated Accessibility Coverage Report, l'audit automatisé ne couvre que 16/50 critères WCAG 2.1 AA (~20-30 % de couverture par critère, ~57 % par volume d'issues). Un score Lighthouse de 100/100 ne signifie pas conformité WCAG complète.

**Résultats** :
- WCAG 2.1 AA automatisé : __
- Tests manuels (clavier, VoiceOver) : __
- Spécificités iPad : __

**Constat principal** : ...

**Recommandations** : ...

---

## Ce que l'audit NE mesure PAS (angles morts assumés)

À mentionner en évidence, sans euphémisme :

1. **La validité pédagogique réelle des concepts implémentés** — l'audit valide la fidélité d'implémentation, pas la validité du cadre théorique ni son efficacité empirique. Exigerait une recherche-action séparée.

2. **Les vulnérabilités d'exécution dynamique (DAST)** — l'audit est statique. Un pen-test professionnel reste recommandé pour une diffusion institutionnelle large.

3. **Les biais cognitifs encodés dans l'UX** — exige une analyse UX ethnographique.

4. **La performance en conditions réelles** (classe de 30 élèves, vieil iPad, mauvais réseau) — exige une phase pilote.

5. **L'évolution du codebase dans le temps** (hotspots, code churn) — CodeScene mesure cela, outil commercial. À considérer si financement institutionnel.

6. **L'interopérabilité avec systèmes externes** (LMS, dossier scolaire) — hors périmètre, non revendiqué.

7. **La validité juridique de la licence AGPL v3 en contexte cégep** — exige avis juridique professionnel.

8. **L'impact carbone et soutenabilité environnementale** — hors périmètre actuel.

---

## Recommandations consolidées

### Priorité haute (à traiter avant adoption institutionnelle)

À remplir : ...

### Priorité moyenne (à planifier sur les 6 mois)

À remplir : ...

### Priorité basse (à considérer)

À remplir : ...

---

## Politique de mise à jour de l'audit

- **Audit complet annuel** (juin recommandé).
- **Mini-audit** (axes 2 et 5.1) à chaque refactoring majeur.
- **Veille passive** : `npm audit` hebdomadaire, monitoring OWASP, Loi 25.

---

## Versions et signatures

- Audit conduit du __ au __ 2026.
- Outils utilisés : ESLint 9.x, jscpd 4.x, madge 8.x, axe-core CLI 4.x, Lighthouse 12.x, scc.
- Modèle Claude Code utilisé : ...
- Rapport signé : Grégoire Bédard, __ 2026.

---

## Annexes (à joindre)

- `audit/reports/01-fidelity/*` — détails axe 1.
- `audit/reports/02-code-health/*` — détails axe 2.
- `audit/reports/03-architecture/*` — détails axe 3.
- `audit/reports/04-sustainability/*` — détails axe 4.
- `audit/reports/05-security/*` — détails axe 5.
- `audit/reports/06-accessibility/*` — détails axe 6.

---

## Versions dérivées du rapport

À produire à partir de ce gabarit :

1. **Version interne** (Grégoire) : ce gabarit complet + tous les détails.
2. **Annexe technique AQPC** : version condensée 8-12 pages PDF.
3. **Note institutionnelle** : 2 pages pour direction cégep / fédération.
4. **Version publique** : `AUDIT.md` à la racine du repo, avec lien vers blog Codex Numeris pour discussion narrative.
