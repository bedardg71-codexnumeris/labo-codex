# Axe 4 — Soutenabilité

**Priorité 4.** **Temps total estimé : 6 h 15.** **En parallèle des autres phases (peut s'exécuter en arrière-plan).**

---

## Question d'audit

Un tiers (développeur professionnel, autre enseignant motivé, communauté open source) peut-il reprendre, comprendre, maintenir et déployer Labo Codex sans Grégoire ?

---

## Cadre

- Michael Nygard (2011) — Architecture Decision Records (ADRs).
- CHAOSS Contributor Absence Factor.
- OpenSSF Scorecard (18 checks).

---

## Sous-audits

### 4.1 — Documentation architecturale (2 h)

**Vérifier l'existence et la qualité de** :

- `README.md` à la racine — description, installation, usage, licence.
- `CLAUDE.md` à la racine — instructions pour collaboration LLM (déjà existant chez Grégoire).
- `docs/adr/` — Architecture Decision Records.

**Pour les ADRs** : créer 8-12 ADRs rétroactifs documentant les décisions structurantes déjà prises. Format Michael Nygard standardisé.

**Liste minimale d'ADRs à créer** :

1. ADR-001 : Choix de JavaScript vanilla (pas de framework).
2. ADR-002 : Choix d'IndexedDB + localStorage pour persistance.
3. ADR-003 : Choix du mode 100 % hors-ligne.
4. ADR-004 : Choix du pattern Single Source of Truth.
5. ADR-005 : Choix de l'échelle IDME plutôt que notation numérique classique.
6. ADR-006 : Choix de la fenêtre glissante de 3 artefacts pour A-C-P.
7. ADR-007 : Choix du vocabulaire descriptif (« difficulté émergente / plateau / persistante »).
8. ADR-008 : Choix de Cloudflare Access pour authentification.
9. ADR-009 : Choix de AGPL v3 pour le code et CC BY-SA 4.0 pour les ressources.
10. ADR-010 : Choix du développement en vibe coding avec Claude Code.
11. ADR-011 : Architecture quatre espaces de données (Codex / Réserve / Codex data / Voûte).
12. ADR-012 : Politique d'audit annuel.

**Gabarit** : voir `adr-template.md` dans ce dossier.

**Livrable** : `audit/reports/04-1-docs.md` + dossier `docs/adr/` créé à la racine du repo.

---

### 4.2 — Bus factor / Contributor Absence Factor (15 min)

**Constat factuel actuel** : projet à mainteneur unique. **CAF = 1.**

**Référence CHAOSS** : « The Contributor Absence Factor assesses the degree to which a project relies on a small number of contributors by identifying the smallest number of contributors responsible for 50% of total contributions. »

**Méthode** :

```bash
# Vérifier les contributions git (devrait montrer Grégoire en quasi-totalité)
git shortlog -sn --no-merges > audit/reports/04-2-contributors.txt
```

**Mitigation documentaire** : qualité de l'onboarding (README, ADRs, commentaires) compense partiellement.

**Livrable** : section déclarative dans `audit/reports/04-2-bus-factor.md` :
- CAF = 1 (factuel).
- Risque : si Grégoire devient indisponible, le projet s'arrête.
- Mitigations en place : documentation, AGPL v3 permettant le fork.
- Plans : recherche de co-mainteneurs à partir de l'automne 2026 (allocation cégep).

---

### 4.3 — Test d'onboarding tiers (1 h)

**Méthode** : test à blanc — Grégoire ouvre une nouvelle session Claude Code (sans aucun historique) et donne accès au repo en lecture seule. Mesurer le temps avant production d'un diagramme d'architecture correct.

**Procédure** :

1. Démarrer une nouvelle session Claude Code, sans charger `audit/PROMPT.md` ni aucun fichier de contexte préalable.
2. Prompt initial : « Tu es un développeur senior qui découvre un projet inconnu. Voici le repo Labo Codex. Sans poser de questions, lis les fichiers et produis en moins de 30 minutes : (a) une description en 1 page de l'architecture, (b) un diagramme des modules principaux, (c) une liste des 3 fichiers les plus importants à comprendre en premier. »
3. Chronométrer.
4. Évaluer la qualité du résultat : couvre-t-il les éléments essentiels (SSOT, indices A-C-P, IDME, RàI) ?

**Seuils** :
- Vert : < 30 min, description correcte, 3 fichiers prioritaires bien identifiés.
- Jaune : 30-60 min, description partielle.
- Rouge : > 60 min, ou description fausse, ou Claude « frais » se perd.

**Livrable** : `audit/reports/04-3-onboarding.md`.

---

### 4.4 — Reproductibilité du déploiement (1 h)

**Question** : la procédure de déploiement est-elle documentée pas à pas, avec captures et hashes de version ?

**Vérifications** :

- Procédure de build (s'il y en a une) documentée dans `DEPLOY.md` ou `README.md`.
- Configuration Netlify exportée ou documentée (variables d'environnement, headers, redirections).
- Configuration Cloudflare Access documentée (règles d'accès, géo-restriction, durée de session).
- Hash git de la version déployée enregistré quelque part.

**Livrable** : créer `DEPLOY.md` à la racine du repo si absent. Statut V/J/R selon complétude.

---

### 4.5 — Licences (45 min)

**Vérifications** :

- `LICENSE` à la racine (AGPL v3 — texte officiel).
- `LICENSE-CONTENT` ou `LICENSE-DOCS` (CC BY-SA 4.0 pour ressources pédagogiques) — si applicable.
- Headers de fichier conformes (chaque `.js` débute par un commentaire SPDX-License-Identifier).
- Dépendances éventuelles compatibles avec AGPL v3 :
  ```bash
  # Si package.json existe
  npm ls --prod --json > audit/reports/04-5-deps.json 2>/dev/null || echo "Pas de package.json"
  ```

**Outils utiles** :

- [SPDX License List](https://spdx.org/licenses/) pour identifiants standards.
- [GitHub Choose a License](https://choosealicense.com/) pour aide à la décision.

**Livrable** : `audit/reports/04-5-licenses.md`.

---

### 4.6 — Auto-évaluation OpenSSF Scorecard (1 h 15)

**Cadre** : OpenSSF Scorecard publie 18 checks pour la santé d'un projet open source. Voir `scorecard-checklist.md` dans ce dossier.

**Alternative automatisée** : si le repo est public sur GitHub, exécuter le Scorecard officiel via GitHub Action (`openssf/scorecard-action@v2`).

**Score attendu** : pour un projet à mainteneur unique, plusieurs checks seront structurellement à 0/10 :
- Code-Review (pas de revue par pair, Grégoire travaille seul).
- Contributors (mainteneur unique).
- Fuzzing (pas mis en place).
- Signed-Releases (pas de signature cryptographique).

**Ces 0/10 sont à documenter comme limites assumées**, pas à corriger artificiellement.

**Livrable** : `audit/reports/04-6-scorecard.md` avec tableau 18 lignes + score global.

---

## Synthèse de l'axe 4

`audit/reports/04-summary.md` :

- Tableau statuts par sous-audit.
- Évaluation globale de la soutenabilité : Labo Codex peut-il survivre si Grégoire arrête demain ?
- Recommandations pour préparer la suite (allocation cégep, recherche de co-mainteneurs).
