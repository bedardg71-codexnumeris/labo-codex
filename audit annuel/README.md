# Audit technique — Labo Codex

**Version 1.0** — protocole d'audit conjoint enseignant / Claude Code.
**Périmètre** : application web Labo Codex (HTML/CSS/JS pur, IndexedDB + localStorage, ~35 modules JS, vibe coding avec Claude Code).
**Mainteneur unique** : Grégoire Bédard, enseignant de littérature, Cégep de Drummondville.
**Licences visées** : AGPL v3 (code) + CC BY-SA 4.0 (ressources pédagogiques).

---

## Pourquoi cet audit

Cet audit n'est pas une opération de marketing ni une démonstration de valeur. Il vise à **caractériser honnêtement Labo Codex**, avec ses forces et ses fragilités, pour que :

1. Le mainteneur (Grégoire) sache exactement où il en est et où orienter son travail.
2. Une institution garante (Cégep de Drummondville, AQPC, Fédération des cégeps) puisse adopter ou soutenir le projet en connaissant sa réalité technique.
3. La communauté open source (lecteurs du blog Codex Numeris, contributeurs potentiels du repo) puisse évaluer le projet sur des bases factuelles.

L'audit assume qu'un projet vibe-codé par un non-développeur professionnel **a des fragilités spécifiques** (notamment celles documentées par Veracode 2025 : 45 % des complétions LLM introduisent une vulnérabilité OWASP Top 10), et que la transparence sur ces fragilités est plus utile à un commun pédagogique que leur dissimulation.

---

## Cadres théoriques mobilisés

- **Fidelity of Implementation** : Penuel & Means (2004), O'Donnell (2008, *Review of Educational Research* 78(1):33-84), Stains & Vickrey (2017).
- **Qualité logicielle** : ISO/IEC 25010:2023, McCabe (1976) cyclomatic complexity, Campbell (2018, SonarSource) cognitive complexity.
- **Architecture** : Domain-Driven Design (Evans 2003, Vernon 2013), Modular Monolith (Simon Brown), Single Source of Truth (Red Hat).
- **Sécurité** : OWASP Top 10 (2021), Veracode 2025 GenAI Code Security Report.
- **Données personnelles** : Loi 25 (Québec), RGPD.
- **Accessibilité** : WCAG 2.1 niveau AA, Apple Human Interface Guidelines (iPad).
- **Santé open source** : OpenSSF Scorecard, CHAOSS Contributor Absence Factor.
- **Documentation architecturale** : Michael Nygard (2011), Architecture Decision Records.

---

## Structure du dossier

```
audit/
├── README.md                      ← ce fichier (protocole, ordre, validation)
├── PROMPT.md                      ← prompt-cadre pour Claude Code
├── .eslintrc.audit.json           ← config ESLint isolée pour l'audit
│
├── 01-fidelity/
│   ├── README.md                  ← méthode axe 1
│   ├── traceability-template.csv  ← matrice concept → fonction (pré-remplie)
│   ├── calculations-tests.md      ← cas-tests à exécuter
│   └── lexicon-check.md           ← audit terminologique
│
├── 02-code-health/
│   ├── README.md                  ← méthode axe 2
│   └── commands.md                ← commandes CLI à exécuter
│
├── 03-architecture/
│   ├── README.md                  ← méthode axe 3
│   └── commands.md
│
├── 04-sustainability/
│   ├── README.md                  ← méthode axe 4
│   ├── adr-template.md            ← gabarit Architecture Decision Record
│   └── scorecard-checklist.md     ← 18 checks OpenSSF
│
├── 05-security/
│   ├── README.md                  ← méthode axe 5
│   ├── owasp-checklist.md
│   ├── data-inventory-template.md
│   └── loi25-checklist.md
│
├── 06-accessibility/
│   ├── README.md                  ← méthode axe 6
│   ├── manual-tests.md            ← passage clavier, VoiceOver
│   └── ipad-tests.md
│
├── reports/                       ← (vide au départ, accueillera les livrables)
│   └── .gitkeep
│
└── SUMMARY-template.md            ← gabarit du rapport de synthèse final
```

---

## Protocole d'exécution

### Phase 0 — Préparation (1 h)

**Acteur** : Grégoire + Claude Code.

1. Cloner le repo Labo Codex en local sur ta machine.
2. Vérifier que Node.js est installé (`node --version`, recommander ≥ 20).
3. Créer la branche `audit/2026-mai` pour ne rien committer sur `main` pendant l'audit.
4. Copier le contenu de ce dossier `audit/` à la racine du repo.
5. Installer les outils CLI globalement :
   ```bash
   npm i -g eslint@^9 jscpd@^4 madge@^8 @axe-core/cli@^4 lighthouse@^12
   # scc : voir https://github.com/boyter/scc (téléchargement binaire)
   # ou brew install scc sur macOS
   ```
6. Vérifier que tout fonctionne avec un dry-run : `eslint --version`, `jscpd --version`, `madge --version`, `npx lighthouse --version`.

**Point de validation** : si une installation échoue, ne pas continuer — résoudre d'abord, ou substituer un outil équivalent.

---

### Phase 1 — Santé du code (4 h, principalement Claude Code en autonomie)

**Pourquoi avant le reste** : permet de cartographier rapidement l'état technique avant d'investir du temps sur la conformité pédagogique (axe 1) qui exige le plus d'attention humaine.

**Ordre des sous-audits** :
1. `02-code-health/` → exécuter toutes les commandes du fichier `commands.md`.
2. Produire `reports/02-code-health.md` à partir du gabarit.

**Critère d'arrêt** : si > 20 % des fonctions dépassent les seuils de complexité (cyclomatic > 10 ou cognitive > 15), **arrêter et discuter** avec Grégoire avant de poursuivre. Un audit AQPC sur un code en rouge profond serait contre-productif ; mieux vaut planifier un refactoring partiel d'abord.

---

### Phase 2 — Architecture (4 h 30, Claude Code + revue Grégoire)

**Pourquoi avant l'axe 1** : la cartographie SSOT (axe 3.1) prépare l'analyse de fidélité (axe 1.1) en révélant où vivent les calculs pédagogiques critiques.

**Sous-audits** :
1. `03-architecture/3.2-modularity.md` — graphe madge, fan-in/fan-out.
2. `03-architecture/3.1-ssot.md` — cartographie des points d'écriture/lecture.
3. `03-architecture/3.3-isolation.md` — surface d'exposition des modules.

---

### Phase 3 — Conformité pédagogique (8 h 30, Grégoire pilote, Claude Code exécute)

**Cœur de l'audit pour l'AQPC.** À segmenter en demi-journées pour préserver le budget cognitif (max 90 min par session).

**Sous-audits** :
1. `01-fidelity/1.1-traceability.md` — matrice concept → fonction (3 h, deux sessions).
2. `01-fidelity/1.2-calculations.md` — validation numérique des formules (4 h).
3. `01-fidelity/1.3-lexicon.md` — cohérence terminologique (1 h 30).

**Point de validation critique** : si la matrice de traçabilité (1.1) révèle des concepts non implémentés ou des formules erronées, **prioriser la correction sur tout autre axe**. C'est le cœur de la légitimité pédagogique.

---

### Phase 4 — Sécurité (7 h 30, Claude Code + décisions Grégoire)

**Sous-audits** :
1. `05-security/5.5-lighthouse-bp.md` — Lighthouse Best Practices (rapide, en premier, 30 min).
2. `05-security/5.1-owasp.md` — audit OWASP Top 10 (3 h).
3. `05-security/5.2-veracode-context.md` — rédaction du contexte Veracode pour le rapport public (30 min).
4. `05-security/5.3-data-inventory.md` — inventaire des données stockées (2 h).
5. `05-security/5.4-loi25.md` — checklist Loi 25 + ébauche `PRIVACY.md` (2 h).

---

### Phase 5 — Accessibilité (4 h 30, Claude Code + tests manuels Grégoire)

**Sous-audits** :
1. `06-accessibility/6.1-wcag-auto.md` — axe + Lighthouse (1 h).
2. `06-accessibility/6.2-manual.md` — passage clavier, VoiceOver (2 h, Grégoire).
3. `06-accessibility/6.3-ipad.md` — Safari iPad, gestes, viewport (1 h 30, Grégoire).

---

### Phase 6 — Soutenabilité (6 h 15, en parallèle des autres phases)

**Peut s'exécuter en arrière-plan tout au long de l'audit.**

**Sous-audits** :
1. `04-sustainability/4.1-docs.md` — README + CLAUDE.md + 8-12 ADRs rétroactifs (2 h).
2. `04-sustainability/4.2-bus-factor.md` — constat CAF = 1 (15 min, déclaratif).
3. `04-sustainability/4.3-onboarding.md` — test à blanc avec Claude Code « frais » (1 h).
4. `04-sustainability/4.4-deploy.md` — reproductibilité (1 h).
5. `04-sustainability/4.5-licenses.md` — vérification licences (45 min).
6. `04-sustainability/4.6-scorecard.md` — auto-évaluation 18 checks OpenSSF (1 h 15).

---

### Phase 7 — Synthèse (3 h, Grégoire)

1. Remplir `SUMMARY-template.md` à partir des rapports `reports/*.md`.
2. Produire les quatre déclinaisons :
   - `reports/SUMMARY-internal.md` — version interne (work-in-progress).
   - `reports/SUMMARY-aqpc.pdf` — annexe technique pour la présentation AQPC (8-12 pages).
   - `reports/SUMMARY-institutional.md` — note 2 pages pour direction cégep / fédération.
   - `AUDIT.md` à la racine du repo — version publique GitHub.
3. Rédiger un billet de blog Codex Numeris narratif (optionnel, hors audit).

---

## Budget temps total

**~39 h réparties sur 4-5 semaines** à 8-10 h/semaine.

Pour un profil HPI+TDA, segmenter strictement en blocs de 90 min maximum, alterner :
- Phases nécessitant attention soutenue : 1.1, 1.2, 3.1, 5.1, 5.4.
- Phases d'exécution mécanique : toute la phase 1 (axe 2), 6.1.
- Phases de rédaction : 4.1, 5.2, phase 7.

---

## Politique de mise à jour

- **Audit complet annuel** (recommandé : juin de chaque année).
- **Mini-audit** (phase 1 + 5.1) à chaque refactoring majeur ou ajout substantiel.
- **Veille passive** : `npm audit` hebdomadaire (si dépendances), monitoring OWASP Top 10 annuel.

---

## Angles morts assumés

Voir `SUMMARY-template.md` section dédiée. Les principaux :

1. **Validité pédagogique réelle** — exige une recherche-action empirique, hors périmètre.
2. **Vulnérabilités d'exécution (DAST)** — exige un pen-test professionnel.
3. **Performance en conditions réelles** — exige une phase pilote en classe.
4. **Biais cognitifs encodés dans l'UX** — exige une analyse UX ethnographique.
5. **Validité juridique AGPL v3 en contexte cégep** — exige un avis juridique professionnel.

Ces limites sont à mentionner publiquement dans tous les rapports — pas par modestie, par honnêteté méthodologique.
