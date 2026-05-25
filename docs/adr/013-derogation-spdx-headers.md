# ADR-013 : Dérogation aux SPDX-License-Identifier dans les fichiers JavaScript

**Statut** : Accepté
**Date** : 2026-05-25
**Auteur** : Grégoire Bédard (et Claude Code)

---

## Contexte

L'OpenSSF Scorecard (sous-audit 4.6 de l'audit annuel 2026) et plusieurs
outils d'analyse de licences (`scancode-toolkit`, `licensee`, `reuse`)
recommandent d'inclure une mention machine-lisible de la licence dans
**l'en-tête de chaque fichier source**, au format **SPDX-License-Identifier** :

```javascript
// SPDX-License-Identifier: AGPL-3.0-only
```

Cette pratique facilite :
- L'identification automatique de la licence par les agrégateurs (GitHub,
  GitLab, FOSSA, Sonatype, etc.).
- La détection d'incompatibilités lors d'imports croisés (un fichier MIT
  importé dans un projet GPL signalerait automatiquement).
- La conformité à la norme REUSE de la Free Software Foundation Europe,
  reconnue comme bonne pratique en open source institutionnel.

Labo Codex compte actuellement **129 fichiers `.js`** dans le dossier `js/`,
plus l'unique `index.html` (qui charge l'application). Une opération de
mass-edit pour ajouter un header SPDX à chaque fichier représenterait
environ **1 heure 30 de travail mécanique** et un **commit géant** (touchant
130 fichiers en une fois).

L'analyse de ce trade-off s'inscrit dans le cycle de remédiation
post-audit annuel 2026 (cf. [`PLAN-MOYEN-TERME`](../../audit/PLAN-MOYEN-TERME.md) §5.4
sur la branche `audit/2026-mai`).

---

## Décision

**Ne pas ajouter de `SPDX-License-Identifier` dans les fichiers `js/*.js`
ni dans `index.html` ni dans `css/*.css`.**

La couverture licence repose sur **trois mécanismes consolidés** déjà en
place :

1. [`LICENSE.md`](../../LICENSE.md) à la racine du dépôt — texte complet
   de la double licence AGPL v3 (code) + CC BY-NC-SA 4.0 (contenu).
2. [`README.md`](../../README.md) — badges de licence visibles dès la
   page d'accueil GitHub + section « Licence » avec rappel du périmètre
   de chaque licence.
3. [`ADR-009`](009-licences.md) — formalisation de la décision de double
   licence avec justification des compromis.

Cette couverture est **suffisante pour la conformité légale** (les
fichiers individuels héritent de la licence racine du dépôt) et pour
les outils d'audit qui acceptent la convention `LICENSE` racine —
notamment GitHub License Detection et OpenSSF Scorecard `License` check.

---

## Conséquences

### Positives

- **Pas de mass-edit** sur 130 fichiers — préserve la lisibilité du
  `git blame` (un mass-edit aurait pollué l'attribution d'une ligne sur
  deux dans la moitié du projet).
- **Pas de conflit attendu** avec les branches en cours
  (`audit/2026-mai`, branches de refactoring) — un mass-edit aurait
  généré des conflits sur quasiment tous les fichiers.
- **Signal git plus net** — les commits futurs concernent la logique, pas
  des en-têtes administratifs.
- **Concentration de la documentation** — la licence se lit en un seul
  endroit (`LICENSE.md`), pas en 130.

### Négatives

- **Outils SAST stricts qui s'appuient sur SPDX header par fichier** ne
  détecteront pas la licence individuellement. Acceptable pour
  Labo Codex : aucun outil de l'audit actuel n'a cette exigence stricte.
- **Standard REUSE FSFe non atteint** — si Labo Codex devient un jour
  candidat à une labellisation « REUSE Compliant », un mass-edit
  rétroactif sera nécessaire.

### Neutres

- À ré-évaluer si Labo Codex est forké et que le fork importe du code
  d'origine différente (licence ≠ AGPL v3) — alors SPDX par fichier
  devient utile pour distinguer les fichiers originaux des fichiers
  importés.
- À ré-évaluer si l'adoption institutionnelle exige un BOM
  (Bill of Materials) formel — alors `scancode-toolkit` en CI peut
  générer un BOM SPDX sans modifier les fichiers source.

---

## Alternatives considérées

### Option A : Mass-edit pour ajouter SPDX-License-Identifier à tous les fichiers

Ajouter `// SPDX-License-Identifier: AGPL-3.0-only` en première ligne de
chaque fichier `js/*.js` (129 fichiers) + `<!-- SPDX-License-Identifier:
AGPL-3.0-only -->` dans `index.html`.

**Écartée** parce que :
- Le bénéfice marginal (détection automatique fichier par fichier) ne
  compense pas le coût (mass-edit, signal git pollué, conflits branches).
- La couverture légale est déjà assurée par `LICENSE.md` racine.

### Option B : SPDX uniquement dans les fichiers sensibles

Ajouter SPDX seulement aux modules critiques (sécurité, imports, exports,
ADRs, fichiers documentaires). Écarter pour les modules d'UI ou de calcul.

**Écartée** parce que :
- Choix arbitraire — quel critère « critique » ? La maintenance se complique.
- Génère un mélange (certains fichiers ont SPDX, d'autres non) qui est
  pire qu'une convention uniforme (tout ou rien).

### Option C : Adopter `scancode-toolkit` en GitHub Actions pour générer un BOM SPDX automatique

Ajouter un workflow `.github/workflows/sbom.yml` qui scanne le dépôt à
chaque push et publie un SBOM (Software Bill of Materials) au format
SPDX-JSON, attaché aux releases.

**Écartée pour cette phase** parce que :
- Overkill pour un projet pédagogique solo en Beta — le bénéfice (SBOM
  pour auditeurs institutionnels) n'est pas demandé actuellement.
- À reconsidérer si un auditeur institutionnel ou un avis juridique le
  demande explicitement.

### Option D : Adopter la norme REUSE complète

Inclure SPDX headers + fichier `LICENSES/AGPL-3.0-only.txt` standalone +
fichier `.reuse/dep5` pour les exceptions (libs vendored), passer le test
`reuse lint`.

**Écartée pour cette phase** parce que :
- Effort estimé ~4 heures + maintenance continue.
- Le standard REUSE n'est pas requis par les audits actuels.
- À reconsidérer si Labo Codex postule à une labellisation FSFE ou si
  un mainteneur futur le souhaite.

---

## Références

- **SPDX License Identifiers** — <https://spdx.dev/learn/handling-license-info/>
- **OpenSSF Scorecard License check** — <https://github.com/ossf/scorecard/blob/main/docs/checks.md#license>
- **REUSE specification (FSFE)** — <https://reuse.software/spec/>
- **ScanCode Toolkit** — <https://github.com/nexB/scancode-toolkit>
- **Référence audit interne** : `audit/PLAN-MOYEN-TERME.md` §5.4
  (branche `audit/2026-mai`).
- **ADR apparenté** : [`ADR-009`](009-licences.md) — choix de la double
  licence AGPL v3 + CC BY-NC-SA 4.0.
- **Document apparenté** : [`libs/VERSIONS.md`](../../libs/VERSIONS.md) —
  les 7 librairies tierces vendored et leurs licences respectives.

---

## Notes de révision

À mettre à jour si :

- Labo Codex est forké avec import de code d'origine différente.
- Une instance institutionnelle demande un BOM SPDX formel.
- Un auditeur externe identifie la dérogation comme bloquante.
- La maintenance passe à plusieurs personnes et un standard plus formel
  devient utile pour la coordination.

Sinon, à reconsidérer lors du **prochain audit annuel** (mai 2027,
cf. [`ADR-012`](012-audit-annuel.md)).

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011), <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions>
